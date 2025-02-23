import { NextResponse } from 'next/server';
import { createInvoice } from '@/lib/xendit';

// Helper function to verify Xendit webhook
function verifyWebhookSignature(headers) {
  try {
    // Log all headers for debugging
    console.log('All Headers:', headers);
    
    // Try different header cases since header names are case-insensitive
    const webhookToken = 
      headers.get('x-callback-token') || 
      headers.get('X-CALLBACK-TOKEN') || 
      headers.get('X-Callback-Token');
    
    const expectedToken = process.env.XENDIT_WEBHOOK_SECRET;

    console.log('=== XENDIT WEBHOOK VERIFICATION ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Webhook Token:', webhookToken);
    console.log('Expected Token:', expectedToken);

    // In development, if no token is present, allow the request
    if (process.env.NODE_ENV === 'development' && !webhookToken) {
      console.warn('Development mode: No webhook token present, allowing request');
      return true;
    }

    // In production, both tokens must be present
    if (!webhookToken || !expectedToken) {
      console.error('Missing webhook token or secret');
      console.error('Webhook Token present:', !!webhookToken);
      console.error('Expected Token present:', !!expectedToken);
      return false;
    }

    // Compare tokens
    const isValid = webhookToken === expectedToken;
    console.log('Token verification result:', isValid);
    return isValid;

  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validate the request body
    if (!body.amount || !body.description || !body.payerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a unique external ID
    const externalID = `invoice-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create invoice using Xendit
    const invoice = await createInvoice({
      externalID,
      amount: body.amount,
      description: body.description,
      payerEmail: body.payerEmail
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Payment API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle Xendit webhook notifications
export async function PUT(req) {
  try {
    // Log the incoming webhook
    console.log('=== XENDIT CALLBACK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // Get raw headers
    const rawHeaders = {};
    req.headers.forEach((value, key) => {
      rawHeaders[key] = value;
    });
    console.log('Raw Headers:', rawHeaders);

    const body = await req.json();
    console.log('Webhook payload:', JSON.stringify(body, null, 2));

    // Verify the webhook signature
    if (!verifyWebhookSignature(req.headers)) {
      console.error('Invalid webhook token');
      return NextResponse.json(
        { error: 'Invalid webhook token' },
        { status: 401 }
      );
    }

    // Handle different types of events
    const event = body.event;
    console.log('Processing event:', event);

    switch (event) {
      case 'invoice.paid':
        console.log('Invoice paid:', body);
        // Handle invoice payment
        break;
      case 'qr.payment':
        console.log('QR payment received:', body);
        // Handle QR payment
        break;
      case 'invoice.expired':
        console.log('Invoice expired:', body);
        // Handle expired invoice
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 
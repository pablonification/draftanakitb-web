import { NextResponse } from 'next/server';
import { createInvoice } from '@/lib/xendit';
import crypto from 'crypto';

// Helper function to verify Xendit webhook
function verifyWebhookSignature(requestBody, headerSignature) {
  try {
    const webhookSecret = process.env.XENDIT_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return false;
    }

    const computedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(requestBody))
      .digest('hex');

    return computedSignature === headerSignature;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
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
    const body = await req.json();
    const xenditSignature = req.headers.get('x-callback-signature');

    // Verify the webhook signature
    if (!xenditSignature || !verifyWebhookSignature(body, xenditSignature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Handle the webhook notification based on the event type
    const { event } = body;

    switch (event) {
      case 'invoice.paid':
        // Handle successful payment
        console.log('Payment successful:', body);
        // Add your payment success logic here
        break;
      case 'invoice.expired':
        // Handle expired invoice
        console.log('Invoice expired:', body);
        // Add your expired invoice logic here
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
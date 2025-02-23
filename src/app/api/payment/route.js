import { NextResponse } from 'next/server';
import { createInvoice } from '@/lib/xendit';

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
    const xenditHeader = req.headers.get('x-callback-token');

    // Verify the webhook signature
    if (xenditHeader !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Handle the webhook notification
    // You can update your database or trigger other actions here
    console.log('Received webhook:', body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 
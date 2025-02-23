const { createInvoice } = require('@/lib/xendit');
const { headers } = require('next/headers');

async function POST(req) {
  try {
    const body = await req.json();
    
    // Validate the request body
    if (!body.amount || !body.description || !body.payerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
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

    return new Response(
      JSON.stringify(invoice),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Payment API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function PUT(req) {
  try {
    const body = await req.json();
    const headersList = headers();
    const xenditHeader = headersList.get('x-callback-token');

    // Verify the webhook signature
    if (xenditHeader !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle the webhook notification
    console.log('Received webhook:', body);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

module.exports = {
  POST,
  PUT
}; 
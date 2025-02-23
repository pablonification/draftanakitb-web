const Xendit = require('xendit-node');

// Initialize Xendit client with your secret key
const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

// Create instances of Xendit's services that you'll use
const { Invoice } = xenditClient;
const xenditInvoice = new Invoice({});

// Example function to create an invoice
async function createInvoice(params) {
  try {
    const invoice = await xenditInvoice.createInvoice({
      externalID: params.externalID,
      amount: params.amount,
      description: params.description,
      payerEmail: params.payerEmail,
      shouldSendEmail: true,
      invoiceDuration: 86400, // 24 hours
      currency: 'IDR',
    });
    return invoice;
  } catch (error) {
    console.error('Xendit Invoice Creation Error:', error);
    throw error;
  }
}

module.exports = {
  createInvoice,
  xenditClient
}; 
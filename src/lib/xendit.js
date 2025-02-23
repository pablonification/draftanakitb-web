import Xendit from 'xendit-node';

// Initialize Xendit client with your secret key
const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
  // Optional: Set to true for development/staging environment
  xenditURL: process.env.NODE_ENV === 'development' ? 'https://api-dev.xendit.co' : 'https://api.xendit.co'
});

// Create instances of Xendit's services that you'll use
const { Invoice, Disbursement, Balance } = xenditClient;

// Export configured services
export const xenditInvoice = new Invoice({});
export const xenditDisbursement = new Disbursement({});
export const xenditBalance = new Balance({});

// Example function to create an invoice
export async function createInvoice(params) {
  try {
    const invoice = await xenditInvoice.createInvoice({
      externalID: params.externalID,
      amount: params.amount,
      description: params.description,
      payerEmail: params.payerEmail,
      shouldSendEmail: true,
      invoiceDuration: 86400, // 24 hours
      currency: 'IDR',
      // Add any other required parameters
    });
    return invoice;
  } catch (error) {
    console.error('Xendit Invoice Creation Error:', error);
    throw error;
  }
}

// Example function to check balance
export async function checkBalance() {
  try {
    const balance = await xenditBalance.getBalance({
      accountType: 'CASH',
      currency: 'IDR',
    });
    return balance;
  } catch (error) {
    console.error('Xendit Balance Check Error:', error);
    throw error;
  }
} 
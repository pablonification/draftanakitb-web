import Xendit from 'xendit-node';

// Initialize Xendit client with your secret key
const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || '',
});

// Create instances of Xendit's services that you'll use
const { Invoice, Disbursement, Balance } = xenditClient;

// Create invoice service
const createXenditInvoice = () => {
  return new xenditClient.Invoice({});
};

// Create invoice function
export async function createInvoice(params) {
  try {
    const invoiceService = createXenditInvoice();
    
    const invoice = await invoiceService.createInvoice({
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

// Create balance service
const createXenditBalance = () => {
  return new xenditClient.Balance({});
};

// Check balance function
export async function checkBalance() {
  try {
    const balanceService = createXenditBalance();
    
    const balance = await balanceService.getBalance({
      accountType: 'CASH',
      currency: 'IDR',
    });
    
    return balance;
  } catch (error) {
    console.error('Xendit Balance Check Error:', error);
    throw error;
  }
} 
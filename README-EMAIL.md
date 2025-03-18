# Email Configuration Guide

## Migrating from SMTP to Resend API

We've migrated from using SMTP to using Resend API for sending emails. This is due to DigitalOcean blocking SMTP traffic.

## Setup Instructions

1. Make sure the Resend npm package is installed:
```bash
npm install resend
```

2. Add your Resend API key to your environment variables:

Create or update your `.env.local` file with the following:
```
RESEND_API_KEY=re_Wz3nA7pk_8oFHxTduBCBD953ZNo6miSHt
```

## Testing the Email Implementation

You can verify the email implementation is working by running the test script:

```bash
node src/app/utils/testEmail.js
```

Make sure to update the test email address in the script before running it.

## Implementation Details

The email implementation is in two files:
- `src/app/utils/mailSender.js` - Used by the main application
- `src/app/api/otp/utils/mailSender.js` - Used by the API routes

Both files have been updated to use Resend API instead of SMTP.

## Sending Emails

To send an email using the updated implementation:

```javascript
const mailSender = require('./utils/mailSender');

async function sendEmail() {
  try {
    const email = 'recipient@example.com';
    const subject = 'Email Subject';
    const htmlBody = '<h1>Hello</h1><p>This is the email content</p>';
    
    const result = await mailSender(email, subject, htmlBody);
    console.log('Email sent:', result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
```

## Troubleshooting

If you encounter issues with sending emails:

1. Verify your API key is correctly set in the environment variables
2. Check the console logs for error messages
3. Make sure the Resend npm package is installed correctly
4. Verify you have proper internet connectivity
5. Check the Resend dashboard for more detailed logs 
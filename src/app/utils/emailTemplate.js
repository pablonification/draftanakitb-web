function generateEmailTemplate(otp) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'IBM Plex Mono', monospace;
            background-color: #000072;
            color: #ffffff;
          }
          h1, h2 {
            margin: 0;
            font-weight: 600;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .header {
            padding: 20px 0;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
          }
          .verification-code {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 4px;
            text-align: center;
            margin: 20px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .verification-code span {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #ffffff;
          }
          .footer {
            padding: 20px;
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <div class="container">
                <div class="header">
                  <h1>DraftAnakITB Verification</h1>
                </div>
                <h2 style="margin-bottom: 20px;">Verification Code</h2>
                <p style="font-size: 14px; line-height: 24px;">
                  Here is your verification code:
                </p>
                <div class="verification-code">
                  <span>${otp}</span>
                </div>
                <p style="font-size: 14px;">
                  This code will expire in 5 minutes.<br>
                  If you didn't request this code, please ignore this email.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>© 2024 DraftAnakITB. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
  
  export default generateEmailTemplate;

  export const generateTweetNotification = (tweetUrl) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Your Tweet Has Been Posted! 🎉</h2>
  <p>Hello!</p>
  <p>Your paid menfess has been successfully posted to our Twitter account.</p>
  <p>You can view your tweet here: <a href="${tweetUrl}">${tweetUrl}</a></p>
  <p>Thank you for using our service!</p>
  <p>Best regards,<br>DraftAnakITB Team</p>
  <hr>
  <p style="font-size: 12px; color: #666;">
    Note: If you have any issues, please contact us on Twitter @satpam_itb
  </p>
</body>
</html>
`;
function generateEmailTemplate(otp) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Open Sans', Arial, sans-serif;
                background-color: #f5f5f5;
                color: #333333;
            }
            h1, h2 {
                margin: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
                background-color: #1565c0;
                padding: 20px 0;
                text-align: center;
            }
            .header h1 {
                color: #ffffff;
            }
            .verification-code {
                background-color: #e3f2fd;
                padding: 15px;
                border-radius: 4px;
                text-align: center;
                margin: 20px 0;
            }
            .verification-code span {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #1565c0;
            }
            .footer {
                padding: 20px;
                text-align: center;
                color: #666666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td class="header">
                    <h1>DraftAnakITB Verification</h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 40px 20px;">
                    <div class="container">
                        <h2 style="color: #1565c0; margin-bottom: 20px;">Verification Code</h2>
                        <p style="font-size: 16px; line-height: 24px;">
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

module.exports = generateEmailTemplate;
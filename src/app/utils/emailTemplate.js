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
          h1, h2, h3 {
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
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 20px;
          }
          .verification-code {
            background-color: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .verification-code span {
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #00ff00;
            text-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
          }
          .info-box {
            background-color: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .warning-text {
            color: #ffcc00;
            font-size: 14px;
          }
          .footer {
            padding: 20px;
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
            font-size: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 20px;
          }
          .social-links {
            margin-top: 15px;
          }
          .social-links a {
            color: #ffffff;
            text-decoration: none;
            margin: 0 10px;
          }
          .steps {
            margin: 20px 0;
            padding-left: 20px;
          }
          .steps li {
            margin: 10px 0;
            color: rgba(255, 255, 255, 0.9);
          }
          .logo {
            width: 120px;
            height: auto;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <div class="container">
                <div class="header">
                  <img src="cid:logo" alt="DraftAnakITB Logo" class="logo" />
                  <p style="margin-top: 10px; color: rgba(255, 255, 255, 0.7);">
                    Kode OTP untuk Verifikasi Email
                  </p>
                </div>

                <div class="content">
                  <p>Halo! 👋</p>
                  <p>Terima kasih telah menggunakan DraftAnakITB Menfess. Berikut adalah kode OTP untuk verifikasi email kamu:</p>

                  <div class="verification-code">
                    <span>${otp}</span>
                  </div>

                  <div class="info-box">
                    <h3>Petunjuk Verifikasi</h3>
                    <ol class="steps">
                      <li>Masukkan kode OTP di atas ke dalam form verifikasi</li>
                      <li>Pastikan kode dimasukkan dengan benar</li>
                      <li>Klik tombol "Verify" untuk melanjutkan</li>
                    </ol>
                  </div>

                  <div class="info-box">
                    <h3>Informasi Penting</h3>
                    <ul class="steps">
                      <li>Kode OTP akan kadaluarsa dalam <span class="warning-text">5 menit</span></li>
                      <li>Jangan bagikan kode ini dengan siapapun</li>
                      <li>Kode hanya dapat digunakan satu kali</li>
                      <li>Jika kode kadaluarsa, kamu bisa meminta kode baru</li>
                    </ul>
                  </div>

                  <div class="info-box">
                    <h3>Butuh Bantuan?</h3>
                    <p>Jika mengalami masalah dengan verifikasi, kamu bisa:</p>
                    <ul class="steps">
                      <li>Klik tombol "Resend OTP" di website</li>
                      <li>DM admin di @satpam_itb</li>
                      <li>Cek FAQ di website kami</li>
                    </ul>
                  </div>

                  <p class="warning-text" style="margin-top: 20px;">
                    Jika kamu tidak merasa meminta kode ini, abaikan email ini.
                  </p>
                </div>

                <div class="footer">
                  <p>© 2024 DraftAnakITB. All rights reserved.</p>
                  <div class="social-links">
                    <a href="https://twitter.com/DraftAnakITB" target="_blank">Twitter</a> |
                    <a href="https://draftanakitb.tech" target="_blank">Website</a>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
}

export default generateEmailTemplate;

export const generateTweetNotification = (tweetUrl, tweet) => `
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
    h1, h2, h3 {
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
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 20px;
    }
    .tweet-preview {
      background-color: rgba(255, 255, 255, 0.05);
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .tweet-link {
      background-color: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
      text-align: center;
    }
    .tweet-link a {
      color: #ffffff;
      text-decoration: none;
      padding: 10px 20px;
      background-color: rgba(29, 161, 242, 0.2);
      border-radius: 20px;
      display: inline-block;
      transition: background-color 0.3s;
    }
    .tweet-link a:hover {
      background-color: rgba(29, 161, 242, 0.3);
    }
    .info-box {
      background-color: rgba(255, 255, 255, 0.05);
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .footer {
      padding: 20px;
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: 20px;
    }
    .social-links {
      margin-top: 15px;
    }
    .social-links a {
      color: #ffffff;
      text-decoration: none;
      margin: 0 10px;
    }
    .highlight {
      color: #00ff00;
      font-weight: bold;
    }
    .logo {
      width: 120px;
      height: auto;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <div class="container">
          <div class="header">
            <img src="cid:logo" alt="DraftAnakITB Logo" class="logo" />
            <h1>DraftAnakITB Notification</h1>
            <p style="margin-top: 10px; color: rgba(255, 255, 255, 0.7);">
              Paid Menfess Successfully Posted! ✨
            </p>
          </div>
          
          <div class="content">
            <p>Halo! 👋</p>
            <p>Paid menfess kamu sudah berhasil diposting ke Twitter/X. Terima kasih sudah menggunakan layanan kami!</p>
            
            <div class="tweet-link">
              <h3 style="margin-bottom: 15px;">Lihat Tweet Kamu</h3>
              <a href="${tweetUrl}" target="_blank">Buka di Twitter/X</a>
            </div>

            <div class="info-box">
              <h3>Informasi Penting</h3>
              <ul style="padding-left: 20px; margin: 10px 0;">
                <li>Tweet kamu sudah terposting dan bisa dilihat oleh orang lain</li>
                <li>Kamu bisa melihat tweet dengan mengklik link di atas</li>
                <li>Untuk menfess berikutnya, kamu bisa langsung menggunakan layanan paid menfess lagi</li>
                <li>Paid menfess tidak memiliki batasan harian</li>
              </ul>
            </div>

            <div class="info-box">
              <h3>Fitur Paid Menfess</h3>
              <ul style="padding-left: 20px; margin: 10px 0;">
                <li>Support gambar (JPG, PNG, GIF max 1MB)</li>
                <li>Support video (MP4, 60s, 720p, max 5MB)</li>
                <li>Tidak ada batasan tweet harian</li>
                <li>Pengiriman terjadwal 20.00-22.00 WIB</li>
              </ul>
            </div>

            <div class="info-box">
              <h3>Butuh Bantuan?</h3>
              <p>Jika ada pertanyaan atau masalah, kamu bisa:</p>
              <ul style="padding-left: 20px; margin: 10px 0;">
                <li>DM admin di @satpam_itb</li>
                <li>Cek FAQ di website kami</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>© 2024 DraftAnakITB. All rights reserved.</p>
            <div class="social-links">
              <a href="https://twitter.com/DraftAnakITB" target="_blank">Twitter</a> |
              <a href="https://draftanakitb.tech" target="_blank">Website</a>
            </div>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const generatePaymentConfirmation = () => `
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
    .time-slots {
      background-color: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
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
            <h1>DraftAnakITB Payment</h1>
          </div>
          <h2 style="margin-bottom: 20px;">Payment Confirmed! 🎉</h2>
          <p>Your paid menfess will be posted during our designated time slots:</p>
          
          <div class="time-slots">
            <ul>
              <li>8 PM WIB</li>
              <li>10 PM WIB</li>
            </ul>
            <p>Note: Posting time is randomly selected for better engagement.</p>
          </div>
          
          <p>If your message is not posted within 24 hours, please contact @satpam_itb on Twitter.</p>
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
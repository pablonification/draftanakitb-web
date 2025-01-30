import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const mailSender = async (email, title, body) => {
  try {
    // Path to PFX certificate and logo
    const pfxPath = path.join(process.cwd(), 'public', 'certificate.pfx');
    const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');
    
    const pfx = fs.readFileSync(pfxPath);
    const logo = fs.readFileSync(logoPath);

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false, // Use true for port 465, false for others
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        pfx: pfx,
        passphrase: process.env.MAIL_PASSPHRASE, // Update the passphrase in .env.local
      },
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"DraftAnakITB" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
      attachments: [{
        filename: 'logo.jpg',
        content: logo,
        cid: 'logo' // Same cid value as mentioned in the email template
      }]
    });

    console.log('Email sent:', info);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
};

export default mailSender;
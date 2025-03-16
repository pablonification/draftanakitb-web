import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Retry function with exponential backoff
const retry = async (fn, retries = 2, delay = 1000, multiplier = 2) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Retrying operation in ${delay}ms, remaining retries: ${retries}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retry(fn, retries - 1, delay * multiplier, multiplier);
  }
};

const mailSender = async (email, title, body) => {
  try {
    console.log(`Preparing to send email to ${email}`);
    
    // Path to PFX certificate and logo
    const pfxPath = path.join(process.cwd(), 'public', 'certificate.pfx');
    const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');
    
    // Read files with error handling
    let pfx, logo;
    try {
      pfx = fs.readFileSync(pfxPath);
      console.log('Certificate loaded successfully');
    } catch (certError) {
      console.error('Error reading certificate:', certError);
      // Continue without certificate in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Continuing without certificate in development mode');
      } else {
        throw new Error('Failed to load certificate');
      }
    }
    
    try {
      logo = fs.readFileSync(logoPath);
      console.log('Logo loaded successfully');
    } catch (logoError) {
      console.error('Error reading logo:', logoError);
      // Continue without logo
      console.log('Continuing without logo attachment');
    }

    console.log('Creating email transport');
    
    // Create transporter with connection timeout options
    const transporterOptions = {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false, // Use true for port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,    // 5 seconds
      socketTimeout: 10000,     // 10 seconds
    };
    
    // Only add TLS options if certificate is available
    if (pfx) {
      transporterOptions.tls = {
        pfx: pfx,
        passphrase: process.env.MAIL_PASSPHRASE,
      };
    }
    
    const transporter = nodemailer.createTransport(transporterOptions);
    
    // Verify connection first
    try {
      await transporter.verify();
      console.log('Email transport verified successfully');
    } catch (verifyError) {
      console.error('Email transport verification failed:', verifyError);
      throw new Error('Email service unavailable');
    }

    // Create mail options
    const mailOptions = {
      from: `"DraftAnakITB" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    };
    
    // Add logo attachment if available
    if (logo) {
      mailOptions.attachments = [{
        filename: 'logo.jpg',
        content: logo,
        cid: 'logo' // Same cid value as mentioned in the email template
      }];
    }

    console.log('Sending email with retry logic');
    
    // Send mail with retry logic
    const info = await retry(async () => {
      return await transporter.sendMail(mailOptions);
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    
    // Provide more meaningful error based on error type
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Mail server connection refused');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Mail server connection timed out');
    } else if (error.code === 'EAUTH') {
      throw new Error('Authentication error with mail server');
    } else {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
};

export default mailSender;
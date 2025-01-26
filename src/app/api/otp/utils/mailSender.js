const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const mailSender = async (email, title, body) => {
    try {
        // Read the PFX certificate file
        const pfxPath = path.join(__dirname, 'certificate.pfx'); // Update this path
        const pfx = fs.readFileSync(pfxPath);

        // Create a transporter
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false, // Use true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            tls: {
                pfx: pfx,
                passphrase: 'iOOma$@k0YsKq2L8CP' // Update this with your PFX password
            }
        });

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"DraftAnakITB" <${process.env.MAIL_USER}>`, // Ensure the from field is correctly set
            to: email,
            subject: title,
            html: body
        });
        console.log('Email info:', info);
        return info;
    } catch (error) {
        console.log(error.message);
        return null;
    }
};

module.exports = mailSender;
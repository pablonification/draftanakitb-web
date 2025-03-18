const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);

const mailSender = async (email, title, body) => {
    try {
        console.log(`Preparing to send email to ${email}`);
        
        const { data, error } = await resend.emails.send({
            from: 'DraftAnakITB <noreply@draftanakitb.tech>',
            to: email,
            subject: title,
            html: body,
        });

        if (error) {
            console.error('Error sending email:', error);
            throw error;
        }

        console.log('Email sent successfully:', data.id);
        return data;
    } catch (error) {
        console.error('Failed to send email:', error);
        return null;
    }
};

module.exports = mailSender;
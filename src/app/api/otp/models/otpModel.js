const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const generateEmailTemplate = require('../utils/emailTemplate');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60*5 // 5 minutes
    }


});

// Send OTP to the user's email
async function sendVerificationEmail(email, otp){
    try {
        const mailResponse = await mailSender(
            email,
            'DraftAnakITB - Verification Code',
            generateEmailTemplate(otp)
        );
        console.log("Email sent successfully", mailResponse);
    } catch (error) {
        console.error("Error sending email", error);
        throw error;
    }
}
otpSchema.pre('save', async function(next){
    console.log("New document saved to the database");
    // only send email if the document is new
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }

});

module.exports = mongoose.model('OTP', otpSchema);
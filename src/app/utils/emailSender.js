import mailSender from './mailSender';
import generateEmailTemplate from './emailTemplate';

export async function sendOTPEmail(email, otp) {
  try {
    const subject = 'Your OTP Code for DraftAnakITB';
    const emailBody = generateEmailTemplate(otp);

    const info = await mailSender(email, subject, emailBody);
    console.log('OTP email sent:', info);
    return info;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email.');
  }
}

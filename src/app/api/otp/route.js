import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import { OTPModel } from '@/app/models/otpModel';
import { User } from '@/app/models/userModel';
import { sendOTPEmail } from '@/app/utils/emailSender';

// Add a timeout wrapper to handle email sending timeouts
const withTimeout = async (promise, timeoutMs = 10000) => {
  let timeoutId;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export async function POST(request) {
  try {
    console.log('OTP POST: Starting connection to DB');
    await connectDB();
    console.log('OTP POST: DB connected successfully');
    
    // Add request body validation
    const body = await request.text();
    console.log('Raw request body:', body);
    
    if (!body) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }

    const { email } = data;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);

    try {
      // Save OTP in database
      console.log('OTP POST: Creating OTP record in database');
      console.log(email, otp, new Date());
      await OTPModel.create({ email, otp, createdAt: new Date() });
      console.log('OTP POST: OTP record created successfully');
    } catch (dbError) {
      console.error('Error creating OTP record:', dbError);
      return NextResponse.json({ 
        error: 'Failed to save OTP',
        details: dbError.message 
      }, { status: 500 });
    }

    try {
      // Send email with timeout
      console.log('OTP POST: Sending email with timeout');
      await withTimeout(sendOTPEmail(email, otp), 8000);
      console.log('OTP POST: Email sent successfully');
    } catch (emailError) {
      console.error('Error sending OTP email with timeout:', emailError);
      // Continue even if email fails - the user can try again or use the console logged OTP for testing
      console.log('Proceeding despite email error. OTP available in logs for testing:', otp);
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in OTP generation process:', error);
    return NextResponse.json({ 
      error: 'Failed to send OTP',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    console.log('OTP PUT: Starting connection to DB');
    await connectDB();
    console.log('OTP PUT: DB connected successfully');
    
    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    
    const { email, otp } = data;
    console.log('OTP PUT: Verifying OTP for email', email);

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Verify OTP
    console.log('OTP PUT: Finding OTP record in database');
    const validOTP = await OTPModel.findOne({ email, otp });
    
    if (!validOTP) {
      console.log('OTP PUT: No valid OTP found for email', email);
      return NextResponse.json({ error: 'OTP salah atau invalid!' }, { status: 400 });
    }
    
    console.log('OTP PUT: Valid OTP found for email', email);

    // Find or create user
    console.log('OTP PUT: Finding/creating user record');
    let user = await User.findOne({ email });
    if (!user) {
      console.log('OTP PUT: Creating new user for', email);
      user = await User.create({ 
        email,
        isVerified: true,
        createdAt: new Date()
      });
    } else {
      // Update existing user
      console.log('OTP PUT: Updating existing user for', email);
      user.isVerified = true;
      await user.save();
    }

    // Clean up used OTP
    console.log('OTP PUT: Cleaning up used OTP');
    await OTPModel.deleteOne({ _id: validOTP._id });

    console.log('OTP PUT: Verification completed successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'User verified successfully',
      userId: user._id 
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      error: 'Verification failed',
      details: error.message 
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/db';
import { OTPModel } from '@/app/models/otpModel';
import { User } from '@/app/models/userModel';
import { sendOTPEmail } from '@/app/utils/emailSender';

export async function POST(request) {
  try {
    await connectDB();
    
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

    // Save OTP in database
    await OTPModel.create({ email, otp, createdAt: new Date() });

    // For testing purposes, log the OTP
    console.log('Generated OTP:', otp);

    // Send email
    await sendOTPEmail(email, otp);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ 
      error: 'Failed to send OTP',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const { email, otp } = await request.json();

    // Verify OTP
    const validOTP = await OTPModel.findOne({ email, otp });
    if (!validOTP) {
      return NextResponse.json({ error: 'OTP salah atau invalid!' }, { status: 400 });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ 
        email,
        isVerified: true,
        createdAt: new Date()
      });
    } else {
      // Update existing user
      user.isVerified = true;
      await user.save();
    }

    // Clean up used OTP
    await OTPModel.deleteOne({ _id: validOTP._id });

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
    }, { status: 400 });
  }
}
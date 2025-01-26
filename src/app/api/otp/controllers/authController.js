const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const OTP = require('../models/otpModel');

exports.signup = async (req, res) => {
    try {
        const {senderID, email, messageCount, verifyState} = req.body;
        // check if all details are provided
        if(!senderID || !email || !messageCount || !verifyState){
            return res.status(400).json({
                success: false,
                message: "All details are required"
            });
        }
        // check if the email is already registered
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }
        // Find most recent OTP for the email
        const response = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        if (response.length === 0 || otp !== response[0].otp) {
            return res.status(400).json({
                success: false,
                message: "The OTP is not valid."
            });
        }
        const nemUser = await User.create({
            senderID,
            email,
            messageCount,
            verifyState
        });
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: nemUser
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }

}

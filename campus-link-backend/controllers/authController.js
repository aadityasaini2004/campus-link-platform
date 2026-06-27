const User = require('../models/User');
const OTP = require('../models/OTP');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. Generate & Send OTP
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const domain = email.split('@')[1];

        // Domain Validation Regex/Logic
        if (domain !== 'krmu.edu.in' && domain !== 'krmangalam.edu.in' && email !== 'admin.ao@krmu.edu.in') {
             return res.status(403).json({ message: 'Unauthorized domain. Please use your official university email.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already registered. Please login.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to Database (Will expire in 5 mins due to TTL)
        await OTP.create({ email, otp });

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Campus Link - Your Registration OTP',
            html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2>Campus Link Verification</h2>
                    <p>Your One-Time Password for registration is:</p>
                    <h1 style="color: #10b981; letter-spacing: 5px;">${otp}</h1>
                    <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
                   </div>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent successfully to your email.' });

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: 'Error sending OTP.' });
    }
};

// 2. Verify OTP & Register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        // Verify OTP
        const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 }); // Get latest OTP
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Assign Role Based on Domain
        const domain = email.split('@')[1];
        let assignedRole = 'Student'; // Default
        if (domain === 'krmangalam.edu.in') assignedRole = 'Faculty';
        if (email === 'admin.ao@krmu.edu.in') assignedRole = 'AO';

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: assignedRole
        });

        // Delete OTP after successful registration
        await OTP.deleteMany({ email });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// 3. Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find User
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please register first.' });
        }

        // Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if(user.is2FAEnabled) {
            return res.status(200).json({
                requires2FA: true,
                email: user.email
            });
        }

        // Send Token
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

const setup2FA = async (req, res) => {
    try {
        // 1. Generate a secure secret
        const secret = speakeasy.generateSecret({
            name: `CampusLink (${req.user.email})` // This name shows up in the Authenticator App
        });

        // 2. Save the secret to the user's database record temporarily
        // We don't set is2FAEnabled to true yet, because they haven't verified it works!
        await User.findByIdAndUpdate(req.user._id, {
            twoFactorSecret: secret.base32
        });

        // 3. Generate a QR Code URL from the secret's otpauth_url
        QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) {
                return res.status(500).json({ message: 'Error generating QR code' });
            }
            
            // Send the QR code image URL back to the frontend
            res.status(200).json({
                secret: secret.base32,
                qrCode: data_url
            });
        });

    } catch (error) {
        console.error('2FA Setup Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const verify2FASetup = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user._id);

        // 🔥 FIX 1: Remove any hidden spaces from the token
        const cleanToken = token.replace(/\s+/g, '');

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: cleanToken,
            window: 1 // 🔥 FIX 2: Gives a +/- 30-second grace period!
        });

        if (verified) {
            user.is2FAEnabled = true;
            await user.save();
            res.status(200).json({ message: '2FA has been successfully enabled!' });
        } else {
            res.status(400).json({ message: 'Invalid 6-digit code. Please try again.' });
        }
    } catch (error) {
        console.error('2FA Verification Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const verifyLogin2FA = async (req, res) => {
    try {
        const { email, token } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.is2FAEnabled) {
            return res.status(400).json({ message: '2FA is not set up for this account.' });
        }

        // 🔥 FIX 1: Remove any hidden spaces
        const cleanToken = token.replace(/\s+/g, '');

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: cleanToken,
            window: 1 // 🔥 FIX 2: Grace period for login verification
        });

        if (verified) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id) // Ensure generateToken exists here
            });
        } else {
            res.status(400).json({ message: 'Invalid Authenticator code.' });
        }
    } catch (error) {
        console.error('Login 2FA Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = { sendOTP, registerUser, loginUser, setup2FA, verify2FASetup, verifyLogin2FA };
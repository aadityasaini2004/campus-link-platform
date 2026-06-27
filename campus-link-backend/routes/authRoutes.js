const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    setup2FA, 
    verify2FASetup, 
    verifyLogin2FA, 
    sendOTP
} = require('../controllers/authController');

const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post('/send-otp', sendOTP);

//  2FA routes
router.post('/setup-2fa', protect, setup2FA); // Generate QR
router.post('/verify-2fa-setup', protect, verify2FASetup); // Confirm Setup
router.post('/verify-login-2fa', verifyLogin2FA); // Verify during login


module.exports = router;
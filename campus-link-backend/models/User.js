const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    twoFactorSecret: {
        type: String,
        default: null
    },

    is2FAEnabled: {
        type: Boolean,
        defult: false
    },

    role: {
        type: String,
        enum: ['Student', 'Faculty', 'DepartmentStaff', 'AO'],
        default: 'Student'
    },
    // We store the Microsoft OAuth ID here once they log in
    microsoftId: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
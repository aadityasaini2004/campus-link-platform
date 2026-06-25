const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    // Tumhare original fields
    issueType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true 
    },
    status: {
        type: String,
        enum: ['Open', 'Assigned', 'Currently Working', 'Resolved'],
        default: 'Open'
    },
    isHighPriority: {
        type: Boolean,
        default: false
    },
    raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // 🔥 Naye additions for advanced AI matching & tracking
    requiredSkills: [{ 
        type: String 
    }], 
    contributionPoints: { 
        type: Number, 
        default: 10 
    }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
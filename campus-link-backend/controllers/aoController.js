const Department = require('../models/Department');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// @desc    Create a new Department
// @route   POST /api/ao/departments
// @access  Private (Strictly AO)
const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        const departmentExists = await Department.findOne({ name });
        if (departmentExists) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        const department = await Department.create({
            name,
            description,
            createdBy: req.user._id // The logged-in AO's ID
        });

        res.status(201).json({ message: 'Department created successfully', department });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all tickets (with populated details)
// @route   GET /api/ao/tickets
// @access  Private (Strictly AO)
const getAllTickets = async (req, res) => {
    try {
        // Fetch tickets and populate the references so we get names instead of just ObjectIDs
        const tickets = await Ticket.find()
            .populate('raisedBy', 'name email role')
            .populate('department', 'name')
            .populate('assignedTo', 'name email')
            .sort({ isHighPriority: -1, createdAt: -1 }); // Sort by priority first, then newest

        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Assign a ticket to a department and staff member
// @route   PUT /api/ao/tickets/:id/assign
// @access  Private (Strictly AO)
const assignTicket = async (req, res) => {
    try {
        const { departmentId, assignedToId } = req.body;
        const ticketId = req.params.id;

        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Verify the staff member exists and has the right role
        if (assignedToId) {
            const staff = await User.findById(assignedToId);
            if (!staff || staff.role !== 'DepartmentStaff') {
                return res.status(400).json({ message: 'Invalid staff member selected' });
            }
        }

        // Update the ticket
        ticket.department = departmentId || ticket.department;
        ticket.assignedTo = assignedToId || ticket.assignedTo;
        ticket.status = 'Assigned'; // Update status automatically

        const updatedTicket = await ticket.save();

        res.status(200).json({ 
            message: 'Ticket assigned successfully', 
            ticket: updatedTicket 
        });

    } catch (error) {
        console.error('Error assigning ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const addStaff = async (req, res) => {
    try {
        const { name, email } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists!' });
        }

        const defaultPassword = 'StaffPassword123!';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        const staff = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'DepartmentStaff'
        });

        // 🔥 MAIL BHEJNE KA LOGIC
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Apni .env file mein email aur App Password zaroor check karna
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Campus Link - Staff Account Created',
            html: `
                <h3>Hello ${name},</h3>
                <p>Your staff account for Campus Link Support has been created by the Admin.</p>
                <p><strong>Login Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${defaultPassword}</p>
                <p>Please login to your dashboard to view assigned tickets.</p>
            `
        };

        // Mail bhej do background mein
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log("Problem while sending email:", error);
            else console.log("Email Send successful:", info.response);
        });

        res.status(201).json({ success: true, message: 'Staff member created & Email sent!' });

    } catch (error) {
        console.error('Error adding staff:', error);
        res.status(500).json({ message: 'Server error while adding staff' });
    }
};

// 🔥 NAYA: Dropdown mein dikhane ke liye saare staff nikalne ka function
const getStaffList = async (req, res) => {
    try {
        // Sirf DepartmentStaff role walo ko dhoondo
        const staffList = await User.find({ role: 'DepartmentStaff' }).select('-password');
        res.status(200).json(staffList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff list' });
    }
};

module.exports = { createDepartment, getAllTickets, assignTicket, addStaff, getStaffList };
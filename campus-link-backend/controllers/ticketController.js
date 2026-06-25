const Ticket = require('../models/Ticket');

const createTicket = async (req, res) => {
    try {
        const { issueType, description, location, isHighPriority } = req.body;

        if (!issueType || !description || !location) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        let priorityFlag = false;
        if (req.user.role === 'Faculty' && isHighPriority === true) {
            priorityFlag = true;
        }

        const ticket = await Ticket.create({
            issueType,
            description,
            location,
            isHighPriority: priorityFlag,
            raisedBy: req.user._id
        });

        res.status(201).json({
            message: 'Ticket raised successfully',
            ticket
        });

    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Server error while creating ticket' });
    }
};

const resolveTicket = async(req, res) => {
    try {
        const ticketId = req.params.id;
        
        const ticket = await Ticket.findById(ticketId); 

        if(!ticket) {
            return res.status(404).json({message: 'Ticket not found!'});
        }

        if(req.user.role === 'DepartmentStaff' && ticket.assignedTo && ticket.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: "You can only resolve tickets assigned to you!"});
        }

        ticket.status = 'Resolved';
        const updatedTicket = await ticket.save();
        

        res.status(200).json({
            message: "Ticket Resolved Successfully!",
            ticket: updatedTicket,
        });
    } catch (error) {
        console.error("Error while resolving ticket: ", error);
        res.status(500).json({message: 'Server Error'});
    }
};


const getMyTickets = async (req, res) => {
    try {
        // .exec() lagane se promise chain ekdum perfect chalegi
        const tickets = await Ticket.find({ raisedBy: req.user._id })
                                    .sort({ createdAt: -1 })
                                    .exec();
        
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error while fetching tickets:', error);
        res.status(500).json({ message: 'Server error while fetching tickets' });
    }
};


const getAllTickets = async (req, res) => {
    try {
        // 🔥 NAYA: .populate() add kiya taaki ID ki jagah poori User info mile
        const tickets = await Ticket.find()
            .populate('raisedBy', 'name email') 
            .sort({ createdAt: -1 })
            .exec();
            
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching all tickets:', error);
        res.status(500).json({ message: 'Error fetching all tickets' });
    }
};

const assignTicket = async (req, res) => {
    try {
        const { staffId } = req.body;
        
        if (!staffId) {
            return res.status(400).json({ message: 'Staff ID is required' });
        }

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { assignedTo: staffId, status: 'Assigned' },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json({ message: 'Ticket assigned successfully!', ticket });
    } catch (error) {
        console.error('Backend Error assigning ticket:', error);
        res.status(500).json({ message: 'Internal Server Error while assigning ticket' });
    }
};


const getAssignedTickets = async (req, res) => {
    try {
        // Find tickets where assignedTo matches the logged-in staff's ID
        const tickets = await Ticket.find({ assignedTo: req.user._id })
            .populate('raisedBy', 'name email role')
            .sort({ updatedAt: -1 }); 
            
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching assigned tickets:', error);
        res.status(500).json({ message: 'Error fetching assigned tickets' });
    }
};

const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        // Ensure only valid statuses are saved
        const validStatuses = ['Open', 'Assigned', 'Currently Working', 'Resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json({ message: `Ticket status updated to ${status}`, ticket });
    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({ message: 'Internal Server Error while updating status' });
    }
};

module.exports = { createTicket, resolveTicket, getMyTickets, getAllTickets, assignTicket, getAssignedTickets, updateTicketStatus };
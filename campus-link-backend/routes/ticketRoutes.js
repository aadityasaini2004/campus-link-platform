const express = require('express');
const router = express.Router();
const { createTicket, resolveTicket, getMyTickets, getAllTickets, assignTicket } = require('../controllers/ticketController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, authorize('Student', 'Faculty'), createTicket);


router.get('/faculty-dashboard', protect, authorize('Faculty'), (req, res) => {
    res.json({ message: "Strictly for Faculty only" });
});

router.get('/ao-dashboard', protect, authorize('AO'), (req, res) => {
    res.json({ message: "Strictly for AO only" });
});

router.get('/my-tickets', protect, getMyTickets);

router.put('/:id/resolve', protect, authorize('DepartmentStaff', 'AO'), resolveTicket);

router.get('/all', protect, authorize('AO'), getAllTickets);
router.put('/:id/assign', protect, authorize('AO'), assignTicket);

module.exports = router;
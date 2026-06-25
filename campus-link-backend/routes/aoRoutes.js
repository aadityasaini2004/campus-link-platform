const express = require('express');
const router = express.Router();
const { createDepartment, getAllTickets, assignTicket, addStaff, getStaffList } = require('../controllers/aoController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// ALL routes in this file require the user to be logged in AND have the 'AO' role
router.use(protect);
router.use(authorize('AO'));

// Department Management
router.post('/departments', createDepartment);

// Ticket Management
router.get('/tickets', getAllTickets);
router.put('/tickets/:id/assign', assignTicket);

// staff managment
router.post('/add-staff', authorize('AO'), addStaff);
router.get('/staff-list', protect, authorize('AO'), getStaffList);

module.exports = router;
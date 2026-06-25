const express = require('express');
const dotenv = require('dotenv');

// 👇 1. Sabse pehle .env variables ko load karo!
dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');

// 👇 2. Ab routes aur db import karo (kyunki ab inko .env ka data mil jayega)
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const aoRoutes = require('./routes/aoRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Campus Link API is running...');
});

// Routing
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/ao', aoRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});
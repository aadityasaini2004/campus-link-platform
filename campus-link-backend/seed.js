const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); // 🔥 Bcrypt import kiya
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const seedAdmin = async () => {
    try {
        // 1. Purane plain-text AO accounts ko clear kar do taaki error na aaye
        await User.deleteMany({ role: 'AO' });
        console.log('🧹 Cleared old AO accounts');

        // 2. Password ko manually hash karo
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456!', salt);

        // 3. Naya user create karo with Hashed Password
        const aoUser = await User.create({
            name: 'Aaditya Saini',
            email: 'admin.ao@krmangalam.edu.in',
            password: hashedPassword, // 🔥 Hashed password jayega yahan
            role: 'AO'
        });

        console.log('✅ Admin Office successfully seeded with HASHED password!');
        console.log(`Email: ${aoUser.email} | Password: 123456!`);
        process.exit();

    } catch (error) {
        console.error(`❌ Error seeding database: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
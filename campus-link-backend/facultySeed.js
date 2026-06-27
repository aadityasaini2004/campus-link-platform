const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Check your path
const connectDB = require('./config/db'); // Check your path

dotenv.config();
connectDB();

const seedFaculty = async () => {
    try {
        // 1. Delete your old manual entry
        await User.deleteOne({ email: 'suman@krmangalam.edu.in' });
        console.log('🧹 Cleared old manual entry');

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // 3. Create the proper Faculty user
        const facultyUser = await User.create({
            name: 'Suman_KD',
            email: 'suman@krmangalam.edu.in',
            password: hashedPassword,
            role: 'Faculty'
        });

        console.log('✅ Faculty successfully created with a HASHED password!');
        console.log(`Email: ${facultyUser.email} | Password: 123456`);
        process.exit();

    } catch (error) {
        console.error(`❌ Error seeding database: ${error.message}`);
        process.exit(1);
    }
};

seedFaculty();
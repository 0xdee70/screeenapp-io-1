const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function createMasterAdmin() {
    try {
        const masterAdminEmail = 'masteradmin@example.com';
        const masterAdminPassword = 'MasterAdmin123!';

        const existingUser = await User.findOne({ email: masterAdminEmail });
        if (existingUser) {
            console.log('Master Admin already exists');
            mongoose.connection.close();
            return;
        }

        // const hashedPassword = await bcrypt.hash(masterAdminPassword, 10);

        const masterAdmin = new User({
            email: masterAdminEmail,
            password: masterAdminPassword,
            role: 'master_admin',
            isActive: true
        });

        await masterAdmin.save();
        console.log('Master Admin created successfully');
    } catch (error) {
        console.error('Error creating Master Admin:', error);
    } finally {
        mongoose.connection.close();
    }
}

createMasterAdmin();
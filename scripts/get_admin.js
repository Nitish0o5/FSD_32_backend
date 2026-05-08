import mongoose from 'mongoose';
import User from '../Models/userModel.js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminUsers = await User.find({ role: 'admin' }).select('+password');
        console.log('Admin Users:', adminUsers);
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

checkAdmin();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function resetHappyPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ phone: '+91 9554776382' });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Found user:', user.firstName, user.lastName);
    
    // Hash new password properly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Update password directly
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    
    console.log('Password reset successfully');
    
    // Test the password
    const updatedUser = await User.findById(user._id);
    const isMatch = await bcrypt.compare('password123', updatedUser.password);
    console.log('Password test result:', isMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetHappyPassword();
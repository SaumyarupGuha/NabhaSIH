const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'pharmacist', 'admin'],
    required: true
  },
  village: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: function() { return this.role === 'patient'; }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: function() { return this.role === 'patient'; }
  },
  // Doctor specific fields
  license: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  specialization: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  hospital: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  // Pharmacist specific fields
  pharmacyName: {
    type: String,
    required: function() { return this.role === 'pharmacist'; }
  },
  pharmacyAddress: {
    type: String,
    required: function() { return this.role === 'pharmacist'; }
  },
  isVerified: {
    type: Boolean,
    default: function() { return this.role === 'patient'; }
  },
  avatar: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
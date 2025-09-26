const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Order = require('../models/Order');
require('dotenv').config();

async function seedPatientData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find a patient user (or create one)
    let patient = await User.findOne({ role: 'patient' });
    if (!patient) {
      patient = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+91 9999999999',
        password: 'password123',
        role: 'patient',
        village: 'Nabha',
        age: 30,
        gender: 'male',
        isVerified: true
      });
      await patient.save();
      console.log('Created patient user');
    }
    
    // Find a doctor user (or create one)
    let doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      doctor = new User({
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        email: 'doctor@example.com',
        phone: '+91 8888888888',
        password: 'password123',
        role: 'doctor',
        village: 'Nabha',
        license: 'DOC123',
        specialization: 'General Medicine',
        hospital: 'Nabha Hospital',
        availableDays: ['Monday', 'Tuesday', 'Wednesday'],
        consultationFee: 500,
        isVerified: true
      });
      await doctor.save();
      console.log('Created doctor user');
    }
    
    // Create sample appointment
    const appointment = new Appointment({
      patient: patient._id,
      doctor: doctor._id,
      date: new Date(),
      time: '10:00 AM',
      type: 'video',
      symptoms: 'Fever and headache',
      status: 'scheduled'
    });
    await appointment.save();
    console.log('Created sample appointment');
    
    // Create sample prescription
    const prescription = new Prescription({
      patient: patient._id,
      doctor: doctor._id,
      appointment: appointment._id,
      medicines: [
        { name: 'Paracetamol', dosage: '500mg twice daily' },
        { name: 'Vitamin D3', dosage: '1000 IU daily' }
      ],
      diagnosis: 'Common cold',
      status: 'active'
    });
    await prescription.save();
    console.log('Created sample prescription');
    
    // Create sample order
    const order = new Order({
      patientId: patient._id,
      medicines: [
        { name: 'Paracetamol', quantity: 10, price: 2.5 },
        { name: 'Vitamin D3', quantity: 30, price: 5.0 }
      ],
      totalAmount: 175,
      deliveryAddress: 'Test Address, Nabha',
      customerInfo: {
        name: 'John Doe',
        phone: '+91 9999999999',
        address: 'Test Address, Nabha'
      },
      status: 'pending',
      estimatedDeliveryTime: '30 min'
    });
    await order.save();
    console.log('Created sample order');
    
    console.log('Sample data created successfully!');
    console.log('Patient ID:', patient._id);
    console.log('Use phone +91 9999999999 and password "password123" to login');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedPatientData();
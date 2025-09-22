const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');
const pharmacyRoutes = require('./routes/pharmacies');
const healthDataRoutes = require('./routes/healthData');
const testAlertRoutes = require('./routes/testAlert');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Make io available to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  // Join doctor room for real-time alerts
  socket.on('joinDoctorRoom', (doctorId) => {
    socket.join(`doctor_${doctorId}`);
    console.log(`🏠 Doctor ${doctorId} joined room: doctor_${doctorId}`);
    console.log(`📊 Total rooms:`, socket.rooms);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

console.log('📡 Socket.io server initialized');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/health-data', healthDataRoutes);
app.use('/api/test-alert', testAlertRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Nabha Health API is running', status: 'OK' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.io enabled for real-time notifications');
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');
const pharmacyRoutes = require('./routes/pharmacies');
const healthDataRoutes = require('./routes/healthData');
const testAlertRoutes = require('./routes/testAlert');
const orderRoutes = require('./routes/orders');
const stockRoutes = require('./routes/stock');
const videoCallRoutes = require('./routes/videoCalls');
const consultationRoutes = require('./routes/consultations');
const onlinePrescriptionRoutes = require('./routes/onlinePrescriptions');
const handleOrderEvents = require('./socket/orderEvents');

const app = express();
const server = http.createServer(app);
const ALLOWED_ORIGINS = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim()).filter(Boolean)
  : ['http://localhost:3000'];

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = Number(process.env.PORT) || 5000;

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
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
  
  // Join patient room for video calls
  socket.on("joinPatientRoom", (patientId) => {
    const roomName = `patient_${patientId}`;
    socket.join(roomName);
    console.log(`🏠 Patient ${patientId} joined room: ${roomName}`);
    console.log(`📊 Room ${roomName} now has ${io.sockets.adapter.rooms.get(roomName)?.size || 0} members`);
    socket.emit("roomJoined", { room: roomName, patientId });
  });

  // Video call signaling
  socket.on("joinVideoRoom", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("userJoined", socket.id);
  });

  socket.on("offer", (data) => {
    socket.to(data.roomId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit("answer", data);
  });

  socket.on("iceCandidate", (data) => {
    socket.to(data.roomId).emit("iceCandidate", data);
  });

  socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
  });
});

// Initialize order events
handleOrderEvents(io);

  console.log('📡 Socket.io server initialized');

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/pharmacies', pharmacyRoutes);
  app.use('/api/health-data', healthDataRoutes);
  app.use('/api/test-alert', testAlertRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/stock', stockRoutes);
  app.use('/api/video-calls', videoCallRoutes);
  app.use('/api/consultations', consultationRoutes);
  app.use('/api/online-prescriptions', onlinePrescriptionRoutes);

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ message: 'Nabha Health API is running', status: 'OK' });
  });

  // Redirect routes without /api prefix
  app.use('/auth', (req, res) => {
    res.redirect(308, `/api/auth${req.path}`);
  });
  app.use('/users', (req, res) => {
    res.redirect(308, `/api/users${req.path}`);
  });
  app.use('/appointments', (req, res) => {
    res.redirect(308, `/api/appointments${req.path}`);
  });
  app.use('/prescriptions', (req, res) => {
    res.redirect(308, `/api/prescriptions${req.path}`);
  });
  app.use('/pharmacies', (req, res) => {
    res.redirect(308, `/api/pharmacies${req.path}`);
  });
  app.use('/health-data', (req, res) => {
    res.redirect(308, `/api/health-data${req.path}`);
  });
  app.use('/video-calls', (req, res) => {
    res.redirect(308, `/api/video-calls${req.path}`);
  });
  app.use('/consultations', (req, res) => {
    res.redirect(308, `/api/consultations${req.path}`);
  });
  app.use('/online-prescriptions', (req, res) => {
    res.redirect(308, `/api/online-prescriptions${req.path}`);
  });

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error('Stop the existing server on that port, or set PORT to another value in backend/.env.');
    process.exit(1);
  }

  console.error('Server failed to start:', error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.io enabled for real-time notifications');
});

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
const videoCallRoutes = require('./routes/videoCalls');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Make io available to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path.includes('/auth/register')) {
    console.log('Registration request body keys:', Object.keys(req.body));
  }
  next();
});

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
  });
  
  // Join patient room for video calls
  socket.on('joinPatientRoom', (patientId) => {
    const roomName = `patient_${patientId}`;
    socket.join(roomName);
    console.log(`🏠 Patient ${patientId} joined room: ${roomName}`);
    console.log(`📊 Room ${roomName} now has ${io.sockets.adapter.rooms.get(roomName)?.size || 0} members`);
    
    // Send confirmation back to patient
    socket.emit('roomJoined', { room: roomName, patientId });
  });
  
  // Video call signaling
  socket.on('joinVideoRoom', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('userJoined', socket.id);
  });
  
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });
  
  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });
  
  socket.on('iceCandidate', (data) => {
    socket.to(data.roomId).emit('iceCandidate', data);
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
app.use('/api/video-calls', videoCallRoutes);

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.io enabled for real-time notifications');
});
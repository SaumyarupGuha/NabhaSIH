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
const medicineRoutes = require('./routes/medicines');
const orderRoutes = require('./routes/orders');
const stockRoutes = require('./routes/stock');
const verifiedPharmaciesRoutes = require('./routes/verifiedPharmacies');
const googleMapsRoutes = require('./routes/googleMaps');
const pharmacyUpdatesRoutes = require('./routes/pharmacyUpdates');
const alternativesRoutes = require('./routes/alternatives');
const handleOrderEvents = require('./socket/orderEvents');

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
.then(() => {})
.catch(err => {});

// Socket.io connection handling
io.on('connection', (socket) => {
  
  // Join pharmacy room for order notifications
  socket.on('joinPharmacyRoom', (pharmacyId) => {
    socket.join(`pharmacy_${pharmacyId}`);
  });
  
  // Join doctor room for real-time alerts
  socket.on('joinDoctorRoom', (doctorId) => {
    socket.join(`doctor_${doctorId}`);
  });
  
  // Join patient room for order updates
  socket.on('joinPatientRoom', (patientId) => {
    socket.join(`patient_${patientId}`);
  });
  
  // Join general pharmacy dashboard room
  socket.on('joinPharmacyDashboard', () => {
    socket.join('pharmacy_dashboard');
  });
  
  socket.on('disconnect', () => {
  });
});

// Initialize order events
handleOrderEvents(io);



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/health-data', healthDataRoutes);
app.use('/api/test-alert', testAlertRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-matching', require('./routes/orderMatching'));
app.use('/api/distance', require('./routes/distance'));
app.use('/api/stock', stockRoutes);
app.use('/api/verified-pharmacies', verifiedPharmaciesRoutes);
app.use('/api/google-maps', googleMapsRoutes);
app.use('/api/pharmacy-updates', pharmacyUpdatesRoutes);
app.use('/api/alternatives', alternativesRoutes);

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

server.listen(PORT, () => {
});
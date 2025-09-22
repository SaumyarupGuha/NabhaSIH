# Real-Time Health Monitoring System Setup

## Overview
This system simulates real-time health data from wearable devices, monitors for anomalies, and sends real-time alerts to doctors.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install axios socket.io
```

### 2. Frontend Dependencies
```bash
cd frontend
npm install socket.io-client
```

### 3. Database Setup
The system will automatically create the required collections:
- `healthdatas` - Stores patient health metrics
- `alerts` - Stores health anomaly alerts

### 4. Configure Patient-Doctor Relationships
Update your existing patients to have assigned doctors:
```javascript
// In MongoDB or through your admin interface
db.users.updateMany(
  { role: 'patient' },
  { $set: { assignedDoctor: ObjectId('DOCTOR_ID_HERE') } }
)
```

### 5. Start the System

#### Start Backend Server
```bash
cd backend
npm run dev
```

#### Start Health Data Simulator
```bash
# Normal mode (1 minute intervals)
npm run simulate

# Fast mode (6 second intervals for testing)
npm run simulate:fast
```

#### Start Frontend
```bash
cd frontend
npm start
```

## Usage

### 1. Health Data Simulation
- The simulator sends health data every minute (or 6 seconds in fast mode)
- Data includes: heart rate, temperature, oxygen saturation, blood pressure
- Uses sample patient IDs from the simulator script

### 2. Anomaly Detection
The system monitors for:
- **High Temperature**: > 100.4°F
- **Low Oxygen**: < 90%
- **High Heart Rate**: > 120 bpm
- **High Blood Pressure**: > 140/90 mmHg

### 3. Real-Time Alerts
- Alerts are created automatically when anomalies are detected
- Doctors receive real-time notifications via Socket.io
- Pop-up notifications appear on the doctor dashboard

### 4. Doctor Dashboard
Add the DoctorAlerts component to your doctor dashboard:
```jsx
import { DoctorAlerts } from '../components/DoctorAlerts';

// In your doctor dashboard component
<DoctorAlerts doctorId={currentUser._id} />
```

## API Endpoints

### Health Data
- `POST /api/health-data` - Receive health data from simulator
- `GET /api/health-data/:patientId` - Get patient health history
- `GET /api/health-data/alerts/doctor` - Get doctor's alerts
- `PUT /api/health-data/alerts/:alertId/acknowledge` - Acknowledge alert

## Configuration

### Anomaly Thresholds
Edit `backend/routes/healthData.js` to modify thresholds:
```javascript
const THRESHOLDS = {
  HIGH_TEMPERATURE: 100.4, // °F
  LOW_OXYGEN: 90, // %
  HIGH_HEART_RATE: 120, // bpm
  HIGH_BLOOD_PRESSURE_SYSTOLIC: 140, // mmHg
  HIGH_BLOOD_PRESSURE_DIASTOLIC: 90 // mmHg
};
```

### Simulator Configuration
Edit `backend/scripts/healthDataSimulator.js`:
- Update `patientIds` array with actual patient ObjectIds
- Modify `intervalMinutes` for different simulation speeds
- Add more health data samples in `sample-health-data.json`

## Testing

1. Start the backend server
2. Start the simulator in fast mode
3. Open doctor dashboard in browser
4. Watch for real-time alerts when anomalous data is processed

## Troubleshooting

### Common Issues
1. **Socket.io connection failed**: Check CORS settings in server.js
2. **No alerts appearing**: Verify patient-doctor relationships in database
3. **Simulator not sending data**: Check patient IDs in simulator script
4. **Database errors**: Ensure MongoDB is running and connected

### Debug Mode
Enable debug logging by adding to your .env:
```
DEBUG=socket.io:*
```
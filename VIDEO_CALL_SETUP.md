# Video Call Feature Setup

## Overview
This implementation adds doctor-patient video calling functionality to the telemedicine web app using WebRTC and Socket.IO.

## Features Implemented

### Backend
- **VideoCall Model**: Stores call records with doctor, patient, room ID, and status
- **Video Call Routes**: 
  - `POST /api/video-calls/start` - Doctor initiates call with patient phone number
  - `POST /api/video-calls/respond` - Patient accepts/rejects call
  - `POST /api/video-calls/end` - Either party ends the call
- **Socket.IO Integration**: Real-time signaling for WebRTC and call notifications

### Frontend
- **VideoCall Component**: Full video calling interface with WebRTC
- **IncomingCallModal**: Patient receives call notifications
- **Doctor Dashboard**: Added "Video Call" tab with patient phone input
- **Patient Dashboard**: Automatic incoming call notifications
- **API Integration**: Clean API calls for all video call operations

## How It Works

1. **Doctor initiates call**:
   - Enters patient phone number in dashboard
   - Backend verifies patient exists
   - Generates unique room ID
   - Sends socket notification to patient

2. **Patient receives call**:
   - Modal popup appears with doctor info
   - Can accept or reject the call
   - Response sent back to doctor via socket

3. **Video call session**:
   - Both parties redirected to `/video-room/:roomId`
   - WebRTC peer connection established
   - Real-time video/audio streaming
   - Call controls (mute, video toggle, end call)

## Security Features
- Only authenticated users can make/receive calls
- Room access restricted to specific doctor-patient pairs
- Call records stored with timestamps
- Proper error handling and validation

## Usage

### For Doctors:
1. Go to Hospital Dashboard
2. Click "Video Call" tab
3. Enter patient's phone number
4. Click "Start Video Call"
5. Wait for patient to accept

### For Patients:
1. Stay logged in to Patient Dashboard
2. Incoming call modal will appear automatically
3. Accept or reject the call
4. If accepted, redirected to video room

## Technical Stack
- **Backend**: Node.js, Express, Socket.IO, MongoDB
- **Frontend**: React, WebRTC, Socket.IO Client
- **Real-time**: Socket.IO for signaling
- **Video**: WebRTC with STUN servers

## Environment Variables
Make sure these are set in your `.env` files:

Backend:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

Frontend:
```
VITE_API_URL=http://localhost:5000
```

## Testing
1. Create doctor and patient accounts
2. Note patient's phone number
3. Login as doctor, go to video call tab
4. Login as patient in another browser/tab
5. Initiate call from doctor dashboard
6. Accept call from patient dashboard
7. Test video call functionality

## Browser Requirements
- Modern browsers with WebRTC support
- Camera and microphone permissions required
- HTTPS recommended for production (WebRTC requirement)
# Nabha Health - Telemedicine Platform

A MERN stack application for rural healthcare services in Nabha, Punjab.

## Features

- **Multi-role Authentication**: Patients, Doctors, Pharmacists, and Admins
- **Appointment Booking**: Video/in-person consultations
- **Prescription Management**: Digital prescriptions and medicine ordering
- **Pharmacy Integration**: Local pharmacy network
- **Multi-language Support**: English, Hindi, and Punjabi
- **Mobile Responsive**: Works on all devices

## Tech Stack

### Backend

- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Express Validator for input validation
- Socket.io

### Frontend

- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file with your MongoDB URI:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nabha-health
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

4. Start the server:

```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm run dev
```

The frontend will run on http://localhost:5173

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Appointments

- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book appointment
- `PATCH /api/appointments/:id/status` - Update appointment status
- `GET /api/appointments/doctors` - Get available doctors

### Prescriptions

- `GET /api/prescriptions` - Get user prescriptions
- `POST /api/prescriptions` - Create prescription (doctors only)
- `GET /api/prescriptions/:id` - Get prescription details

### Pharmacies

- `GET /api/pharmacies` - Get all pharmacies
- `GET /api/pharmacies/:id` - Get pharmacy details

### Users

- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)
- `PATCH /api/users/:id/verify` - Verify user (admin only)

## User Roles

### Patient

- Book appointments with doctors
- View medical history and prescriptions
- Order medicines from pharmacies
- Emergency contact access

### Doctor

- Manage patient appointments
- Create prescriptions
- View consultation history
- Patient queue management

### Pharmacist

- Manage medicine inventory
- Process medicine orders
- View prescription details

### Admin

- User management and verification
- System oversight
- Analytics and reporting

## Project Structure

```
nabha-health/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication & validation
│   ├── controllers/     # Business logic
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── lib/         # Utilities & API
│   │   └── hooks/       # Custom hooks
│   └── public/          # Static assets
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

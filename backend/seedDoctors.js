const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const doctors = [
  // Monday Doctors
  {
    firstName: "Rajesh", lastName: "Kumar", phone: "+91 98765 43210", email: "rajesh.kumar@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "MH12345", 
    specialization: "General Medicine", hospital: "Nabha Civil Hospital", 
    availableDays: ["Monday", "Wednesday", "Friday"], consultationFee: 200, isVerified: true
  },
  {
    firstName: "Priya", lastName: "Sharma", phone: "+91 98765 43211", email: "priya.sharma@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "PD12346",
    specialization: "Pediatrics", hospital: "Nabha Civil Hospital",
    availableDays: ["Monday", "Tuesday", "Thursday"], consultationFee: 250, isVerified: true
  },
  {
    firstName: "Harpreet", lastName: "Singh", phone: "+91 98765 43212", email: "harpreet.singh@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "CD12347",
    specialization: "Cardiology", hospital: "Nabha Civil Hospital",
    availableDays: ["Monday", "Wednesday", "Saturday"], consultationFee: 400, isVerified: true
  },
  {
    firstName: "Sunita", lastName: "Devi", phone: "+91 98765 43213", email: "sunita.devi@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "GY12348",
    specialization: "Gynecology", hospital: "Nabha Civil Hospital",
    availableDays: ["Monday", "Thursday", "Friday"], consultationFee: 300, isVerified: true
  },
  {
    firstName: "Amit", lastName: "Verma", phone: "+91 98765 43214", email: "amit.verma@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "OR12349",
    specialization: "Orthopedics", hospital: "Nabha Civil Hospital",
    availableDays: ["Monday", "Tuesday", "Saturday"], consultationFee: 350, isVerified: true
  },

  // Tuesday Doctors
  {
    firstName: "Neha", lastName: "Gupta", phone: "+91 98765 43215", email: "neha.gupta@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "DE12350",
    specialization: "Dermatology", hospital: "Nabha Civil Hospital",
    availableDays: ["Tuesday", "Thursday", "Saturday"], consultationFee: 280, isVerified: true
  },
  {
    firstName: "Vikram", lastName: "Singh", phone: "+91 98765 43216", email: "vikram.singh@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "PS12351",
    specialization: "Psychiatry", hospital: "Nabha Civil Hospital",
    availableDays: ["Tuesday", "Wednesday", "Friday"], consultationFee: 320, isVerified: true
  },
  {
    firstName: "Kavita", lastName: "Rani", phone: "+91 98765 43217", email: "kavita.rani@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "EN12352",
    specialization: "ENT", hospital: "Nabha Civil Hospital",
    availableDays: ["Tuesday", "Thursday", "Sunday"], consultationFee: 260, isVerified: true
  },
  {
    firstName: "Ravi", lastName: "Sharma", phone: "+91 98765 43218", email: "ravi.sharma@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "UR12353",
    specialization: "Urology", hospital: "Nabha Civil Hospital",
    availableDays: ["Tuesday", "Friday", "Saturday"], consultationFee: 380, isVerified: true
  },
  {
    firstName: "Meera", lastName: "Kaur", phone: "+91 98765 43219", email: "meera.kaur@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "OP12354",
    specialization: "Ophthalmology", hospital: "Nabha Civil Hospital",
    availableDays: ["Tuesday", "Wednesday", "Saturday"], consultationFee: 290, isVerified: true
  },

  // Wednesday Doctors
  {
    firstName: "Suresh", lastName: "Kumar", phone: "+91 98765 43220", email: "suresh.kumar@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "NE12355",
    specialization: "Neurology", hospital: "Nabha Civil Hospital",
    availableDays: ["Wednesday", "Friday", "Sunday"], consultationFee: 450, isVerified: true
  },
  {
    firstName: "Anjali", lastName: "Mehta", phone: "+91 98765 43221", email: "anjali.mehta@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "ON12356",
    specialization: "Oncology", hospital: "Nabha Civil Hospital",
    availableDays: ["Wednesday", "Thursday", "Saturday"], consultationFee: 500, isVerified: true
  },
  {
    firstName: "Deepak", lastName: "Jain", phone: "+91 98765 43222", email: "deepak.jain@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "GA12357",
    specialization: "Gastroenterology", hospital: "Nabha Civil Hospital",
    availableDays: ["Wednesday", "Friday", "Saturday"], consultationFee: 420, isVerified: true
  },
  {
    firstName: "Pooja", lastName: "Singh", phone: "+91 98765 43223", email: "pooja.singh@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "RH12358",
    specialization: "Rheumatology", hospital: "Nabha Civil Hospital",
    availableDays: ["Wednesday", "Thursday", "Sunday"], consultationFee: 360, isVerified: true
  },
  {
    firstName: "Manish", lastName: "Agarwal", phone: "+91 98765 43224", email: "manish.agarwal@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "PU12359",
    specialization: "Pulmonology", hospital: "Nabha Civil Hospital",
    availableDays: ["Wednesday", "Friday", "Sunday"], consultationFee: 340, isVerified: true
  },

  // Thursday Doctors
  {
    firstName: "Sonia", lastName: "Kapoor", phone: "+91 98765 43225", email: "sonia.kapoor@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "EN12360",
    specialization: "Endocrinology", hospital: "Nabha Civil Hospital",
    availableDays: ["Thursday", "Saturday", "Sunday"], consultationFee: 380, isVerified: true
  },
  {
    firstName: "Rohit", lastName: "Malhotra", phone: "+91 98765 43226", email: "rohit.malhotra@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "AN12361",
    specialization: "Anesthesiology", hospital: "Nabha Civil Hospital",
    availableDays: ["Thursday", "Friday", "Saturday"], consultationFee: 300, isVerified: true
  },
  {
    firstName: "Rekha", lastName: "Sharma", phone: "+91 98765 43227", email: "rekha.sharma@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "RA12362",
    specialization: "Radiology", hospital: "Nabha Civil Hospital",
    availableDays: ["Thursday", "Friday", "Sunday"], consultationFee: 320, isVerified: true
  },
  {
    firstName: "Arun", lastName: "Gupta", phone: "+91 98765 43228", email: "arun.gupta@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "PL12363",
    specialization: "Plastic Surgery", hospital: "Nabha Civil Hospital",
    availableDays: ["Thursday", "Saturday", "Sunday"], consultationFee: 600, isVerified: true
  },
  {
    firstName: "Nisha", lastName: "Yadav", phone: "+91 98765 43229", email: "nisha.yadav@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "PA12364",
    specialization: "Pathology", hospital: "Nabha Civil Hospital",
    availableDays: ["Thursday", "Friday", "Saturday"], consultationFee: 250, isVerified: true
  },

  // Friday Doctors
  {
    firstName: "Kiran", lastName: "Bedi", phone: "+91 98765 43230", email: "kiran.bedi@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "EM12365",
    specialization: "Emergency Medicine", hospital: "Nabha Civil Hospital",
    availableDays: ["Friday", "Saturday", "Sunday"], consultationFee: 280, isVerified: true
  },
  {
    firstName: "Sachin", lastName: "Tendulkar", phone: "+91 98765 43231", email: "sachin.tendulkar@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "SP12366",
    specialization: "Sports Medicine", hospital: "Nabha Civil Hospital",
    availableDays: ["Friday", "Saturday", "Sunday"], consultationFee: 400, isVerified: true
  },
  {
    firstName: "Geeta", lastName: "Phogat", phone: "+91 98765 43232", email: "geeta.phogat@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "PM12367",
    specialization: "Physical Medicine", hospital: "Nabha Civil Hospital",
    availableDays: ["Friday", "Sunday"], consultationFee: 350, isVerified: true
  },
  {
    firstName: "Vikas", lastName: "Swarup", phone: "+91 98765 43233", email: "vikas.swarup@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "GE12368",
    specialization: "Geriatrics", hospital: "Nabha Civil Hospital",
    availableDays: ["Friday", "Saturday"], consultationFee: 300, isVerified: true
  },
  {
    firstName: "Shilpa", lastName: "Shetty", phone: "+91 98765 43234", email: "shilpa.shetty@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "NU12369",
    specialization: "Nutrition", hospital: "Nabha Civil Hospital",
    availableDays: ["Friday", "Sunday"], consultationFee: 220, isVerified: true
  },

  // Saturday Doctors
  {
    firstName: "Kapil", lastName: "Dev", phone: "+91 98765 43235", email: "kapil.dev@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "CR12370",
    specialization: "Critical Care", hospital: "Nabha Civil Hospital",
    availableDays: ["Saturday", "Sunday"], consultationFee: 500, isVerified: true
  },
  {
    firstName: "Mary", lastName: "Kom", phone: "+91 98765 43236", email: "mary.kom@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "TR12371",
    specialization: "Trauma Surgery", hospital: "Nabha Civil Hospital",
    availableDays: ["Saturday", "Sunday"], consultationFee: 550, isVerified: true
  },
  {
    firstName: "Rahul", lastName: "Dravid", phone: "+91 98765 43237", email: "rahul.dravid@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "IC12372",
    specialization: "Intensive Care", hospital: "Nabha Civil Hospital",
    availableDays: ["Saturday", "Sunday"], consultationFee: 480, isVerified: true
  },
  {
    firstName: "Saina", lastName: "Nehwal", phone: "+91 98765 43238", email: "saina.nehwal@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "RH12373",
    specialization: "Rehabilitation", hospital: "Nabha Civil Hospital",
    availableDays: ["Saturday"], consultationFee: 320, isVerified: true
  },
  {
    firstName: "Abhinav", lastName: "Bindra", phone: "+91 98765 43239", email: "abhinav.bindra@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "OC12374",
    specialization: "Occupational Medicine", hospital: "Nabha Civil Hospital",
    availableDays: ["Saturday"], consultationFee: 280, isVerified: true
  },

  // Sunday Doctors
  {
    firstName: "Sushma", lastName: "Swaraj", phone: "+91 98765 43240", email: "sushma.swaraj@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "FM12375",
    specialization: "Family Medicine", hospital: "Nabha Civil Hospital",
    availableDays: ["Sunday"], consultationFee: 250, isVerified: true
  },
  {
    firstName: "Kailash", lastName: "Satyarthi", phone: "+91 98765 43241", email: "kailash.satyarthi@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "CH12376",
    specialization: "Child Health", hospital: "Nabha Civil Hospital",
    availableDays: ["Sunday"], consultationFee: 300, isVerified: true
  },
  {
    firstName: "Vandana", lastName: "Shiva", phone: "+91 98765 43242", email: "vandana.shiva@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "HO12377",
    specialization: "Homeopathy", hospital: "Nabha Civil Hospital",
    availableDays: ["Sunday"], consultationFee: 200, isVerified: true
  },
  {
    firstName: "Baba", lastName: "Ramdev", phone: "+91 98765 43243", email: "baba.ramdev@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "AY12378",
    specialization: "Ayurveda", hospital: "Nabha Civil Hospital",
    availableDays: ["Sunday"], consultationFee: 180, isVerified: true
  },
  {
    firstName: "Deepika", lastName: "Kumari", phone: "+91 98765 43244", email: "deepika.kumari@nabha.gov.in",
    password: "doctor123", role: "doctor", village: "nabha", license: "WH12379",
    specialization: "Women's Health", hospital: "Nabha Civil Hospital",
    availableDays: ["Sunday"], consultationFee: 280, isVerified: true
  }
];

async function seedDoctors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await User.deleteMany({ role: 'doctor' });
    console.log('Cleared existing doctors');
    
    await User.insertMany(doctors);
    console.log('Sample doctors inserted successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
}

seedDoctors();
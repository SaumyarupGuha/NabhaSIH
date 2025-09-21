const mongoose = require('mongoose');
const Pharmacy = require('../models/Pharmacy');

mongoose.connect('mongodb://localhost:27017/nabha-health');

const pharmaciesData = [
  {
    name: "King Pharmacy",
    address: "Circular Road",
    phone: "073553 22221",
    status: "Open 24 hours",
    hours: "24/7",
    notes: "",
    services: ["24/7 Service", "Emergency Medicine", "Home Delivery"],
    rating: 4.7,
    isOpen24Hours: true
  },
  {
    name: "King Medicos",
    address: "95J2+V5M, Alohran Kalan Rd",
    phone: "095235 69810",
    status: "Open 24 hours",
    hours: "24/7",
    notes: "",
    services: ["24/7 Service", "Emergency Medicine"],
    rating: 4.6,
    isOpen24Hours: true
  },
  {
    name: "Manjit Medical Hall",
    address: "Mata Rani Rd",
    phone: "099149 35405",
    status: "Open",
    hours: "Regular Hours",
    notes: "Best medical store in Nabha!!",
    services: ["Best Service", "Quality Products", "Highly Rated"],
    rating: 4.9,
    isOpen24Hours: false
  },
  {
    name: "Punjab Medical Store",
    address: "9582+MXC, Circular Road, near Pal Nursing Home",
    phone: "",
    status: "Open 24 hours",
    hours: "24/7",
    notes: "Best service · Website",
    services: ["24/7 Service", "Online Orders", "Best Service"],
    rating: 4.8,
    isOpen24Hours: true
  },
  {
    name: "Channo Health Care",
    address: "Patiala, SH-12A, Main Road, Nabha",
    phone: "094638 90358",
    status: "Open 24 hours",
    hours: "24/7",
    notes: "",
    services: ["24/7 Service", "Health Care Products"],
    rating: 4.5,
    isOpen24Hours: true
  }
];

async function importPharmacies() {
  try {
    await Pharmacy.insertMany(pharmaciesData);
    console.log('Pharmacies imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error importing pharmacies:', error);
    process.exit(1);
  }
}

importPharmacies();
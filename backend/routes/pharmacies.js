const express = require('express');
const router = express.Router();
const Pharmacy = require('../models/Pharmacy');

// Get all pharmacies
router.get('/', async (req, res) => {
  try {
    let pharmacies = await Pharmacy.find().sort({ rating: -1 });
    
    // If no pharmacies in DB, return all CSV data
    if (pharmacies.length === 0) {
      pharmacies = [
        {
          _id: '1',
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
          _id: '2',
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
          _id: '3',
          name: "Munish Med Hall",
          address: "94FX+989, Hakimaa Street",
          phone: "095010 25369",
          status: "Open · Closes 7 am Sun",
          hours: "Mon-Sat: 24hrs, Sun: Till 7am",
          notes: "",
          services: ["General Medicine", "Prescription Drugs"],
          rating: 4.3,
          isOpen24Hours: false
        },
        {
          _id: '4',
          name: "Mittal Medicos",
          address: "Opp. Sadar Thana",
          phone: "",
          status: "Open · Closes 12 am",
          hours: "Till 12 AM",
          notes: "In-store pick-up · Delivery",
          services: ["In-store Pickup", "Home Delivery", "Online Orders"],
          rating: 4.4,
          isOpen24Hours: false
        },
        {
          _id: '5',
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
          _id: '6',
          name: "Channo Health Care",
          address: "Patiala, SH-12A, Main Road, Nabha",
          phone: "094638 90358",
          status: "Open 24 hours",
          hours: "24/7",
          notes: "",
          services: ["24/7 Service", "Health Care Products"],
          rating: 4.5,
          isOpen24Hours: true
        },
        {
          _id: '7',
          name: "M/S Gupta Pharmaceuticals",
          address: "Nabha, Punjab",
          phone: "092165 13396",
          status: "Open",
          hours: "Regular Hours",
          notes: "",
          services: ["Pharmaceutical Products", "Prescription Drugs"],
          rating: 4.2,
          isOpen24Hours: false
        },
        {
          _id: '8',
          name: "Dhanjal Medical Hall",
          address: "Shop 12, Opp. Hospital",
          phone: "062800 48454",
          status: "Open",
          hours: "Regular Hours",
          notes: "",
          services: ["General Medicine", "Hospital Proximity"],
          rating: 4.3,
          isOpen24Hours: false
        },
        {
          _id: '9',
          name: "Jagdish Medical Hall",
          address: "95J2+J9M, Alhoran Gate",
          phone: "073072 07500",
          status: "Open",
          hours: "Regular Hours",
          notes: "",
          services: ["General Medicine", "Prescription Drugs"],
          rating: 4.1,
          isOpen24Hours: false
        },
        {
          _id: '10',
          name: "JP Pharmacy",
          address: "Civil Hospital Road, Opp. Hanuman Mandir",
          phone: "070870 01441",
          status: "Closed · Opens 6 am Sun",
          hours: "Opens 6 AM Sunday",
          notes: "In-store shopping",
          services: ["In-store Shopping", "Hospital Proximity"],
          rating: 4.0,
          isOpen24Hours: false
        },
        {
          _id: '11',
          name: "Goyal Pharmacy",
          address: "Patiala Road, Opp. Triveni Palace",
          phone: "099884 23345",
          status: "Closed · Opens 8 am Mon",
          hours: "Opens 8 AM Monday",
          notes: "Good services",
          services: ["Good Services", "Quality Products"],
          rating: 4.4,
          isOpen24Hours: false
        },
        {
          _id: '12',
          name: "Gurpreet Medical Hall",
          address: "Near PWD Rest House",
          phone: "098550 99034",
          status: "Open",
          hours: "Regular Hours",
          notes: "Good service",
          services: ["Good Service", "Quality Care"],
          rating: 4.6,
          isOpen24Hours: false
        },
        {
          _id: '13',
          name: "Bakshi Healthcare",
          address: "Bouran Gate, 1, Nabha Malerkotla Rd",
          phone: "095013 00828",
          status: "Open",
          hours: "Regular Hours",
          notes: "Delivery",
          services: ["Home Delivery", "Healthcare Products"],
          rating: 4.3,
          isOpen24Hours: false
        },
        {
          _id: '14',
          name: "Deep Medical Hall",
          address: "95J2+QMV, Alohran Kalan Rd",
          phone: "",
          status: "Open",
          hours: "Regular Hours",
          notes: "",
          services: ["General Medicine"],
          rating: 4.1,
          isOpen24Hours: false
        },
        {
          _id: '15',
          name: "Dhir Pharmacy Nabha",
          address: "Opposite Jashan Jewellers",
          phone: "079869 20561",
          status: "Open",
          hours: "Regular Hours",
          notes: "",
          services: ["General Medicine", "Prescription Drugs"],
          rating: 4.2,
          isOpen24Hours: false
        },
        {
          _id: '16',
          name: "Ganda Medical Hall",
          address: "Dulladi",
          phone: "098763 80051",
          status: "Open",
          hours: "Regular Hours",
          notes: "",
          services: ["General Medicine"],
          rating: 4.0,
          isOpen24Hours: false
        },
        {
          _id: '17',
          name: "Shakti Medical Agency",
          address: "9592+543, Unnamed Road",
          phone: "098149 25849",
          status: "Open",
          hours: "Regular Hours",
          notes: "",
          services: ["Medical Agency", "Wholesale"],
          rating: 4.1,
          isOpen24Hours: false
        },
        {
          _id: '18',
          name: "Diamond Medicos",
          address: "95P3+3R5, Alohran Kalan Rd",
          phone: "",
          status: "Open",
          hours: "Regular Hours",
          notes: "",
          services: ["General Medicine"],
          rating: 4.2,
          isOpen24Hours: false
        },
        {
          _id: '19',
          name: "Jan Aushadhi Store",
          address: "Civil Hospital",
          phone: "090418 39490",
          status: "Open",
          hours: "Regular Hours",
          notes: "",
          services: ["Generic Medicines", "Affordable Drugs", "Government Store"],
          rating: 4.5,
          isOpen24Hours: false
        },
        {
          _id: '20',
          name: "Manjit Medical Hall",
          address: "Mata Rani Rd",
          phone: "099149 35405",
          status: "Open",
          hours: "Regular Hours",
          notes: "Best medical store in Nabha!!",
          services: ["Best Service", "Quality Products", "Highly Rated"],
          rating: 4.9,
          isOpen24Hours: false
        }
      ];
    }
    
    res.json({ success: true, data: pharmacies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get pharmacy by ID
router.get('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }
    res.json({ success: true, data: pharmacy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
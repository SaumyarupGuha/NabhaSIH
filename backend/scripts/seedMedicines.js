const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
require('dotenv').config();

const medicines = [
  // Pain Relief
  { name: "Paracetamol 500mg", genericName: "Paracetamol", category: "Pain Relief", manufacturer: "Generic", price: 15, description: "Pain relief and fever reducer", dosage: "1-2 tablets every 4-6 hours", prescriptionRequired: false, inStock: true, stockQuantity: 100 },
  { name: "Paracetamol 650mg", genericName: "Paracetamol", category: "Pain Relief", manufacturer: "Generic", price: 18, description: "Pain relief and fever reducer", dosage: "1 tablet every 6-8 hours", prescriptionRequired: false, inStock: true, stockQuantity: 80 },
  { name: "Crocin Advance", genericName: "Paracetamol", category: "Pain Relief", manufacturer: "GSK", price: 25, description: "Fast pain relief", dosage: "1-2 tablets every 4-6 hours", prescriptionRequired: false, inStock: true, stockQuantity: 60 },
  { name: "Dolo 650", genericName: "Paracetamol", category: "Pain Relief", manufacturer: "Micro Labs", price: 20, description: "Pain and fever relief", dosage: "1 tablet every 6-8 hours", prescriptionRequired: false, inStock: true, stockQuantity: 90 },
  { name: "Aspirin 75mg", genericName: "Aspirin", category: "Pain Relief", manufacturer: "Bayer", price: 12, description: "Low dose aspirin", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 70 },
  { name: "Ibuprofen 400mg", genericName: "Ibuprofen", category: "Pain Relief", manufacturer: "Generic", price: 28, description: "Anti-inflammatory pain relief", dosage: "1 tablet every 6-8 hours", prescriptionRequired: false, inStock: true, stockQuantity: 50 },
  { name: "Combiflam", genericName: "Ibuprofen + Paracetamol", category: "Pain Relief", manufacturer: "Sanofi", price: 35, description: "Dual action pain relief", dosage: "1 tablet every 8 hours", prescriptionRequired: false, inStock: true, stockQuantity: 40 },
  { name: "Disprin", genericName: "Aspirin", category: "Pain Relief", manufacturer: "Reckitt", price: 16, description: "Soluble aspirin", dosage: "1-2 tablets in water", prescriptionRequired: false, inStock: true, stockQuantity: 65 },

  // Cold & Cough
  { name: "Cough Syrup", genericName: "Dextromethorphan", category: "Cold & Cough", manufacturer: "Generic", price: 45, description: "Cough suppressant", dosage: "10ml every 4-6 hours", prescriptionRequired: false, inStock: true, stockQuantity: 30 },
  { name: "Benadryl Cough Syrup", genericName: "Diphenhydramine", category: "Cold & Cough", manufacturer: "J&J", price: 55, description: "Cough and cold relief", dosage: "10ml every 6 hours", prescriptionRequired: false, inStock: true, stockQuantity: 25 },
  { name: "Cheston Cold", genericName: "Cetirizine + Phenylephrine", category: "Cold & Cough", manufacturer: "Cipla", price: 38, description: "Cold and allergy relief", dosage: "1 tablet twice daily", prescriptionRequired: false, inStock: true, stockQuantity: 45 },
  { name: "Sinarest", genericName: "Paracetamol + Phenylephrine", category: "Cold & Cough", manufacturer: "Centaur", price: 42, description: "Cold and sinus relief", dosage: "1 tablet every 6 hours", prescriptionRequired: false, inStock: true, stockQuantity: 35 },
  { name: "Vicks Cough Drops", genericName: "Menthol", category: "Cold & Cough", manufacturer: "P&G", price: 10, description: "Throat soothing drops", dosage: "1 drop every 2 hours", prescriptionRequired: false, inStock: true, stockQuantity: 100 },

  // Digestive
  { name: "ORS Packets", genericName: "Oral Rehydration Salts", category: "Digestive", manufacturer: "Generic", price: 8, description: "Rehydration solution", dosage: "1 packet in 200ml water", prescriptionRequired: false, inStock: true, stockQuantity: 200 },
  { name: "Electral Powder", genericName: "Oral Rehydration Salts", category: "Digestive", manufacturer: "FDC", price: 15, description: "Electrolyte replacement", dosage: "1 sachet in 200ml water", prescriptionRequired: false, inStock: true, stockQuantity: 150 },
  { name: "Digene Gel", genericName: "Aluminium Hydroxide", category: "Digestive", manufacturer: "Abbott", price: 25, description: "Antacid gel", dosage: "10ml after meals", prescriptionRequired: false, inStock: true, stockQuantity: 60 },
  { name: "ENO Fruit Salt", genericName: "Sodium Bicarbonate", category: "Digestive", manufacturer: "GSK", price: 18, description: "Antacid powder", dosage: "1 tsp in water", prescriptionRequired: false, inStock: true, stockQuantity: 80 },
  { name: "Pudin Hara", genericName: "Pudina Extract", category: "Digestive", manufacturer: "Dabur", price: 22, description: "Digestive drops", dosage: "10-15 drops in water", prescriptionRequired: false, inStock: true, stockQuantity: 70 },

  // Vitamins & Supplements
  { name: "Vitamin D3", genericName: "Cholecalciferol", category: "Vitamins", manufacturer: "Generic", price: 120, description: "Vitamin D supplement", dosage: "1 tablet weekly", prescriptionRequired: false, inStock: true, stockQuantity: 40 },
  { name: "Vitamin C", genericName: "Ascorbic Acid", category: "Vitamins", manufacturer: "Generic", price: 85, description: "Vitamin C supplement", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 60 },
  { name: "Calcium Tablets", genericName: "Calcium Carbonate", category: "Vitamins", manufacturer: "Generic", price: 95, description: "Calcium supplement", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 50 },
  { name: "Iron Tablets", genericName: "Ferrous Sulfate", category: "Vitamins", manufacturer: "Generic", price: 75, description: "Iron supplement", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 45 },
  { name: "Multivitamin", genericName: "Mixed Vitamins", category: "Vitamins", manufacturer: "Revital", price: 150, description: "Complete vitamin supplement", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 30 },

  // Antibiotics
  { name: "Amoxicillin 250mg", genericName: "Amoxicillin", category: "Antibiotics", manufacturer: "Generic", price: 85, description: "Broad spectrum antibiotic", dosage: "1 capsule every 8 hours", prescriptionRequired: true, inStock: true, stockQuantity: 25 },
  { name: "Amoxicillin 500mg", genericName: "Amoxicillin", category: "Antibiotics", manufacturer: "Generic", price: 125, description: "Broad spectrum antibiotic", dosage: "1 capsule every 8 hours", prescriptionRequired: true, inStock: true, stockQuantity: 20 },
  { name: "Azithromycin 250mg", genericName: "Azithromycin", category: "Antibiotics", manufacturer: "Generic", price: 145, description: "Macrolide antibiotic", dosage: "1 tablet daily for 3 days", prescriptionRequired: true, inStock: true, stockQuantity: 15 },
  { name: "Ciprofloxacin 500mg", genericName: "Ciprofloxacin", category: "Antibiotics", manufacturer: "Generic", price: 95, description: "Fluoroquinolone antibiotic", dosage: "1 tablet every 12 hours", prescriptionRequired: true, inStock: true, stockQuantity: 18 },

  // Allergy
  { name: "Cetirizine 10mg", genericName: "Cetirizine", category: "Allergy", manufacturer: "Generic", price: 22, description: "Antihistamine", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 80 },
  { name: "Allegra 120mg", genericName: "Fexofenadine", category: "Allergy", manufacturer: "Sanofi", price: 65, description: "Non-drowsy antihistamine", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 40 },
  { name: "Avil 25mg", genericName: "Pheniramine", category: "Allergy", manufacturer: "Sanofi", price: 18, description: "Antihistamine", dosage: "1 tablet every 8 hours", prescriptionRequired: false, inStock: true, stockQuantity: 60 },

  // Gastric
  { name: "Omeprazole 20mg", genericName: "Omeprazole", category: "Gastric", manufacturer: "Generic", price: 45, description: "Proton pump inhibitor", dosage: "1 capsule daily before breakfast", prescriptionRequired: false, inStock: true, stockQuantity: 35 },
  { name: "Pantoprazole 40mg", genericName: "Pantoprazole", category: "Gastric", manufacturer: "Generic", price: 55, description: "Proton pump inhibitor", dosage: "1 tablet daily before breakfast", prescriptionRequired: false, inStock: true, stockQuantity: 30 },
  { name: "Ranitidine 150mg", genericName: "Ranitidine", category: "Gastric", manufacturer: "Generic", price: 35, description: "H2 receptor blocker", dosage: "1 tablet twice daily", prescriptionRequired: false, inStock: true, stockQuantity: 40 },

  // Diabetes
  { name: "Metformin 500mg", genericName: "Metformin", category: "Diabetes", manufacturer: "Generic", price: 65, description: "Diabetes medication", dosage: "1 tablet twice daily with meals", prescriptionRequired: true, inStock: true, stockQuantity: 25 },
  { name: "Glimepiride 1mg", genericName: "Glimepiride", category: "Diabetes", manufacturer: "Generic", price: 85, description: "Diabetes medication", dosage: "1 tablet daily before breakfast", prescriptionRequired: true, inStock: true, stockQuantity: 20 },

  // Heart & BP
  { name: "Atorvastatin 10mg", genericName: "Atorvastatin", category: "Heart", manufacturer: "Generic", price: 95, description: "Cholesterol medication", dosage: "1 tablet daily at bedtime", prescriptionRequired: true, inStock: true, stockQuantity: 22 },
  { name: "Losartan 50mg", genericName: "Losartan", category: "Heart", manufacturer: "Generic", price: 75, description: "Blood pressure medication", dosage: "1 tablet daily", prescriptionRequired: true, inStock: true, stockQuantity: 28 },
  { name: "Amlodipine 5mg", genericName: "Amlodipine", category: "Heart", manufacturer: "Generic", price: 55, description: "Blood pressure medication", dosage: "1 tablet daily", prescriptionRequired: true, inStock: true, stockQuantity: 32 },

  // Skin Care
  { name: "Betnovate Cream", genericName: "Betamethasone", category: "Skin Care", manufacturer: "GSK", price: 45, description: "Topical steroid cream", dosage: "Apply thin layer twice daily", prescriptionRequired: false, inStock: true, stockQuantity: 25 },
  { name: "Soframycin Cream", genericName: "Framycetin", category: "Skin Care", manufacturer: "Sanofi", price: 35, description: "Antibiotic cream", dosage: "Apply 2-3 times daily", prescriptionRequired: false, inStock: true, stockQuantity: 30 },
  { name: "Calamine Lotion", genericName: "Calamine", category: "Skin Care", manufacturer: "Generic", price: 25, description: "Soothing lotion", dosage: "Apply as needed", prescriptionRequired: false, inStock: true, stockQuantity: 40 },

  // Eye Care
  { name: "Refresh Tears", genericName: "Carboxymethylcellulose", category: "Eye Care", manufacturer: "Allergan", price: 85, description: "Artificial tears", dosage: "1-2 drops as needed", prescriptionRequired: false, inStock: true, stockQuantity: 20 },
  { name: "Moxifloxacin Eye Drops", genericName: "Moxifloxacin", category: "Eye Care", manufacturer: "Generic", price: 125, description: "Antibiotic eye drops", dosage: "1 drop every 4 hours", prescriptionRequired: true, inStock: true, stockQuantity: 15 },

  // Women's Health
  { name: "Folic Acid 5mg", genericName: "Folic Acid", category: "Women's Health", manufacturer: "Generic", price: 35, description: "Folic acid supplement", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 50 },
  { name: "Iron + Folic Acid", genericName: "Ferrous Sulfate + Folic Acid", category: "Women's Health", manufacturer: "Generic", price: 45, description: "Iron and folic acid supplement", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 45 },

  // Mental Health
  { name: "Fluoxetine 20mg", genericName: "Fluoxetine", category: "Mental Health", manufacturer: "Generic", price: 155, description: "Antidepressant", dosage: "1 capsule daily in morning", prescriptionRequired: true, inStock: true, stockQuantity: 12 },
  { name: "Alprazolam 0.5mg", genericName: "Alprazolam", category: "Mental Health", manufacturer: "Generic", price: 85, description: "Anti-anxiety medication", dosage: "As directed by doctor", prescriptionRequired: true, inStock: true, stockQuantity: 10 },

  // Respiratory
  { name: "Salbutamol Inhaler", genericName: "Salbutamol", category: "Respiratory", manufacturer: "Cipla", price: 125, description: "Bronchodilator inhaler", dosage: "2 puffs as needed", prescriptionRequired: false, inStock: true, stockQuantity: 18 },
  { name: "Montelukast 10mg", genericName: "Montelukast", category: "Respiratory", manufacturer: "Generic", price: 95, description: "Asthma medication", dosage: "1 tablet daily at bedtime", prescriptionRequired: true, inStock: true, stockQuantity: 22 },

  // Additional Common Medicines
  { name: "Panadol", genericName: "Paracetamol", category: "Pain Relief", manufacturer: "GSK", price: 28, description: "Pain and fever relief", dosage: "1-2 tablets every 4-6 hours", prescriptionRequired: false, inStock: true, stockQuantity: 75 },
  { name: "Brufen", genericName: "Ibuprofen", category: "Pain Relief", manufacturer: "Abbott", price: 32, description: "Anti-inflammatory", dosage: "1 tablet every 6-8 hours", prescriptionRequired: false, inStock: true, stockQuantity: 55 },
  { name: "Volini Gel", genericName: "Diclofenac", category: "Pain Relief", manufacturer: "Ranbaxy", price: 65, description: "Topical pain relief gel", dosage: "Apply 3-4 times daily", prescriptionRequired: false, inStock: true, stockQuantity: 35 },
  { name: "Moov Cream", genericName: "Wintergreen Oil", category: "Pain Relief", manufacturer: "Reckitt", price: 45, description: "Pain relief cream", dosage: "Apply as needed", prescriptionRequired: false, inStock: true, stockQuantity: 40 },
  { name: "Zincovit Tablets", genericName: "Multivitamin + Zinc", category: "Vitamins", manufacturer: "Apex", price: 125, description: "Multivitamin with zinc", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 35 },
  { name: "Becosules Capsules", genericName: "Vitamin B Complex", category: "Vitamins", manufacturer: "Pfizer", price: 85, description: "B-complex vitamins", dosage: "1 capsule daily", prescriptionRequired: false, inStock: true, stockQuantity: 45 },
  { name: "Shelcal 500", genericName: "Calcium + Vitamin D3", category: "Vitamins", manufacturer: "Torrent", price: 115, description: "Calcium with Vitamin D3", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 38 },
  { name: "Neurobion Forte", genericName: "Vitamin B1+B6+B12", category: "Vitamins", manufacturer: "P&G", price: 95, description: "Neurotropic vitamins", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 42 },
  { name: "Liv 52", genericName: "Herbal Liver Tonic", category: "Digestive", manufacturer: "Himalaya", price: 155, description: "Liver health supplement", dosage: "2 tablets twice daily", prescriptionRequired: false, inStock: true, stockQuantity: 28 },
  { name: "Hajmola", genericName: "Digestive Tablets", category: "Digestive", manufacturer: "Dabur", price: 12, description: "Digestive aid", dosage: "1-2 tablets after meals", prescriptionRequired: false, inStock: true, stockQuantity: 100 },
  { name: "Gelusil", genericName: "Aluminium Hydroxide + Magnesium", category: "Digestive", manufacturer: "Pfizer", price: 35, description: "Antacid tablets", dosage: "1-2 tablets after meals", prescriptionRequired: false, inStock: true, stockQuantity: 65 },
  { name: "Cyclopam", genericName: "Dicyclomine + Paracetamol", category: "Pain Relief", manufacturer: "Indoco", price: 45, description: "Antispasmodic", dosage: "1 tablet every 8 hours", prescriptionRequired: false, inStock: true, stockQuantity: 35 },
  { name: "Saridon", genericName: "Paracetamol + Propyphenazone + Caffeine", category: "Pain Relief", manufacturer: "Bayer", price: 38, description: "Headache relief", dosage: "1-2 tablets as needed", prescriptionRequired: false, inStock: true, stockQuantity: 48 },
  { name: "Nicip Plus", genericName: "Nimesulide + Paracetamol", category: "Pain Relief", manufacturer: "Cipla", price: 42, description: "Pain and inflammation relief", dosage: "1 tablet twice daily", prescriptionRequired: false, inStock: true, stockQuantity: 32 },
  { name: "Wikoryl", genericName: "Paracetamol + Phenylephrine + Cetirizine", category: "Cold & Cough", manufacturer: "Alkem", price: 48, description: "Cold and flu relief", dosage: "1 tablet every 8 hours", prescriptionRequired: false, inStock: true, stockQuantity: 38 },
  { name: "D Cold Total", genericName: "Paracetamol + Phenylephrine + Cetirizine + Caffeine", category: "Cold & Cough", manufacturer: "Paras", price: 52, description: "Complete cold relief", dosage: "1 tablet every 8 hours", prescriptionRequired: false, inStock: true, stockQuantity: 28 },
  { name: "Strepsils", genericName: "Dichlorobenzyl Alcohol", category: "Cold & Cough", manufacturer: "Reckitt", price: 25, description: "Throat lozenges", dosage: "1 lozenge every 2-3 hours", prescriptionRequired: false, inStock: true, stockQuantity: 85 },
  { name: "Cofsils", genericName: "Amylmetacresol + Dichlorobenzyl Alcohol", category: "Cold & Cough", manufacturer: "Abbott", price: 28, description: "Throat lozenges", dosage: "1 lozenge every 2-3 hours", prescriptionRequired: false, inStock: true, stockQuantity: 75 },
  { name: "Loperamide", genericName: "Loperamide", category: "Digestive", manufacturer: "Generic", price: 35, description: "Anti-diarrheal", dosage: "2mg initially, then 1mg after each loose stool", prescriptionRequired: false, inStock: true, stockQuantity: 45 },
  { name: "Domperidone 10mg", genericName: "Domperidone", category: "Digestive", manufacturer: "Generic", price: 28, description: "Anti-nausea medication", dosage: "1 tablet before meals", prescriptionRequired: false, inStock: true, stockQuantity: 55 },
  { name: "Ondansetron 4mg", genericName: "Ondansetron", category: "Digestive", manufacturer: "Generic", price: 45, description: "Anti-nausea medication", dosage: "1 tablet as needed", prescriptionRequired: true, inStock: true, stockQuantity: 25 },
  { name: "Lactobacillus", genericName: "Lactobacillus", category: "Digestive", manufacturer: "Generic", price: 85, description: "Probiotic supplement", dosage: "1 capsule daily", prescriptionRequired: false, inStock: true, stockQuantity: 35 },
  { name: "Zinc Tablets", genericName: "Zinc Sulfate", category: "Vitamins", manufacturer: "Generic", price: 55, description: "Zinc supplement", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 48 },
  { name: "Magnesium Tablets", genericName: "Magnesium Oxide", category: "Vitamins", manufacturer: "Generic", price: 65, description: "Magnesium supplement", dosage: "1 tablet daily", prescriptionRequired: false, inStock: true, stockQuantity: 42 },
  { name: "Omega 3 Capsules", genericName: "Omega 3 Fatty Acids", category: "Vitamins", manufacturer: "Generic", price: 185, description: "Omega 3 supplement", dosage: "1 capsule daily", prescriptionRequired: false, inStock: true, stockQuantity: 25 },
  { name: "Protein Powder", genericName: "Whey Protein", category: "Vitamins", manufacturer: "Generic", price: 850, description: "Protein supplement", dosage: "1 scoop daily", prescriptionRequired: false, inStock: true, stockQuantity: 15 },
  { name: "Antiseptic Cream", genericName: "Povidone Iodine", category: "Skin Care", manufacturer: "Generic", price: 35, description: "Antiseptic cream", dosage: "Apply as needed", prescriptionRequired: false, inStock: true, stockQuantity: 45 },
  { name: "Hydrocortisone Cream", genericName: "Hydrocortisone", category: "Skin Care", manufacturer: "Generic", price: 55, description: "Anti-inflammatory cream", dosage: "Apply thin layer twice daily", prescriptionRequired: false, inStock: true, stockQuantity: 28 },
  { name: "Antifungal Cream", genericName: "Clotrimazole", category: "Skin Care", manufacturer: "Generic", price: 45, description: "Antifungal cream", dosage: "Apply twice daily", prescriptionRequired: false, inStock: true, stockQuantity: 32 },
  { name: "Sunscreen SPF 30", genericName: "Zinc Oxide + Titanium Dioxide", category: "Skin Care", manufacturer: "Generic", price: 125, description: "Sun protection", dosage: "Apply before sun exposure", prescriptionRequired: false, inStock: true, stockQuantity: 22 },
  { name: "Moisturizing Lotion", genericName: "Glycerin + Petrolatum", category: "Skin Care", manufacturer: "Generic", price: 85, description: "Skin moisturizer", dosage: "Apply as needed", prescriptionRequired: false, inStock: true, stockQuantity: 35 },
  { name: "Hand Sanitizer", genericName: "Ethyl Alcohol", category: "Hygiene", manufacturer: "Generic", price: 45, description: "Hand sanitizer", dosage: "Use as needed", prescriptionRequired: false, inStock: true, stockQuantity: 100 },
  { name: "Thermometer", genericName: "Digital Thermometer", category: "Medical Device", manufacturer: "Generic", price: 185, description: "Digital thermometer", dosage: "Use as needed", prescriptionRequired: false, inStock: true, stockQuantity: 25 },
  { name: "Blood Pressure Monitor", genericName: "Digital BP Monitor", category: "Medical Device", manufacturer: "Generic", price: 1250, description: "Digital BP monitor", dosage: "Use as needed", prescriptionRequired: false, inStock: true, stockQuantity: 8 },
  { name: "Glucose Test Strips", genericName: "Glucose Test Strips", category: "Medical Device", manufacturer: "Generic", price: 285, description: "Blood glucose test strips", dosage: "Use as needed", prescriptionRequired: false, inStock: true, stockQuantity: 15 },
  { name: "Bandages", genericName: "Adhesive Bandages", category: "First Aid", manufacturer: "Generic", price: 25, description: "Adhesive bandages", dosage: "Use as needed", prescriptionRequired: false, inStock: true, stockQuantity: 150 },
  { name: "Cotton Swabs", genericName: "Cotton Swabs", category: "First Aid", manufacturer: "Generic", price: 15, description: "Cotton swabs", dosage: "Use as needed", prescriptionRequired: false, inStock: true, stockQuantity: 200 },
  { name: "Surgical Mask", genericName: "Surgical Mask", category: "Hygiene", manufacturer: "Generic", price: 5, description: "Disposable surgical mask", dosage: "Use as needed", prescriptionRequired: false, inStock: true, stockQuantity: 500 },
  { name: "N95 Mask", genericName: "N95 Respirator", category: "Hygiene", manufacturer: "Generic", price: 25, description: "N95 respirator mask", dosage: "Use as needed", prescriptionRequired: false, inStock: true, stockQuantity: 100 },
  { name: "Pulse Oximeter", genericName: "Pulse Oximeter", category: "Medical Device", manufacturer: "Generic", price: 850, description: "Pulse oximeter", dosage: "Use as needed", prescriptionRequired: false, inStock: true, stockQuantity: 12 },
  { name: "Inhaler Spacer", genericName: "Inhaler Spacer", category: "Respiratory", manufacturer: "Generic", price: 185, description: "Inhaler spacer device", dosage: "Use with inhaler", prescriptionRequired: false, inStock: true, stockQuantity: 18 },
  { name: "Nebulizer", genericName: "Nebulizer Machine", category: "Respiratory", manufacturer: "Generic", price: 1850, description: "Nebulizer machine", dosage: "Use as directed", prescriptionRequired: false, inStock: true, stockQuantity: 5 },
  { name: "Saline Nasal Spray", genericName: "Sodium Chloride", category: "Cold & Cough", manufacturer: "Generic", price: 65, description: "Nasal saline spray", dosage: "2-3 sprays per nostril", prescriptionRequired: false, inStock: true, stockQuantity: 45 },
  { name: "Throat Spray", genericName: "Benzocaine", category: "Cold & Cough", manufacturer: "Generic", price: 85, description: "Throat numbing spray", dosage: "2-3 sprays as needed", prescriptionRequired: false, inStock: true, stockQuantity: 28 },
  { name: "Ear Drops", genericName: "Mineral Oil", category: "Ear Care", manufacturer: "Generic", price: 45, description: "Ear wax removal drops", dosage: "2-3 drops twice daily", prescriptionRequired: false, inStock: true, stockQuantity: 35 },
  { name: "Pregnancy Test Kit", genericName: "hCG Test Kit", category: "Women's Health", manufacturer: "Generic", price: 85, description: "Home pregnancy test", dosage: "Use as directed", prescriptionRequired: false, inStock: true, stockQuantity: 25 },
  { name: "Ovulation Test Kit", genericName: "LH Test Kit", category: "Women's Health", manufacturer: "Generic", price: 125, description: "Ovulation prediction kit", dosage: "Use as directed", prescriptionRequired: false, inStock: true, stockQuantity: 15 },
  { name: "Condoms", genericName: "Latex Condoms", category: "Family Planning", manufacturer: "Generic", price: 45, description: "Latex condoms", dosage: "Use as needed", prescriptionRequired: false, inStock: true, stockQuantity: 100 },
  { name: "Emergency Contraceptive", genericName: "Levonorgestrel", category: "Family Planning", manufacturer: "Generic", price: 125, description: "Emergency contraceptive pill", dosage: "1 tablet within 72 hours", prescriptionRequired: false, inStock: true, stockQuantity: 20 },
  { name: "Antacid Syrup", genericName: "Aluminium Hydroxide + Magnesium Hydroxide", category: "Digestive", manufacturer: "Generic", price: 55, description: "Liquid antacid", dosage: "10ml after meals", prescriptionRequired: false, inStock: true, stockQuantity: 40 },
  { name: "Cough Lozenges", genericName: "Menthol + Eucalyptus", category: "Cold & Cough", manufacturer: "Generic", price: 18, description: "Cough relief lozenges", dosage: "1 lozenge every 2 hours", prescriptionRequired: false, inStock: true, stockQuantity: 85 },
  { name: "Vapor Rub", genericName: "Camphor + Menthol + Eucalyptus", category: "Cold & Cough", manufacturer: "Vicks", price: 65, description: "Chest rub for congestion", dosage: "Apply to chest and throat", prescriptionRequired: false, inStock: true, stockQuantity: 45 },
  { name: "Nasal Decongestant", genericName: "Oxymetazoline", category: "Cold & Cough", manufacturer: "Generic", price: 75, description: "Nasal decongestant spray", dosage: "2-3 sprays per nostril", prescriptionRequired: false, inStock: true, stockQuantity: 32 },
  { name: "Antihistamine Syrup", genericName: "Chlorpheniramine", category: "Allergy", manufacturer: "Generic", price: 45, description: "Liquid antihistamine", dosage: "5ml every 6 hours", prescriptionRequired: false, inStock: true, stockQuantity: 38 },
  { name: "Calamine + Zinc Oxide Lotion", genericName: "Calamine + Zinc Oxide", category: "Skin Care", manufacturer: "Generic", price: 35, description: "Soothing skin lotion", dosage: "Apply as needed", prescriptionRequired: false, inStock: true, stockQuantity: 55 },
  { name: "Antifungal Powder", genericName: "Clotrimazole Powder", category: "Skin Care", manufacturer: "Generic", price: 55, description: "Antifungal dusting powder", dosage: "Apply twice daily", prescriptionRequired: false, inStock: true, stockQuantity: 42 },
  { name: "Hemorrhoid Cream", genericName: "Hydrocortisone + Lidocaine", category: "Digestive", manufacturer: "Generic", price: 85, description: "Hemorrhoid relief cream", dosage: "Apply as directed", prescriptionRequired: false, inStock: true, stockQuantity: 25 },
  { name: "Laxative Tablets", genericName: "Bisacodyl", category: "Digestive", manufacturer: "Generic", price: 35, description: "Laxative tablets", dosage: "1-2 tablets at bedtime", prescriptionRequired: false, inStock: true, stockQuantity: 48 },
  { name: "Stool Softener", genericName: "Docusate Sodium", category: "Digestive", manufacturer: "Generic", price: 45, description: "Stool softener", dosage: "1 capsule daily", prescriptionRequired: false, inStock: true, stockQuantity: 35 }
];

async function seedMedicines() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing medicines
    await Medicine.deleteMany({});
    console.log('Cleared existing medicines');
    
    // Insert new medicines
    await Medicine.insertMany(medicines);
    console.log(`Inserted ${medicines.length} medicines`);
    
    console.log('Medicine seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding medicines:', error);
    process.exit(1);
  }
}

seedMedicines();
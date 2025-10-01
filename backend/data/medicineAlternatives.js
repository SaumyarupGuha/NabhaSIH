// Medicine alternatives database
const medicineAlternatives = {
  // Pain relievers
  "Paracetamol": ["Acetaminophen", "Tylenol", "Crocin", "Dolo", "Calpol"],
  "Ibuprofen": ["Advil", "Brufen", "Combiflam", "Paracetamol", "Aspirin"],
  "Aspirin": ["Disprin", "Ecosprin", "Ibuprofen", "Paracetamol"],
  "Diclofenac": ["Voveran", "Voltaren", "Ibuprofen", "Aspirin"],
  
  // Antibiotics
  "Amoxicillin": ["Augmentin", "Ampicillin", "Penicillin", "Azithromycin"],
  "Azithromycin": ["Zithromax", "Z-Pack", "Amoxicillin", "Clarithromycin"],
  "Ciprofloxacin": ["Cipro", "Levofloxacin", "Ofloxacin"],
  
  // Cough & Cold
  "Cough Syrup": ["Benadryl Cough", "Ascoril", "Alex", "Honey"],
  "Cetirizine": ["Zyrtec", "Alerid", "Loratadine", "Fexofenadine"],
  "Phenylephrine": ["Sudafed", "Pseudoephedrine"],
  
  // Vitamins
  "Vitamin D3": ["Calcitriol", "Cholecalciferol", "Vitamin D2"],
  "Vitamin B12": ["Cyanocobalamin", "Methylcobalamin"],
  "Vitamin C": ["Ascorbic Acid", "Limcee", "Celin"],
  
  // Diabetes
  "Metformin": ["Glucophage", "Glycomet", "Insulin"],
  "Insulin": ["Metformin", "Glimepiride", "Gliclazide"],
  
  // Hypertension
  "Amlodipine": ["Norvasc", "Telmisartan", "Losartan"],
  "Atenolol": ["Tenormin", "Metoprolol", "Propranolol"],
  
  // Antacids
  "Omeprazole": ["Prilosec", "Pantoprazole", "Ranitidine", "Eno"],
  "Ranitidine": ["Zantac", "Omeprazole", "Pantoprazole"],
  
  // Generic mappings
  "Acetaminophen": ["Paracetamol", "Tylenol", "Crocin"],
  "Tylenol": ["Paracetamol", "Acetaminophen", "Crocin"],
  "Crocin": ["Paracetamol", "Tylenol", "Dolo"],
  "Dolo": ["Paracetamol", "Crocin", "Calpol"],
  "Brufen": ["Ibuprofen", "Advil", "Combiflam"],
  "Disprin": ["Aspirin", "Ecosprin"],
  "Zithromax": ["Azithromycin", "Z-Pack"],
  "Zyrtec": ["Cetirizine", "Alerid"],
  "Glucophage": ["Metformin", "Glycomet"],
  "Norvasc": ["Amlodipine"],
  "Prilosec": ["Omeprazole", "Pantoprazole"]
};

// Function to get alternatives for a medicine
const getAlternatives = (medicineName) => {
  const name = medicineName.toLowerCase();
  
  // Direct lookup
  for (const [key, alternatives] of Object.entries(medicineAlternatives)) {
    if (key.toLowerCase() === name || key.toLowerCase().includes(name)) {
      return alternatives;
    }
  }
  
  // Partial match lookup
  for (const [key, alternatives] of Object.entries(medicineAlternatives)) {
    if (name.includes(key.toLowerCase()) || key.toLowerCase().includes(name)) {
      return alternatives;
    }
  }
  
  return [];
};

module.exports = { medicineAlternatives, getAlternatives };
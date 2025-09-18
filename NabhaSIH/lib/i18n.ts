export type Language = "en" | "hi" | "pa"

export interface Translations {
  // Navigation
  home: string
  consultations: string
  pharmacies: string
  hospitals: string
  admin: string
  profile: string
  logout: string

  // Common
  welcome: string
  loading: string
  error: string
  success: string
  cancel: string
  save: string
  edit: string
  delete: string
  search: string

  // Homepage
  heroTitle: string
  heroSubtitle: string
  bookConsultation: string
  findPharmacy: string
  emergencyContact: string

  // Patient Portal
  myAppointments: string
  bookAppointment: string
  medicalHistory: string
  prescriptions: string

  // Pharmacy
  orderMedicine: string
  medicineAvailable: string
  contactPharmacy: string

  // Hospital Staff
  patientQueue: string
  consultationHistory: string
  prescribeMedicine: string

  // Admin
  manageUsers: string
  managePharmacies: string
  manageHospitals: string
  systemStats: string
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    home: "Home",
    consultations: "Consultations",
    pharmacies: "Pharmacies",
    hospitals: "Hospitals",
    admin: "Admin",
    profile: "Profile",
    logout: "Logout",

    // Common
    welcome: "Welcome",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    search: "Search",

    // Homepage
    heroTitle: "Healthcare for Rural Nabha",
    heroSubtitle: "Connect with local doctors, hospitals, and pharmacies from your village",
    bookConsultation: "Book Consultation",
    findPharmacy: "Find Pharmacy",
    emergencyContact: "Emergency Contact",

    // Patient Portal
    myAppointments: "My Appointments",
    bookAppointment: "Book Appointment",
    medicalHistory: "Medical History",
    prescriptions: "Prescriptions",

    // Pharmacy
    orderMedicine: "Order Medicine",
    medicineAvailable: "Medicine Available",
    contactPharmacy: "Contact Pharmacy",

    // Hospital Staff
    patientQueue: "Patient Queue",
    consultationHistory: "Consultation History",
    prescribeMedicine: "Prescribe Medicine",

    // Admin
    manageUsers: "Manage Users",
    managePharmacies: "Manage Pharmacies",
    manageHospitals: "Manage Hospitals",
    systemStats: "System Statistics",
  },
  hi: {
    // Navigation
    home: "होम",
    consultations: "परामर्श",
    pharmacies: "दवाखाने",
    hospitals: "अस्पताल",
    admin: "प्रशासन",
    profile: "प्रोफाइल",
    logout: "लॉगआउट",

    // Common
    welcome: "स्वागत है",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    cancel: "रद्द करें",
    save: "सेव करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    search: "खोजें",

    // Homepage
    heroTitle: "ग्रामीण नाभा के लिए स्वास्थ्य सेवा",
    heroSubtitle: "अपने गांव से स्थानीय डॉक्टरों, अस्पतालों और दवाखानों से जुड़ें",
    bookConsultation: "परामर्श बुक करें",
    findPharmacy: "दवाखाना खोजें",
    emergencyContact: "आपातकालीन संपर्क",

    // Patient Portal
    myAppointments: "मेरी अपॉइंटमेंट्स",
    bookAppointment: "अपॉइंटमेंट बुक करें",
    medicalHistory: "चिकित्सा इतिहास",
    prescriptions: "नुस्खे",

    // Pharmacy
    orderMedicine: "दवा ऑर्डर करें",
    medicineAvailable: "दवा उपलब्ध",
    contactPharmacy: "दवाखाने से संपर्क करें",

    // Hospital Staff
    patientQueue: "मरीज़ों की कतार",
    consultationHistory: "परामर्श इतिहास",
    prescribeMedicine: "दवा लिखें",

    // Admin
    manageUsers: "उपयोगकर्ता प्रबंधन",
    managePharmacies: "दवाखाना प्रबंधन",
    manageHospitals: "अस्पताल प्रबंधन",
    systemStats: "सिस्टम आंकड़े",
  },
  pa: {
    // Navigation
    home: "ਘਰ",
    consultations: "ਸਲਾਹ",
    pharmacies: "ਦਵਾਈ ਦੀ ਦੁਕਾਨਾਂ",
    hospitals: "ਹਸਪਤਾਲ",
    admin: "ਪ੍ਰਸ਼ਾਸਨ",
    profile: "ਪ੍ਰੋਫਾਈਲ",
    logout: "ਲਾਗਆਉਟ",

    // Common
    welcome: "ਜੀ ਆਇਆਂ ਨੂੰ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    error: "ਗਲਤੀ",
    success: "ਸਫਲਤਾ",
    cancel: "ਰੱਦ ਕਰੋ",
    save: "ਸੇਵ ਕਰੋ",
    edit: "ਸੰਪਾਦਨ",
    delete: "ਮਿਟਾਓ",
    search: "ਖੋਜੋ",

    // Homepage
    heroTitle: "ਪਿੰਡੀ ਨਾਭਾ ਲਈ ਸਿਹਤ ਸੇਵਾ",
    heroSubtitle: "ਆਪਣੇ ਪਿੰਡ ਤੋਂ ਸਥਾਨਕ ਡਾਕਟਰਾਂ, ਹਸਪਤਾਲਾਂ ਅਤੇ ਦਵਾਈ ਦੀਆਂ ਦੁਕਾਨਾਂ ਨਾਲ ਜੁੜੋ",
    bookConsultation: "ਸਲਾਹ ਬੁੱਕ ਕਰੋ",
    findPharmacy: "ਦਵਾਈ ਦੀ ਦੁਕਾਨ ਲੱਭੋ",
    emergencyContact: "ਐਮਰਜੈਂਸੀ ਸੰਪਰਕ",

    // Patient Portal
    myAppointments: "ਮੇਰੀਆਂ ਮੁਲਾਕਾਤਾਂ",
    bookAppointment: "ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰੋ",
    medicalHistory: "ਮੈਡੀਕਲ ਇਤਿਹਾਸ",
    prescriptions: "ਨੁਸਖੇ",

    // Pharmacy
    orderMedicine: "ਦਵਾਈ ਆਰਡਰ ਕਰੋ",
    medicineAvailable: "ਦਵਾਈ ਉਪਲਬਧ",
    contactPharmacy: "ਦਵਾਈ ਦੀ ਦੁਕਾਨ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",

    // Hospital Staff
    patientQueue: "ਮਰੀਜ਼ਾਂ ਦੀ ਕਤਾਰ",
    consultationHistory: "ਸਲਾਹ ਇਤਿਹਾਸ",
    prescribeMedicine: "ਦਵਾਈ ਲਿਖੋ",

    // Admin
    manageUsers: "ਉਪਭੋਗਤਾ ਪ੍ਰਬੰਧਨ",
    managePharmacies: "ਦਵਾਈ ਦੀਆਂ ਦੁਕਾਨਾਂ ਦਾ ਪ੍ਰਬੰਧਨ",
    manageHospitals: "ਹਸਪਤਾਲ ਪ੍ਰਬੰਧਨ",
    systemStats: "ਸਿਸਟਮ ਅੰਕੜੇ",
  },
}

export function useTranslation(language: Language) {
  return translations[language]
}

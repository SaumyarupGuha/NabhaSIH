import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../context/AuthContext';
import { TermsModal } from '../components/TermsModal';
import { PrivacyModal } from '../components/PrivacyModal';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { pharmacyAPI } from '../lib/api';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    village: '',
    role: '',
    password: '',
    confirmPassword: '',
    license: '',
    specialization: '',
    hospital: '',
    consultationFee: '',
    availableDays: [],
    selectedPharmacy: ''
  });
  const [pharmacies, setPharmacies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await pharmacyAPI.getPharmacies();
        setPharmacies(response.data.data);
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
      }
    };
    fetchPharmacies();
  }, []);

  const villages = [
  "Abhepur","Achal","Agaul","Ageta","Ageti","Ajnauda kalan","Ajnauda Khurd","Akalgarh","Alampur","Alipur",
  "Allowal","Babarpur","Banera kalan","Banera Khurd","Barhe","Bauran Kalan","Bauran Khurd","Bazidpur","Bazidri","Behbalpur",
  "Bhari Panechan","Bhilowal","Bhojo Majri","Bhore","Bina Heri","Bir Agaul","Bir Bauran","Bir Dosanjhan","Birarhwal","Birdhano",
  "Bishangarh","Bishanpura","Bugga Khurd","Chahal","Chaswal","Chathe","Chhaju Bhatt","Chhana Nathuwali","Choudhri Majra","Dakaunda",
  "Dandrala Dhindsa","Dandrala Kharaur","Dargapur","Dewangarh","Dhanaura","Dhanauri","Dhangera","Dharoki","Dhingi",
  "Dhundewal","Dittupur Jattan","Doda","Duladi","Faizgarh","Faridpur","Fatehpur","Gadaya","Galwati","Ghamrouda",
  "Ghaniawal","Ghanurki","Ghunder","Gobindgarh Chhanna","Gobindpura","Gujarheri","Gunike","Gurditpura","Hakimpur","Halla",
  "Halotali","Hari nagar","Harigarh","Hassanpur","Hiana kalan","Hiana Khurd","Ichhewal","Jasso Majra","Jatiwal","Jhambali Khas",
  "Jhambali sahni","Jindalpur","Kaidupur","Kakrala","Kalar Majri","Kalhana","Kalhe majra","Kalsana","Kameli","Kansuha Kalan",
  "Kansuha Khurd","Kaul","Khanora","Kheri Jattan","Khizerpur","Khokh","Khurd","Kishangarh","Kot Kalan","Kot Khurd",
  "Kotli","Kularan","Labana Karmoo","Labana Teku","Ladha Heri","Lalauda","Lohar Majra","Lopa","Lout","Malewal",
  "Malkon","Mandaur","Mangewal","Mansurpur","Matourda","Mehas","Mohal Gawara","Mungo","Nabha","Nanoki",
  "Nanowal","Naraingarh","Narmana","Nauhra","Paharpur","Pahlia Kalan","Pahlia Khurd","Paidan","Pednni Khurd","Raimal Majri",
  "Raisal","Raj Garh","Rajpura","Ramgarh","Ramgarh Chhanna","Rampur Sahiewal","Ranjitgarh","Ranno","Rohta",
  "Rohti Basta Singh","Rohti Chhanna","Rohti Khas","Rohti Mouran","Sadhnauli","Sadho Heri","Sahauli","Sakohan","Sakrali","Saluwala",
  "Sangatpura","Sauja","Shahpur","Shamaspur","Shamla","Shivgarh","Simbhron","Siri Nagar","Sudhewal","Sukhewal",
  "Suraajpur","Tarkheri Kalan","Tarkheri khurd","Thuhi","Todarwal","Tohra","Tungan","Udha","Uplan"
];



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join Nabha Telemedicine Platform to access healthcare services</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">I want to register as</Label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select your role</option>
                  <option value="patient">Patient / रोगी / ਮਰੀਜ਼</option>
                  <option value="doctor">Doctor / डॉक्टर / ਡਾਕਟਰ</option>
                  <option value="pharmacist">Pharmacist / फार्मासिस्ट / ਫਾਰਮਾਸਿਸਟ</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name / पहला नाम / ਪਹਿਲਾ ਨਾਮ</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    placeholder="Enter first name" 
                    value={formData.firstName}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name / अंतिम नाम / ਅੰਤਿਮ ਨਾਮ</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    placeholder="Enter last name" 
                    value={formData.lastName}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age / उम्र / ਉਮਰ</Label>
                  <Input 
                    id="age" 
                    name="age"
                    type="number" 
                    placeholder="Enter age" 
                    min="1" 
                    max="120" 
                    value={formData.age}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender / लिंग / ਲਿੰਗ</Label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male / पुरुष / ਮਰਦ</option>
                    <option value="female">Female / महिला / ਔਰਤ</option>
                    <option value="other">Other / अन्य / ਹੋਰ</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number / फोन नंबर / ਫੋਨ ਨੰਬਰ</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    type="tel" 
                    placeholder="+91 98765 43210" 
                    value={formData.phone}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address (Optional)</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="your@email.com" 
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">Village / गांव / ਪਿੰਡ</Label>
                <select
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select your village</option>
                  {villages.map((village) => (
                    <option key={village} value={village.toLowerCase()}>
                      {village}
                    </option>
                  ))}
                </select>
              </div>

              {formData.role === "doctor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="license">Medical License Number</Label>
                    <Input 
                      id="license" 
                      name="license"
                      placeholder="Enter license number" 
                      value={formData.license}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input 
                      id="specialization" 
                      name="specialization"
                      placeholder="e.g., General Medicine, Pediatrics" 
                      value={formData.specialization}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Hospital/Clinic</Label>
                    <Input 
                      id="hospital" 
                      name="hospital"
                      placeholder="Enter hospital or clinic name" 
                      value={formData.hospital}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                    <Input 
                      id="consultationFee" 
                      name="consultationFee"
                      type="number"
                      placeholder="Enter consultation fee" 
                      value={formData.consultationFee}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Available Days</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.availableDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  availableDays: [...prev.availableDays, day]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  availableDays: prev.availableDays.filter(d => d !== day)
                                }));
                              }
                            }}
                          />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {formData.role === "pharmacist" && (
                <div className="space-y-2">
                  <Label htmlFor="selectedPharmacy">Select Pharmacy</Label>
                  <select
                    name="selectedPharmacy"
                    value={formData.selectedPharmacy}
                    onChange={handleChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a pharmacy</option>
                    {pharmacies.map((pharmacy) => (
                      <option key={pharmacy._id} value={pharmacy._id}>
                        {pharmacy.name} - {pharmacy.address}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password / पासवर्ड / ਪਾਸਵਰਡ</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input type="checkbox" className="rounded border-border mt-1" required />
                <div className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <button 
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button 
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <UserPlus className="mr-2 h-4 w-4" />
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Login here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
}
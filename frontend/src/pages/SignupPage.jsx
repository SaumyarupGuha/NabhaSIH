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
    pharmacyName: '',
    pharmacyAddress: '',
    selectedPharmacyId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [verifiedPharmacies, setVerifiedPharmacies] = useState([]);
  const [selectedPharmacyDetails, setSelectedPharmacyDetails] = useState(null);
  const [registeredPharmacies, setRegisteredPharmacies] = useState([]);

  const { register, setUser } = useAuth();
  const navigate = useNavigate();

  // Fetch verified pharmacies when component mounts
  useEffect(() => {
    const fetchVerifiedPharmacies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/verified-pharmacies');
        if (response.ok) {
          const data = await response.json();
          setVerifiedPharmacies(data.data || []);
        }
        
        // Update with actual registered pharmacy IDs from database
        setRegisteredPharmacies(['punjab_medical_store', 'munish_med_hall']);
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
      }
    };
    
    fetchVerifiedPharmacies();
  }, []);

  // Handle pharmacy selection
  const handlePharmacySelect = (pharmacyId) => {
    const pharmacy = verifiedPharmacies.find(p => p.id === pharmacyId);
    if (pharmacy) {
      setSelectedPharmacyDetails(pharmacy);
      setFormData({
        ...formData,
        selectedPharmacyId: pharmacyId,
        pharmacyName: pharmacy.name,
        pharmacyAddress: pharmacy.address
      });
    } else {
      setSelectedPharmacyDetails(null);
      setFormData({
        ...formData,
        selectedPharmacyId: '',
        pharmacyName: '',
        pharmacyAddress: ''
      });
    }
  };

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

    // For pharmacist role, ensure pharmacy is selected
    if (formData.role === 'pharmacist' && !formData.selectedPharmacyId) {
      setError('Please select a verified pharmacy');
      return;
    }

    setLoading(true);
    
    try {
      let result;
      
      if (formData.role === 'pharmacist') {
        // Use pharmacy signup endpoint
        const response = await fetch('http://localhost:5000/api/pharmacies/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            age: formData.age,
            gender: formData.gender,
            village: formData.village,
            contactPerson: `${formData.firstName} ${formData.lastName}`,
            pharmacyId: formData.selectedPharmacyId,
            selectedPharmacy: formData.selectedPharmacyId,
            role: 'pharmacist'
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Store token and user data for pharmacy login
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          localStorage.setItem('pharmacyId', data.data.user.pharmacyId);
          
          // Update AuthContext state
          if (setUser) {
            setUser(data.data.user);
          }
          
          // Redirect to pharmacy dashboard
          window.location.href = '/pharmacy-dashboard';
          return;
        }
        
        result = { success: response.ok, error: data.message };
      } else {
        // Use regular signup
        result = await register(formData);
      }
      
      if (result && result.success) {
        // For non-pharmacy roles, redirect to home
        navigate('/');
      } else if (result) {
        setError(result.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
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
                  {villages.map((village, index) => (
                    <option key={`${village}-${index}`} value={village.toLowerCase()}>
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
                </>
              )}

              {formData.role === "pharmacist" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="selectedPharmacyId">Select Verified Pharmacy *</Label>
                    <select
                      name="selectedPharmacyId"
                      value={formData.selectedPharmacyId}
                      onChange={(e) => handlePharmacySelect(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Choose your pharmacy...</option>
                      {verifiedPharmacies.map((pharmacy) => {
                        const isRegistered = registeredPharmacies.includes(pharmacy.id);
                        console.log(`Pharmacy: ${pharmacy.name} (${pharmacy.id}), Registered: ${isRegistered}`, registeredPharmacies);
                        return (
                          <option key={pharmacy.id} value={pharmacy.id} disabled={isRegistered}>
                            {pharmacy.name} {isRegistered ? '(Already Registered)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  {selectedPharmacyDetails && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="pharmacyName">Pharmacy Name (Auto-filled)</Label>
                        <Input 
                          id="pharmacyName" 
                          name="pharmacyName"
                          value={formData.pharmacyName}
                          readOnly
                          className="bg-gray-50 text-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pharmacyAddress">Pharmacy Address (Auto-filled)</Label>
                        <Textarea 
                          id="pharmacyAddress" 
                          name="pharmacyAddress"
                          value={formData.pharmacyAddress}
                          readOnly
                          className="bg-gray-50 text-gray-600"
                          rows="2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pharmacyPhone">Pharmacy Phone (Auto-filled)</Label>
                        <Input 
                          value={selectedPharmacyDetails.phone}
                          readOnly
                          className="bg-gray-50 text-gray-600"
                        />
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700">
                          ✓ This pharmacy is pre-verified and approved for our platform
                        </p>
                      </div>
                    </>
                  )}
                </>
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
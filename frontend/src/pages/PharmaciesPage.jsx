import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useCart } from '../context/CartContext';
import { CartModal } from '../components/CartModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { PrescriptionUpload } from '../components/PrescriptionUpload';
import { MedicineSearch } from '../components/MedicineSearch';
import { pharmacyAPI } from '../lib/api';
import { MapPin, Phone, Clock, Star, Search, NavigationIcon, Pill, ShoppingCart } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { AlternativeMedicines } from '../components/AlternativeMedicines';
import io from 'socket.io-client';

export default function PharmaciesPage() {
  // const { t } = useTranslation();
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isPrescriptionUploadOpen, setIsPrescriptionUploadOpen] = useState(false);
  const { addToCart, isCartOpen, setIsCartOpen, getCartCount } = useCart();
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [coordinates, setCoordinates] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [selectedPharmacyForOrder, setSelectedPharmacyForOrder] = useState(null);
  const [closestPharmacies, setClosestPharmacies] = useState([]);
  const [showClosestOnly, setShowClosestOnly] = useState(false);
  const { showToast, ToastContainer } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [socket, setSocket] = useState(null);
  const [pharmacyRatings, setPharmacyRatings] = useState({});
  const [medicineSearchQuery, setMedicineSearchQuery] = useState('');

  useEffect(() => {
    // Don't call getCurrentLocation immediately to avoid permission prompt on page load
    const fetchData = async () => {
      try {
        // Fetch verified pharmacies
        try {
          const pharmaciesResponse = await fetch('http://localhost:5000/api/verified-pharmacies');
          if (pharmaciesResponse.ok) {
            const data = await pharmaciesResponse.json();
            if (data.success) {
              // Convert verified pharmacy format to match existing UI
              const formattedPharmacies = data.data.map(pharmacy => ({
                _id: pharmacy.id,
                name: pharmacy.name,
                address: pharmacy.address,
                phone: pharmacy.phone,
                area: pharmacy.address.split(',')[0], // Extract area from address
                city: 'Nabha',
                coordinates: pharmacy.coordinates
              }));
              setPharmacies(formattedPharmacies);
            }
          }
        } catch (error) {
          console.error('Error fetching verified pharmacies:', error);
          setPharmacies([]);
        }

        // Fetch available medicines from all pharmacies
        try {
          const medicinesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/medicines/available`);
          if (medicinesResponse.ok) {
            const medicinesData = await medicinesResponse.json();
            if (medicinesData.success && medicinesData.data && medicinesData.data.length > 0) {
              setAvailableMedicines(medicinesData.data);
              console.log(`Loaded ${medicinesData.data.length} available medicines`);
            } else {
              throw new Error('No medicines available');
            }
          } else {
            throw new Error('Medicines API not available');
          }
        } catch (error) {
          console.error('Error fetching medicines:', error);
          // Use fallback data
          setAvailableMedicines([
            { _id: '1', name: "Paracetamol 500mg", price: "₹2.50", unitPrice: 2.50, availability: "Out of Stock", quantity: 0 },
            { _id: '2', name: "Amoxicillin 250mg", price: "₹8.00", unitPrice: 8.00, availability: "Out of Stock", quantity: 0 },
            { _id: '3', name: "Cough Syrup", price: "₹45.00", unitPrice: 45.00, availability: "In Stock", quantity: 25 },
            { _id: '4', name: "Ibuprofen", price: "₹120.00", unitPrice: 120.00, availability: "Out of Stock", quantity: 0 },
            { _id: '5', name: "Vitamin D3", price: "₹5.00", unitPrice: 5.00, availability: "In Stock", quantity: 80 },
            { _id: '6', name: "Aspirin 75mg", price: "₹1.50", unitPrice: 1.50, availability: "Out of Stock", quantity: 0 },
          ]);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Update time every minute for real-time status
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Setup Socket.io for real-time updates
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for pharmacy rating updates
    newSocket.on('pharmacyRatingUpdate', (data) => {
      setPharmacyRatings(prev => ({
        ...prev,
        [data.pharmacyId]: data.rating
      }));
      showToast(`${data.pharmacyName} rating updated: ${data.rating}⭐`, 'info');
    });

    // Listen for pharmacy status updates
    newSocket.on('pharmacyStatusUpdate', (data) => {
      setPharmacies(prev => prev.map(pharmacy => 
        pharmacy._id === data.pharmacyId 
          ? { ...pharmacy, isOpen: data.isOpen, lastUpdated: new Date() }
          : pharmacy
      ));
      showToast(`${data.pharmacyName} is now ${data.isOpen ? 'Open' : 'Closed'}`, 'info');
    });

    return () => {
      clearInterval(timeInterval);
      newSocket.disconnect();
    };
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          showToast('Location access granted', 'success');
        },
        (error) => {
          console.log('Location access denied or unavailable, using default location');
          setCoordinates({ lat: 30.3752, lng: 76.1496 }); // Nabha coordinates
          if (error.code === 1) {
            showToast('Location access denied. Using Nabha as default location.', 'info');
          } else {
            showToast('Location unavailable. Using default location.', 'info');
          }
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000
        }
      );
    } else {
      setCoordinates({ lat: 30.3752, lng: 76.1496 });
      showToast('Geolocation not supported. Using default location.', 'info');
    }
  };

  const getPharmacyCoordinates = (address) => {
    // Predefined coordinates for different areas in Nabha
    const pharmacyLocations = {
      'Model Town': { lat: 30.3780, lng: 76.1520 },
      'Main Market': { lat: 30.3740, lng: 76.1480 },
      'Railway Road': { lat: 30.3720, lng: 76.1460 },
      'Civil Lines': { lat: 30.3760, lng: 76.1500 },
      'Bus Stand Road': { lat: 30.3700, lng: 76.1440 }
    };
    
    // Find matching location based on address
    for (const [area, coords] of Object.entries(pharmacyLocations)) {
      if (address && address.includes(area)) {
        return coords;
      }
    }
    
    // Default to Nabha center with small random offset
    return {
      lat: 30.3752 + (Math.random() - 0.5) * 0.01,
      lng: 76.1496 + (Math.random() - 0.5) * 0.01
    };
  };

  const geocodeAddress = async (address, isPharmacy = false) => {
    if (isPharmacy) {
      return getPharmacyCoordinates(address);
    }
    
    console.log('🔍 Geocoding user address:', address);
    
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/google-maps/geocode?address=${encodeURIComponent(address + ', Nabha, Punjab, India')}`;
      console.log('📡 Geocoding API URL:', url);
      
      const response = await fetch(url);
      console.log('📊 Geocoding response status:', response.status);
      
      const data = await response.json();
      console.log('📍 Geocoding API response:', data);
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        console.log('✅ Successfully geocoded user address to:', location);
        return { lat: location.lat, lng: location.lng };
      } else {
        console.log('❌ Geocoding failed. Status:', data.status, 'Error:', data.error_message);
        console.log('⚠️ Falling back to default coordinates for user address');
      }
    } catch (error) {
      console.error('❌ Google Maps geocoding error:', error);
      console.log('⚠️ Network error, using default coordinates');
    }
    
    // Return default Nabha coordinates as fallback
    console.log('⚠️ Using default Nabha coordinates for user address');
    return { lat: 30.3752, lng: 76.1496 };
  };

  const findClosestPharmacies = async () => {
    if (!userAddress.trim()) {
      showToast('Please enter your address first', 'error');
      return;
    }

    if (pharmacies.length === 0) {
      showToast('No pharmacies available', 'error');
      return;
    }

    showToast('Finding closest pharmacies...', 'info');

    try {
      const userCoords = await geocodeAddress(userAddress);
      if (!userCoords) {
        showToast('Unable to find coordinates for your address', 'error');
        return;
      }

      const pharmaciesWithDistance = await Promise.all(
        pharmacies.map(async (pharmacy) => {
          const pharmacyCoords = await geocodeAddress(pharmacy.address, true);
          
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/google-maps/distance?origins=${userCoords.lat},${userCoords.lng}&destinations=${pharmacyCoords.lat},${pharmacyCoords.lng}`);
            const data = await response.json();
            
            if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
              const element = data.rows[0].elements[0];
              const distance = parseFloat(element.distance.text.replace(' km', ''));
              const duration = parseInt(element.duration.text.replace(' mins', ''));
              
              return {
                ...pharmacy,
                distance,
                duration,
                deliveryTime: element.duration.text
              };
            }
          } catch (error) {
            console.error(`Error calculating distance for ${pharmacy.name}:`, error);
          }
          
          return {
            ...pharmacy,
            distance: 999,
            duration: 999,
            deliveryTime: 'N/A'
          };
        })
      );

      // Sort by distance and get top 2
      const sortedPharmacies = pharmaciesWithDistance
        .filter(p => p.distance < 999)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2);

      setClosestPharmacies(sortedPharmacies);
      setShowClosestOnly(true);
      
      if (sortedPharmacies.length > 0) {
        showToast(`Found ${sortedPharmacies.length} closest pharmacies`, 'success');
      } else {
        showToast('Unable to calculate distances to pharmacies', 'error');
      }
    } catch (error) {
      console.error('Error finding closest pharmacies:', error);
      showToast('Error finding closest pharmacies', 'error');
    }
  };

  const calculateDistanceToPharmacy = async (pharmacy) => {
    if (!userAddress.trim()) {
      showToast('Please enter your address first', 'error');
      return;
    }

    console.log('Calculating distance from:', userAddress, 'to pharmacy:', pharmacy.name, 'at:', pharmacy.address);
    showToast('Calculating distance...', 'info');

    try {
      // First geocode the user address to get coordinates
      const userCoords = await geocodeAddress(userAddress);
      
      if (!userCoords) {
        showToast('Unable to find coordinates for your address', 'error');
        return;
      }

      // Then geocode the pharmacy address
      const pharmacyCoords = await geocodeAddress(pharmacy.address, true);
      
      if (!pharmacyCoords) {
        showToast(`Unable to find coordinates for ${pharmacy.name}`, 'error');
        return;
      }

      console.log('User coordinates:', userCoords);
      console.log('Pharmacy coordinates:', pharmacyCoords);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/google-maps/distance?origins=${userCoords.lat},${userCoords.lng}&destinations=${pharmacyCoords.lat},${pharmacyCoords.lng}`);
      const data = await response.json();
      
      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const element = data.rows[0].elements[0];
        showToast(`${pharmacy.name}: ${element.distance.text}, ${element.duration.text}`, 'delivery');
      } else {
        showToast(`Unable to calculate distance to ${pharmacy.name}`, 'error');
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
      showToast('Network error while calculating distance', 'error');
    }
  };

  const addToLocalCart = (medicine) => {
    const normalizedMedicine = {
      _id: medicine._id,
      name: medicine.name,
      medicineName: medicine.name,
      price: medicine.price,
      unitPrice: medicine.unitPrice,
      availability: medicine.availability,
      quantity: medicine.quantity,
      category: medicine.category,
      manufacturer: medicine.manufacturer
    };
    
    const existingItem = cart.find(item => item._id === medicine._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item._id === medicine._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...normalizedMedicine, quantity: 1 }]);
    }
    addToCart(normalizedMedicine);
  };

  const createOrderWithPharmacy = async (pharmacy) => {
    if (!userAddress.trim()) {
      showToast('Please enter your delivery address first', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    try {
      showToast(`Creating order with ${pharmacy.name}...`, 'info');
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get coordinates for user address - FORCE geocoding, no fallback
      console.log('🔍 Geocoding user address:', userAddress);
      let userCoords = null;
      
      // Clean and normalize the address
      let cleanAddress = userAddress.trim();
      if (!cleanAddress.toLowerCase().includes('punjab')) {
        cleanAddress += ', Punjab';
      }
      if (!cleanAddress.toLowerCase().includes('india')) {
        cleanAddress += ', India';
      }
      
      try {
        // Try with cleaned address first
        let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/google-maps/geocode?address=${encodeURIComponent(cleanAddress)}`;
        console.log('📡 Direct geocoding URL:', url);
        
        let response = await fetch(url);
        let data = await response.json();
        console.log('📍 Direct geocoding response:', data);
        
        if (data.status === 'OK' && data.results.length > 0) {
          userCoords = {
            lat: data.results[0].geometry.location.lat,
            lng: data.results[0].geometry.location.lng
          };
          console.log('✅ Successfully geocoded user address to:', userCoords);
        } else if (cleanAddress !== userAddress) {
          // Retry with original address
          console.log('🔄 Retrying with original address');
          url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/google-maps/geocode?address=${encodeURIComponent(userAddress)}`;
          response = await fetch(url);
          data = await response.json();
          
          if (data.status === 'OK' && data.results.length > 0) {
            userCoords = {
              lat: data.results[0].geometry.location.lat,
              lng: data.results[0].geometry.location.lng
            };
            console.log('✅ Geocoded with original address:', userCoords);
          }
        }
        
        if (!userCoords) {
          console.error('❌ Geocoding failed:', data.status, data.error_message);
          showToast(`Could not find location for: ${userAddress}`, 'error');
          return;
        }
      } catch (error) {
        console.error('❌ Geocoding error:', error);
        showToast('Error finding your location. Please try a different address.', 'error');
        return;
      }
      
      console.log('📍 Final user coordinates for order:', userCoords);
      
      const orderItems = cart.map(item => ({
        medicineName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity
      }));

      const orderData = {
        items: orderItems,
        customerInfo: {
          name: user.firstName ? `${user.firstName} ${user.lastName}` : 'Customer',
          phone: user.phone || '+919999999999',
          address: userAddress
        },
        deliveryAddress: userAddress,
        orderedBy: user._id || '507f1f77bcf86cd799439011',
        coordinates: userCoords,
        selectedPharmacy: pharmacy._id,
        selectedPharmacyName: pharmacy.name
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log('📦 Order creation response:', result);
      
      if (result.success) {
        const deliveryTime = result.data?.estimatedDeliveryTime || result.estimatedDeliveryTime || 'N/A';
        console.log('⏰ Extracted delivery time:', deliveryTime);
        
        // Update stock after successful order
        try {
          const stockUpdateResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stock/reduce`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              items: cart.map(item => ({
                medicineName: item.name,
                quantity: item.quantity
              }))
            })
          });
          
          if (stockUpdateResponse.ok) {
            // Update local stock state
            setAvailableMedicines(prev => 
              prev.map(medicine => {
                const cartItem = cart.find(item => item.name === medicine.name);
                if (cartItem) {
                  const newQuantity = Math.max(0, medicine.quantity - cartItem.quantity);
                  return {
                    ...medicine,
                    quantity: newQuantity,
                    availability: newQuantity > 0 ? (newQuantity <= 20 ? "Limited Stock" : "In Stock") : "Out of Stock"
                  };
                }
                return medicine;
              })
            );
          }
        } catch (stockError) {
          console.error('Error updating stock:', stockError);
        }
        
        showToast(`Order sent to ${pharmacy.name}! Delivery: ${deliveryTime}`, 'success');
        setCart([]);
        setIsCartOpen(false);
      } else {
        showToast(`Order failed: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Error creating order. Please try again.', 'error');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0).toFixed(2);
  };

  const getLocalCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getPharmacyStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Most pharmacies: 9 AM - 9 PM, closed on Sundays
    const isOpen = day !== 0 && hour >= 9 && hour < 21;
    
    return {
      isOpen,
      hours: day === 0 ? 'Closed on Sundays' : '9:00 AM - 9:00 PM'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
          <div className="mt-8">
            <LoadingSkeleton type="card" />
          </div>
          <div className="mt-8">
            <LoadingSkeleton type="list" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Local Pharmacies</h1>
          <p className="text-muted-foreground">
            Find and order medicines from nearby pharmacies
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <Input
                placeholder="Enter your address for distance calculation..."
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => {
                  if (!coordinates) getCurrentLocation();
                  findClosestPharmacies();
                }}
                disabled={!userAddress.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Find Closest
              </Button>
              {showClosestOnly && (
                <Button 
                  onClick={() => setShowClosestOnly(false)}
                  variant="outline"
                >
                  Show All
                </Button>
              )}
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={() => setIsPrescriptionUploadOpen(true)}
          >
            <Pill className="mr-2 h-4 w-4" />
            Upload Prescription
          </Button>
          <Button variant="outline" className="w-full">
            <Phone className="mr-2 h-4 w-4" />
            Emergency Order
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Local Pharmacies</h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {pharmacies.length} Available
              </Badge>
            </div>

            <div className="space-y-6">
              {showClosestOnly && closestPharmacies.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">🎯 Closest Pharmacies to You</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {closestPharmacies.map((pharmacy, index) => (
                        <div key={pharmacy._id} className="bg-white p-4 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{pharmacy.name}</h3>
                                {index === 0 && <Badge className="bg-green-100 text-green-800">Closest</Badge>}
                                {index === 1 && <Badge className="bg-blue-100 text-blue-800">2nd Closest</Badge>}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{pharmacy.address}</p>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center text-sm text-green-600">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {pharmacy.distance?.toFixed(1)} km
                                </div>
                                <div className="flex items-center text-sm text-blue-600">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {pharmacy.deliveryTime}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => createOrderWithPharmacy(pharmacy)}
                                disabled={cart.length === 0}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Pill className="mr-2 h-4 w-4" />
                                Order Here
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {(showClosestOnly ? [] : pharmacies).length === 0 && !showClosestOnly ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No pharmacies available</p>
                  </CardContent>
                </Card>
              ) : (
                !showClosestOnly && pharmacies.map((pharmacy) => (
                  <Card
                    key={pharmacy._id}
                    className={`cursor-pointer transition-all ${
                      selectedPharmacy?._id === pharmacy._id ? "ring-2 ring-primary" : "hover:shadow-lg"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Pill className="h-10 w-10 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 
                                className="text-xl font-semibold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                onClick={() => {
                                  const query = encodeURIComponent(`${pharmacy.name} ${pharmacy.address}`);
                                  window.open(`https://www.google.com/maps/search/${query}`, '_blank');
                                }}
                                title="View on Google Maps"
                              >
                                {pharmacy.name}
                              </h3>
                              {pharmacy.notes && (
                                <p className="text-muted-foreground text-sm">{pharmacy.notes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">
                                  {pharmacyRatings[pharmacy._id] || pharmacy.rating || (4.2 + Math.random() * 0.6).toFixed(1)}
                                </span>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className={getPharmacyStatus().isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                              >
                                {getPharmacyStatus().isOpen ? 'Open' : 'Closed'}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {pharmacy.address}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {getPharmacyStatus().hours}
                            </div>
                            {pharmacy.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                {pharmacy.phone}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => createOrderWithPharmacy(pharmacy)}
                              disabled={cart.length === 0 || !userAddress.trim()}
                            >
                              <Pill className="mr-2 h-4 w-4" />
                              Order from Here
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => calculateDistanceToPharmacy(pharmacy)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              Distance
                            </Button>
                            {pharmacy.phone && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(`tel:${pharmacy.phone}`, '_self')}
                              >
                                <Phone className="mr-2 h-4 w-4" />
                                Call Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Medicine Order</CardTitle>
                <CardDescription>Order common medicines quickly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search medicines..." 
                    className="pl-10"
                    value={medicineSearchQuery}
                    onChange={(e) => setMedicineSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                    {availableMedicines
                      .filter(medicine => 
                        medicine.name.toLowerCase().includes(medicineSearchQuery.toLowerCase())
                      )
                      .slice(0, 6)
                      .map((medicine, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{medicine.name}</h4>
                          <p className="text-xs text-muted-foreground">{medicine.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              medicine.availability === "In Stock"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }
                          >
                            {medicine.availability}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={() => addToLocalCart(medicine)}
                            disabled={medicine.availability === "Out of Stock"}
                          >
                            Add
                          </Button>
                        </div>
                        <AlternativeMedicines 
                          medicine={medicine} 
                          onAddAlternative={addToLocalCart}
                        />
                      </div>
                    ))}
                    {medicineSearchQuery && availableMedicines.filter(medicine => 
                      medicine.name.toLowerCase().includes(medicineSearchQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No medicines found matching "{medicineSearchQuery}"
                      </div>
                    )}
                  </div>
                <Button 
                  className="w-full" 
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Cart ({getLocalCartCount()}) Checkout
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Emergency Medicine</CardTitle>
                <CardDescription>24/7 emergency delivery service</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Need urgent medicine delivery? Call our emergency hotline for immediate assistance.
                </p>
                <Button variant="destructive" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Emergency: 108
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <CartModal />

      <PrescriptionUpload 
        isOpen={isPrescriptionUploadOpen}
        onClose={() => setIsPrescriptionUploadOpen(false)}
      />
      <ToastContainer />
    </div>
  );
}
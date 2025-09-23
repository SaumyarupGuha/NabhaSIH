import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useCart } from '../context/CartContext';
import { CartModal } from '../components/CartModal';
import { PrescriptionUpload } from '../components/PrescriptionUpload';
import { MapPin, Phone, Clock, Star, Search, NavigationIcon, Pill, ShoppingCart } from 'lucide-react';

export default function PharmaciesPage() {
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isPrescriptionUploadOpen, setIsPrescriptionUploadOpen] = useState(false);
  const { addToCart, isCartOpen, setIsCartOpen, getCartCount } = useCart();
  const [availableMedicines, setAvailableMedicines] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pharmaciesResponse = await fetch('http://localhost:5000/api/pharmacies');
        const pharmaciesData = await pharmaciesResponse.json();
        if (pharmaciesData.success) {
          setPharmacies(pharmaciesData.data);
        }

        const stockResponse = await fetch('http://localhost:5000/api/stock/pharmacy/1');
        const stockData = await stockResponse.json();
        if (stockData.success && stockData.data) {
          setAvailableMedicines(stockData.data.map(item => ({
            _id: item._id,
            name: item.medicineName,
            price: `₹${item.unitPrice}`,
            unitPrice: item.unitPrice,
            availability: item.quantity > 0 ? (item.quantity <= item.minStockLevel ? "Limited Stock" : "In Stock") : "Out of Stock",
            quantity: item.quantity,
            category: item.category,
            manufacturer: item.manufacturer,
            expiryDate: item.expiryDate
          })));
        } else {
          setAvailableMedicines([
            { _id: '1', name: "Paracetamol 500mg", price: "₹2.50", unitPrice: 2.50, availability: "In Stock", quantity: 100 },
            { _id: '2', name: "Amoxicillin 250mg", price: "₹8.00", unitPrice: 8.00, availability: "In Stock", quantity: 50 },
            { _id: '3', name: "Cough Syrup", price: "₹45.00", unitPrice: 45.00, availability: "In Stock", quantity: 25 },
            { _id: '4', name: "Insulin Injection", price: "₹120.00", unitPrice: 120.00, availability: "In Stock", quantity: 15 },
            { _id: '5', name: "Vitamin D3", price: "₹5.00", unitPrice: 5.00, availability: "In Stock", quantity: 80 },
            { _id: '6', name: "Aspirin 75mg", price: "₹1.50", unitPrice: 1.50, availability: "Limited Stock", quantity: 5 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setAvailableMedicines([
          { _id: '1', name: "Paracetamol 500mg", price: "₹2.50", unitPrice: 2.50, availability: "In Stock", quantity: 100 },
          { _id: '2', name: "Amoxicillin 250mg", price: "₹8.00", unitPrice: 8.00, availability: "In Stock", quantity: 50 },
          { _id: '3', name: "Cough Syrup", price: "₹45.00", unitPrice: 45.00, availability: "In Stock", quantity: 25 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const createOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const orderItems = cart.map(item => ({
        medicineName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity
      }));

      const orderData = {
        orderType: 'patient',
        items: orderItems,
        customerInfo: {
          name: user.firstName ? `${user.firstName} ${user.lastName}` : 'Test Customer',
          phone: user.phone || '+919999999999',
          address: 'Test Address, Nabha'
        },
        deliveryType: 'delivery',
        deliveryAddress: 'Test Address, Nabha',
        orderedBy: user._id || '507f1f77bcf86cd799439011'
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      if (result.success) {
        alert(`Order created successfully! Order Number: ${result.data.orderNumber}`);
        setCart([]);
        setIsCartOpen(false);
      } else {
        alert(`Order failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0).toFixed(2);
  };

  const getLocalCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">Loading pharmacies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pharmacies</h1>
          <p className="text-muted-foreground">
            Find local pharmacies in Nabha and surrounding areas for medicine delivery
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search medicines or pharmacy name..." className="pl-10" />
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
                {pharmacies.length} pharmacies available
              </Badge>
            </div>

            <div className="space-y-6">
              {pharmacies.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No pharmacies available</p>
                  </CardContent>
                </Card>
              ) : (
                pharmacies.map((pharmacy) => (
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
                              <h3 className="text-xl font-semibold">{pharmacy.name}</h3>
                              {pharmacy.notes && (
                                <p className="text-muted-foreground text-sm">{pharmacy.notes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{pharmacy.rating || '4.5'}</span>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className="bg-green-100 text-green-700"
                              >
                                Open
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
                              {pharmacy.hours || '9:00 AM - 9:00 PM'}
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
                              onClick={() => setIsCartOpen(true)}
                            >
                              <Pill className="mr-2 h-4 w-4" />
                              Order Medicines
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
                <CardDescription>Order common medicines instantly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {availableMedicines.map((medicine) => (
                    <div key={medicine._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{medicine.name}</h4>
                        <p className="text-xs text-muted-foreground">{medicine.price}</p>
                        <p className="text-xs text-muted-foreground">Stock: {medicine.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            medicine.availability === "In Stock"
                              ? "bg-green-100 text-green-800"
                              : medicine.availability === "Limited Stock"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
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
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Cart ({getLocalCartCount()})
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Emergency Medicine</CardTitle>
                <CardDescription>24/7 emergency medicine delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Need urgent medicines? Call our emergency hotline for immediate assistance.
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
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useCart } from '../context/CartContext';
import { CartModal } from '../components/CartModal';
import { pharmacyAPI } from '../lib/api';
import { MapPin, Phone, Clock, Star, Search, NavigationIcon, Pill, ShoppingCart } from 'lucide-react';

export default function PharmaciesPage() {
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsCartOpen, getCartCount } = useCart();

  const commonMedicines = [
    { name: "Paracetamol 500mg", price: "₹15", availability: "In Stock" },
    { name: "Crocin Advance", price: "₹25", availability: "In Stock" },
    { name: "Cough Syrup", price: "₹45", availability: "In Stock" },
    { name: "ORS Packets", price: "₹8", availability: "In Stock" },
    { name: "Vitamin D3", price: "₹120", availability: "Limited Stock" },
    { name: "Amoxicillin 250mg", price: "₹85", availability: "In Stock" },
  ];

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pharmacies');
        const data = await response.json();
        if (data.success) {
          setPharmacies(data.data);
        }
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

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
          <Button className="w-full">
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
                    onClick={() => {
                      const googleQuery = `${pharmacy.name} ${pharmacy.address} Nabha Punjab reviews`;
                      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`;
                      window.open(googleUrl, '_blank');
                    }}
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
                                <span className="font-medium">{pharmacy.rating}</span>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className={pharmacy.isOpen24Hours ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}
                              >
                                {pharmacy.isOpen24Hours ? "Open 24/7" : pharmacy.status}
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
                              {pharmacy.hours}
                            </div>
                            {pharmacy.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                {pharmacy.phone}
                              </div>
                            )}
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Services:</p>
                            <div className="flex flex-wrap gap-1">
                              {pharmacy.services.map((service, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCartOpen(true);
                              }}
                            >
                              <Pill className="mr-2 h-4 w-4" />
                              Order Medicines
                            </Button>
                            {pharmacy.phone && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`tel:${pharmacy.phone}`, '_self');
                                }}
                              >
                                <Phone className="mr-2 h-4 w-4" />
                                Call Now
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(pharmacy.address + ', Nabha, Punjab')}`;
                                window.open(mapsUrl, '_blank');
                              }}
                            >
                              <NavigationIcon className="mr-2 h-4 w-4" />
                              Get Directions
                            </Button>
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
                  {commonMedicines.map((medicine, index) => (
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
                          onClick={() => addToCart(medicine)}
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
                  View Cart ({getCartCount()}) & Checkout
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
    </div>
  );
}
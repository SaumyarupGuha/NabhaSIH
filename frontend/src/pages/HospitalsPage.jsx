import React, { useState, useEffect, Suspense } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton, ListSkeleton } from '../components/ui/Skeleton';
import { MapPin, Phone, Stethoscope, Ambulance, Building2, Star } from 'lucide-react';

export default function HospitalsPage() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);
  
  const hospitals = [
    {
      id: 1,
      name: "Nabha Civil Hospital",
      type: "Government Hospital",
      address: "Civil Hospital Road, Nabha, Punjab",
      phone: "+91 1765-222-001",
      emergency: "108",
      rating: 4.2,
      departments: ["General Medicine", "Pediatrics", "Gynecology", "Surgery", "Emergency"],
      facilities: ["24/7 Emergency", "ICU", "Laboratory", "X-Ray", "Pharmacy"],
      doctors: 25,
      beds: 150,
      status: "Open 24/7",
    },
    {
      id: 2,
      name: "Nabha Primary Health Center",
      type: "Primary Health Center",
      address: "Main Market, Nabha, Punjab",
      phone: "+91 1765-222-002",
      emergency: "108",
      rating: 4.0,
      departments: ["General Medicine", "Pediatrics", "Vaccination"],
      facilities: ["OPD", "Laboratory", "Pharmacy", "Ambulance"],
      doctors: 8,
      beds: 30,
      status: "Open 8 AM - 8 PM",
    },
  ];

  const emergencyServices = [
    { name: "Ambulance Service", number: "108", description: "24/7 Emergency ambulance" },
    { name: "Fire Service", number: "101", description: "Fire emergency services" },
    { name: "Police", number: "100", description: "Police emergency services" },
    { name: "Women Helpline", number: "1091", description: "Women safety helpline" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center p-4 border rounded-lg">
                    <Skeleton className="h-5 w-24 mx-auto mb-1" />
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-3 w-32 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>
            <ListSkeleton count={2} />
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
          <h1 className="text-3xl font-bold mb-2">Hospitals</h1>
          <p className="text-muted-foreground">
            Healthcare facilities and emergency services in Nabha and surrounding areas
          </p>
        </div>

        <Card className="mb-8 border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Ambulance className="h-5 w-5" />
              Emergency Services
            </CardTitle>
            <CardDescription>Important emergency contact numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {emergencyServices.map((service, index) => (
                <div key={index} className="text-center p-4 border border-destructive/20 rounded-lg">
                  <h3 className="font-semibold text-destructive mb-1">{service.name}</h3>
                  <p className="text-2xl font-bold text-destructive mb-2">{service.number}</p>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Healthcare Facilities</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {hospitals.length} facilities available
            </Badge>
          </div>

          {hospitals.map((hospital) => (
            <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold">{hospital.name}</h3>
                        <p className="text-muted-foreground">{hospital.type}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{hospital.rating}</span>
                          <span className="text-sm text-muted-foreground">rating</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {hospital.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{hospital.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{hospital.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Ambulance className="h-4 w-4 text-destructive" />
                          <span className="text-destructive font-medium">Emergency: {hospital.emergency}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          <span>{hospital.doctors} Doctors</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{hospital.beds} Beds</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Departments:</h4>
                      <div className="flex flex-wrap gap-2">
                        {hospital.departments.map((dept) => (
                          <Badge key={dept} variant="outline" className="bg-primary/10">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Facilities:</h4>
                      <div className="flex flex-wrap gap-2">
                        {hospital.facilities.map((facility) => (
                          <Badge key={facility} variant="outline">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button>
                        <Phone className="mr-2 h-4 w-4" />
                        Call Hospital
                      </Button>
                      <Button variant="outline">
                        <MapPin className="mr-2 h-4 w-4" />
                        Get Directions
                      </Button>
                      <Button variant="destructive">
                        <Ambulance className="mr-2 h-4 w-4" />
                        Emergency: {hospital.emergency}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Health & Safety Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Preparedness</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Keep emergency numbers saved in your phone</li>
                  <li>• Know the location of nearest hospital</li>
                  <li>• Keep a basic first aid kit at home</li>
                  <li>• Learn basic CPR techniques</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">When to Visit Hospital</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Severe chest pain or breathing difficulty</li>
                  <li>• High fever with severe symptoms</li>
                  <li>• Serious injuries or accidents</li>
                  <li>• Persistent vomiting or dehydration</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preventive Care</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Regular health checkups</li>
                  <li>• Vaccination as per schedule</li>
                  <li>• Maintain personal hygiene</li>
                  <li>• Eat healthy and exercise regularly</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation, type Language } from "@/lib/i18n"
import {
  Users,
  Building2,
  Hospital,
  BarChart3,
  Settings,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Calendar,
  Activity,
  TrendingUp,
  UserCheck,
  Store,
} from "lucide-react"

export default function AdminDashboard() {
  const [language, setLanguage] = useState<Language>("en")
  const t = useTranslation(language)

  // Mock data for admin dashboard
  const stats = [
    { title: "Total Users", value: "1,247", change: "+12%", icon: Users, color: "text-blue-600" },
    { title: "Pharmacies", value: "23", change: "+3", icon: Store, color: "text-green-600" },
    { title: "Hospitals", value: "5", change: "+1", icon: Hospital, color: "text-purple-600" },
    { title: "Daily Consultations", value: "156", change: "+8%", icon: Activity, color: "text-orange-600" },
  ]

  const recentUsers = [
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91 98765 43210",
      village: "Kheri",
      role: "Patient",
      joinDate: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      email: "priya@nabhahospital.com",
      phone: "+91 98765 43211",
      village: "Nabha",
      role: "Doctor",
      joinDate: "2024-01-10",
      status: "active",
    },
    {
      id: 3,
      name: "Harpreet Singh",
      email: "harpreet@pharmacy.com",
      phone: "+91 98765 43212",
      village: "Bhadson",
      role: "Pharmacist",
      joinDate: "2024-01-12",
      status: "active",
    },
  ]

  const pharmacies = [
    {
      id: 1,
      name: "Nabha Medical Store",
      owner: "Sukhdev Singh",
      phone: "+91 98765 43213",
      address: "Main Market, Nabha",
      license: "PB-NAB-001",
      status: "verified",
      joinDate: "2024-01-01",
    },
    {
      id: 2,
      name: "Kheri Pharmacy",
      owner: "Manjeet Kaur",
      phone: "+91 98765 43214",
      address: "Village Kheri",
      license: "PB-KHE-002",
      status: "pending",
      joinDate: "2024-01-14",
    },
  ]

  const hospitals = [
    {
      id: 1,
      name: "Nabha Civil Hospital",
      type: "Government",
      phone: "+91 1765 222333",
      address: "Civil Lines, Nabha",
      doctors: 12,
      beds: 50,
      status: "active",
    },
    {
      id: 2,
      name: "Bhadson Primary Health Center",
      type: "Government",
      phone: "+91 1765 222334",
      address: "Village Bhadson",
      doctors: 3,
      beds: 10,
      status: "active",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Doctor":
        return "bg-blue-100 text-blue-800"
      case "Pharmacist":
        return "bg-green-100 text-green-800"
      case "Patient":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-pretty">
            Manage users, pharmacies, hospitals, and system data for Nabha Telemedicine Platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change} this month</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="pharmacies">Pharmacies</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Users Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage all platform users - patients, doctors, and pharmacists</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search users..." className="pl-10 w-64" />
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {user.email} • {user.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Village: {user.village} • Joined: {user.joinDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent text-red-600 hover:text-red-700">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pharmacies Management Tab */}
          <TabsContent value="pharmacies">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pharmacy Management</CardTitle>
                    <CardDescription>Manage registered pharmacies and their verification status</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search pharmacies..." className="pl-10 w-64" />
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Pharmacy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pharmacies.map((pharmacy) => (
                    <div key={pharmacy.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{pharmacy.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Owner: {pharmacy.owner} • License: {pharmacy.license}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {pharmacy.address}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {pharmacy.phone}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(pharmacy.status)}>{pharmacy.status}</Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {pharmacy.status === "pending" && (
                          <Button size="sm">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Verify Pharmacy
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Info
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hospitals Management Tab */}
          <TabsContent value="hospitals">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Hospital Management</CardTitle>
                    <CardDescription>Manage hospitals and healthcare facilities in the network</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search hospitals..." className="pl-10 w-64" />
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Hospital
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hospitals.map((hospital) => (
                    <div key={hospital.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{hospital.name}</h4>
                          <p className="text-sm text-muted-foreground">Type: {hospital.type}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {hospital.address}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {hospital.phone}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(hospital.status)}>{hospital.status}</Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{hospital.doctors}</span> Doctors
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{hospital.beds}</span> Beds
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Info
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Analytics
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Usage</CardTitle>
                  <CardDescription>Key metrics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Daily Active Users</p>
                        <p className="text-2xl font-bold">342</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Consultations Today</p>
                        <p className="text-2xl font-bold">156</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Medicine Orders</p>
                        <p className="text-2xl font-bold">89</p>
                      </div>
                      <Store className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Platform performance and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Server Status</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Response Time</span>
                      <span className="text-sm text-muted-foreground">245ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="text-sm text-muted-foreground">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>Configure system-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Platform Name</label>
                    <Input defaultValue="Nabha Telemedicine Platform" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Support Email</label>
                    <Input defaultValue="support@nabhatelemedicine.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Support Phone</label>
                    <Input defaultValue="+91 1765 222000" />
                  </div>
                  <Button>
                    <Settings className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Maintenance</CardTitle>
                  <CardDescription>System maintenance and backup options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Maintenance
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generate Reports
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Settings className="mr-2 h-4 w-4" />
                    System Backup
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

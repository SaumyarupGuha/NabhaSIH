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
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  CheckCircle,
  Plus,
  Search,
  Eye,
  Edit,
  Phone,
  MapPin,
} from "lucide-react"

export default function PharmacyDashboard() {
  const [language, setLanguage] = useState<Language>("en")
  const t = useTranslation(language)

  // Mock data for pharmacy dashboard
  const stats = [
    { title: "Total Orders", value: "156", change: "+12%", icon: ShoppingCart },
    { title: "Active Customers", value: "89", change: "+8%", icon: Users },
    { title: "Inventory Items", value: "1,247", change: "+5%", icon: Package },
    { title: "Monthly Revenue", value: "₹45,230", change: "+15%", icon: TrendingUp },
  ]

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "Rajesh Kumar",
      phone: "+91 98765 43210",
      medicines: ["Paracetamol 500mg", "Cough Syrup"],
      total: "₹85",
      status: "pending",
      time: "10 mins ago",
      address: "Village Kheri, Nabha",
    },
    {
      id: "ORD-002",
      customer: "Priya Sharma",
      phone: "+91 98765 43211",
      medicines: ["Vitamin D3", "ORS Packets"],
      total: "₹128",
      status: "confirmed",
      time: "25 mins ago",
      address: "Main Market, Nabha",
    },
    {
      id: "ORD-003",
      customer: "Harpreet Singh",
      phone: "+91 98765 43212",
      medicines: ["Amoxicillin 250mg", "Paracetamol"],
      total: "₹100",
      status: "delivered",
      time: "1 hour ago",
      address: "Civil Hospital Road, Nabha",
    },
  ]

  const inventory = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      category: "Pain Relief",
      stock: 150,
      minStock: 50,
      price: "₹15",
      supplier: "Cipla Ltd",
      expiry: "Dec 2025",
    },
    {
      id: 2,
      name: "Cough Syrup",
      category: "Cold & Flu",
      stock: 25,
      minStock: 30,
      price: "₹45",
      supplier: "Dabur India",
      expiry: "Nov 2025",
    },
    {
      id: 3,
      name: "Vitamin D3",
      category: "Vitamins",
      stock: 80,
      minStock: 20,
      price: "₹120",
      supplier: "Sun Pharma",
      expiry: "Jan 2026",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return { color: "bg-red-100 text-red-800", text: "Low Stock" }
    if (current <= min * 1.5) return { color: "bg-yellow-100 text-yellow-800", text: "Medium Stock" }
    return { color: "bg-green-100 text-green-800", text: "In Stock" }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Pharmacy Dashboard</h1>
          <p className="text-muted-foreground text-pretty">Manage your pharmacy operations and orders</p>
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
                    <p className="text-xs text-green-600">{stat.change} from last month</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Manage incoming prescription orders</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search orders..." className="pl-10 w-64" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">Order {order.id}</h4>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          <span className="text-xs text-muted-foreground">{order.time}</span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Medicines:</p>
                          <ul className="text-sm text-muted-foreground">
                            {order.medicines.map((medicine, index) => (
                              <li key={index}>• {medicine}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Phone className="h-4 w-4" />
                            {order.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {order.address}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">Total: {order.total}</span>
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <>
                              <Button size="sm">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm Order
                              </Button>
                              <Button size="sm" variant="outline" className="bg-transparent">
                                <Phone className="mr-2 h-4 w-4" />
                                Call Customer
                              </Button>
                            </>
                          )}
                          {order.status === "confirmed" && (
                            <Button size="sm">
                              <Package className="mr-2 h-4 w-4" />
                              Mark as Delivered
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>Track and manage your medicine stock</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medicine
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.map((item) => {
                    const stockStatus = getStockStatus(item.stock, item.minStock)
                    return (
                      <div key={item.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
                            <span className="text-sm font-medium text-primary">{item.price}</span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Stock: </span>
                            <span className="font-medium">{item.stock} units</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Min Stock: </span>
                            <span className="font-medium">{item.minStock} units</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Supplier: </span>
                            <span className="font-medium">{item.supplier}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expiry: </span>
                            <span className="font-medium">{item.expiry}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          {item.stock <= item.minStock && (
                            <Button size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Reorder Stock
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>View and manage your regular customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Customer management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Sales Reports</CardTitle>
                <CardDescription>View your pharmacy performance and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Detailed reports and analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

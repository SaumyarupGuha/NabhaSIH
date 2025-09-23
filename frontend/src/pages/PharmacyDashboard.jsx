import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import {
  Package, ShoppingCart, Clock, User, MapPin, Pill, Phone,
  CheckCircle, Plus, Search, Eye, Edit, AlertCircle, TrendingUp, RefreshCw
} from 'lucide-react';
import api from '../lib/api';

export default function PharmacyDashboard() {
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  }, []);



  useEffect(() => {
    fetchOrders();
    fetchStock();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('orderAccepted', (data) => {
      setOrders(prev => prev.filter(order => order._id !== data.orderId));
    });

    socket.on('orderUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
    });

    return () => {
      socket.off('orderAccepted');
      socket.off('orderUpdated');
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTodaysSales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime() && 
               (order.status === 'accepted' || order.status === 'delivered');
      })
      .reduce((total, order) => total + (order.totalAmount || 0), 0);
  };

  const fetchStock = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await api.get(`/stock/pharmacy/${user._id || 'default'}`);
      setStock(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching stock:', error);
      // Set dummy data if API fails
      setStock([
        {
          _id: '1',
          medicineName: 'Paracetamol 500mg',
          category: 'tablet',
          quantity: 100,
          unitPrice: 2.50,
          expiryDate: new Date('2025-12-31'),
          batchNumber: 'PCM001',
          manufacturer: 'Sun Pharma',
          minStockLevel: 20,
          isAvailable: true
        },
        {
          _id: '2',
          medicineName: 'Amoxicillin 250mg',
          category: 'capsule',
          quantity: 5,
          unitPrice: 8.00,
          expiryDate: new Date('2025-08-15'),
          batchNumber: 'AMX002',
          manufacturer: 'Cipla',
          minStockLevel: 15,
          isAvailable: true
        }
      ]);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/accept`);
    } catch (error) {
      if (error.response?.status === 409) {
        alert('Order already taken by another pharmacy');
        fetchOrders();
      } else {
        console.error('Error accepting order:', error);
      }
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }



  const pendingOrders = orders.filter(order => order.status === 'pending');
  const acceptedOrders = orders.filter(order => order.status !== 'pending');
  const lowStockItems = stock.filter(item => item.quantity <= (item.minStockLevel || 10));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Pharmacy Dashboard</h1>
              <p className="text-muted-foreground">
                Manage medicine orders, inventory, and customer requests
              </p>
            </div>
            <Button 
              onClick={() => { fetchOrders(); fetchStock(); }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Pending Orders", value: pendingOrders.length.toString(), change: "+3", icon: ShoppingCart },
            { title: "Stock Items", value: stock.length.toString(), change: "+8", icon: Package },
            { title: "Today's Sales", value: `₹${calculateTodaysSales().toFixed(0)}`, change: "+15%", icon: TrendingUp },
            { title: "Low Stock Alerts", value: lowStockItems.length.toString(), change: "-2", icon: AlertCircle },
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change} from yesterday</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Medicine Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pending Orders ({pendingOrders.length})</CardTitle>
                      <CardDescription>New medicine orders waiting for acceptance</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={fetchOrders}
                        className="h-8 w-8 p-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {pendingOrders.length} pending
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No pending orders</p>
                      </div>
                    ) : (
                      pendingOrders.map(order => (
                        <OrderCard 
                          key={order._id} 
                          order={order} 
                          onAccept={() => acceptOrder(order._id)}
                          showAcceptButton={true}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>My Orders ({acceptedOrders.length})</CardTitle>
                      <CardDescription>Orders accepted and being processed</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={fetchOrders}
                        className="h-8 w-8 p-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {acceptedOrders.length} active
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {acceptedOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No active orders</p>
                      </div>
                    ) : (
                      acceptedOrders.map(order => (
                        <OrderCard 
                          key={order._id} 
                          order={order} 
                          showAcceptButton={false}
                          onStatusUpdate={updateOrderStatus}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Medicine Inventory</CardTitle>
                        <CardDescription>Manage your medicine stock and pricing</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Search medicines..." className="pl-10 w-64" />
                        </div>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Medicine
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stock.map((item, index) => (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{item.medicineName}</h4>
                              <p className="text-sm text-muted-foreground capitalize">
                                {item.category} • {item.manufacturer}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">₹{item.unitPrice}</p>
                              <Badge 
                                variant={item.quantity > item.minStockLevel ? "secondary" : "destructive"}
                                className={item.quantity > item.minStockLevel ? "bg-green-100 text-green-800" : ""}
                              >
                                {item.quantity > item.minStockLevel ? "In Stock" : "Low Stock"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                            <div>Quantity: {item.quantity}</div>
                            <div>Batch: {item.batchNumber}</div>
                            <div>Expiry: {new Date(item.expiryDate).toLocaleDateString()}</div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="mr-2 h-4 w-4" />
                              Update Stock
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-destructive">Low Stock Alerts</CardTitle>
                    <CardDescription>Items running low on stock</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lowStockItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">All items well stocked</p>
                      ) : (
                        lowStockItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                            <div>
                              <p className="font-medium text-sm">{item.medicineName}</p>
                              <p className="text-xs text-muted-foreground">Only {item.quantity} left</p>
                            </div>
                            <Button size="sm" variant="destructive">
                              Reorder
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <Package className="mr-2 h-4 w-4" />
                      Bulk Stock Update
                    </Button>
                    <Button className="w-full" variant="outline">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Expiry Alerts
                    </Button>
                    <Button className="w-full" variant="outline">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Sales Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>View customer orders and prescription history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Customer management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Sales & Analytics</CardTitle>
                <CardDescription>View sales reports and business analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OrderCard({ order, onAccept, showAcceptButton, onStatusUpdate }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold">Order #{order._id?.slice(-6) || 'N/A'}</h4>
          <p className="text-sm text-muted-foreground">
            {order.patientId?.name || 'Unknown Patient'}
          </p>
        </div>
        <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
          {order.status}
        </Badge>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{order.deliveryAddress || 'Address not provided'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <h5 className="font-medium text-sm flex items-center gap-2">
          <Pill className="h-4 w-4" />
          Medicines:
        </h5>
        {order.medicines?.map((medicine, index) => (
          <div key={index} className="text-sm bg-gray-50 p-2 rounded">
            {medicine.name} - Qty: {medicine.quantity} - ₹{medicine.price}
          </div>
        )) || <p className="text-sm text-muted-foreground">No medicines listed</p>}
      </div>

      <div className="flex justify-between items-center pt-2 border-t">
        <span className="font-semibold">Total: ₹{order.totalAmount || '0'}</span>
        <div className="flex gap-2">
          {showAcceptButton && (
            <Button onClick={onAccept} size="sm">
              Accept Order
            </Button>
          )}
          {!showAcceptButton && order.status === 'accepted' && (
            <Button onClick={() => onStatusUpdate && onStatusUpdate(order._id, 'delivered')} size="sm" variant="outline">
              Mark Delivered
            </Button>
          )}
          <Button size="sm" variant="outline">
            <Phone className="mr-2 h-4 w-4" />
            Call
          </Button>
        </div>
      </div>
    </div>
  );
}
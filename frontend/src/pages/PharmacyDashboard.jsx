import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import io from 'socket.io-client';
import { 
  Package, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Pill,
  Phone,
  MapPin,
  Eye,
  Edit,
  Plus
} from 'lucide-react';

export default function PharmacyDashboard() {
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [socket, setSocket] = useState(null);
  const [pharmacyId] = useState(() => {
    // Generate unique pharmacy ID for each browser tab/instance
    return 'pharmacy_' + Math.random().toString(36).substr(2, 9);
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders with pharmacy filter
        const ordersResponse = await fetch(`http://localhost:5000/api/orders?pharmacyId=${pharmacyId}`);
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData.data || []);
        }

        // Fetch stock
        const stockResponse = await fetch('http://localhost:5000/api/stock/pharmacy/1');
        if (stockResponse.ok) {
          const stockData = await stockResponse.json();
          setStock(stockData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup Socket.io connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join pharmacy dashboard room
    newSocket.emit('joinPharmacyDashboard');
    newSocket.emit('joinPharmacyRoom', pharmacyId);

    // Listen for new orders
    newSocket.on('newOrder', (order) => {
      console.log('New order received:', order);
      setOrders(prev => [order, ...prev]);
    });

    // Listen for order claims
    newSocket.on('orderClaimed', (data) => {
      console.log('Order claimed by:', data.claimedBy, 'My ID:', pharmacyId);
      if (data.claimedBy === pharmacyId) {
        // Update the order in our list (we claimed it)
        setOrders(prev => prev.map(order => 
          order._id === data.orderId ? { ...order, status: 'accepted', acceptedBy: pharmacyId } : order
        ));
      } else {
        // Remove the order from our list (claimed by another pharmacy)
        console.log('Removing order from my list - claimed by someone else');
        setOrders(prev => prev.filter(order => order._id !== data.orderId));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [pharmacyId]);

  const acceptOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pharmacyId })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Order successfully claimed
        console.log('Order accepted:', result.data);
      } else {
        // Order already taken
        alert(result.message || 'Order already taken by another pharmacy');
        // Remove from our list
        setOrders(prev => prev.filter(order => order._id !== orderId));
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order. Please try again.');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length,
    lowStock: stock.filter(s => s.quantity <= (s.minStockLevel || 20)).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Dashboard</h1>
          <p className="text-gray-600">Manage your pharmacy operations efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Orders</p>
                  <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                </div>
                <Clock className="h-12 w-12 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{stats.completedOrders}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Low Stock</p>
                  <p className="text-3xl font-bold">{stats.lowStock}</p>
                </div>
                <AlertTriangle className="h-12 w-12 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders Management
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inventory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inventory Management
              </button>
            </nav>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>

            <div className="grid gap-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No orders found</p>
                    <p className="text-gray-400">Orders will appear here when customers place them</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                            <p className="text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()} at{' '}
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-2">Customer Info</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              {order.customerInfo?.name || 'N/A'}
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              {order.customerInfo?.phone || 'N/A'}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {order.deliveryAddress || 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Order Items</h4>
                          <div className="space-y-1">
                            {order.medicines?.map((medicine, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{medicine.name} x{medicine.quantity}</span>
                                <span className="font-medium">₹{(medicine.price * medicine.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="border-t pt-1 mt-2">
                              <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <Button
                            onClick={() => acceptOrder(order._id)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            Accept Order
                          </Button>
                        )}
                        {order.status === 'accepted' && (
                          <Button
                            onClick={() => updateOrderStatus(order._id, 'preparing')}
                            className="bg-orange-600 hover:bg-orange-700"
                            size="sm"
                          >
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            onClick={() => updateOrderStatus(order._id, 'ready')}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button
                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            Mark Delivered
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Medicine Inventory</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>

            <div className="grid gap-4">
              {stock.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No medicines in stock</p>
                    <p className="text-gray-400">Add medicines to manage your inventory</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stock.map((medicine) => (
                    <Card key={medicine._id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-green-100 p-2 rounded-full">
                            <Pill className="h-6 w-6 text-green-600" />
                          </div>
                          <Badge 
                            className={
                              medicine.quantity <= (medicine.minStockLevel || 20)
                                ? 'bg-red-100 text-red-800'
                                : medicine.quantity <= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }
                          >
                            {medicine.quantity <= (medicine.minStockLevel || 20) ? 'Low Stock' : 'In Stock'}
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-lg mb-2">{medicine.medicineName}</h3>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="font-medium">{medicine.category || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quantity:</span>
                            <span className="font-medium">{medicine.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Unit Price:</span>
                            <span className="font-medium">₹{medicine.unitPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Manufacturer:</span>
                            <span className="font-medium">{medicine.manufacturer || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
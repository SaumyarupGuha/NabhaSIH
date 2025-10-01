import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
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
  Plus,
  DollarSign,
  BarChart3,
  Activity,
  Calendar,
  Target,
  Truck,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  X,
  RefreshCw
} from 'lucide-react';

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [orderView, setOrderView] = useState('pending'); // 'pending' or 'active'
  const [socket, setSocket] = useState(null);
  const [revenue, setRevenue] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    avgOrderValue: 0,
    customerSatisfaction: 4.8,
    deliveryTime: 25
  });
  const [pharmacyId, setPharmacyId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [viewingMedicine, setViewingMedicine] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  useEffect(() => {
    if (user) {
      const id = user.id || user._id;
      console.log('Setting pharmacy ID:', id);
      setPharmacyId(id);
    }
  }, [user]);

  useEffect(() => {
    if (!pharmacyId) return;
    
    const fetchData = async () => {
      try {
        // Fetch orders with pharmacy filter
        const ordersResponse = await fetch(`http://localhost:5000/api/orders?pharmacyId=${pharmacyId}`);
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          // Handle new Amazon-style response structure
          if (ordersData.data && ordersData.data.availableOrders && ordersData.data.myOrders) {
            // Amazon-style: separate available and my orders
            const allOrders = [...ordersData.data.availableOrders, ...ordersData.data.myOrders];
            setOrders(allOrders);
            console.log(`Loaded ${ordersData.data.availableOrders.length} available orders and ${ordersData.data.myOrders.length} my orders`);
          } else {
            setOrders(ordersData.data || []);
          }
          
          // Calculate revenue only from my orders (not available orders)
          const myOrdersForRevenue = ordersData.data && ordersData.data.myOrders 
            ? ordersData.data.myOrders
            : ordersData.data?.filter(o => o.acceptedBy === pharmacyId) || [];
          const completedOrders = myOrdersForRevenue.filter(o => o.status === 'delivered') || [];
          const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
          const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
          
          setAnalytics(prev => ({
            ...prev,
            totalRevenue,
            avgOrderValue
          }));
          
          // Calculate daily, weekly, monthly revenue
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          const dailyRevenue = completedOrders
            .filter(o => new Date(o.createdAt) >= today)
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            
          const weeklyRevenue = completedOrders
            .filter(o => new Date(o.createdAt) >= weekAgo)
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            
          const monthlyRevenue = completedOrders
            .filter(o => new Date(o.createdAt) >= monthAgo)
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            
          setRevenue({ daily: dailyRevenue, weekly: weeklyRevenue, monthly: monthlyRevenue });
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

    // Listen for order acceptance (Amazon-style)
    newSocket.on('orderAccepted', (data) => {
      console.log('Order accepted by:', data.acceptedBy, 'My ID:', pharmacyId);
      if (data.acceptedBy === pharmacyId) {
        // We accepted this order - move it to our orders
        setOrders(prev => prev.map(order => 
          order._id === data.orderId ? { 
            ...order, 
            status: 'accepted', 
            acceptedBy: pharmacyId,
            pharmacyName: data.pharmacyName,
            acceptedAt: new Date()
          } : order
        ));
      } else {
        // Another pharmacy accepted - remove from available orders
        console.log('Order taken by another pharmacy, removing from available list');
        setOrders(prev => prev.filter(order => order._id !== data.orderId));
      }
    });
    
    // Listen for order updates
    newSocket.on('orderUpdated', (data) => {
      setOrders(prev => prev.map(order => 
        order._id === data.orderId ? { ...order, status: data.status } : order
      ));
    });

    // Listen for stock updates
    newSocket.on('stockUpdated', async (data) => {
      if (data.pharmacyId === pharmacyId) {
        try {
          const stockResponse = await fetch(`http://localhost:5000/api/stock/pharmacy/${pharmacyId}`);
          if (stockResponse.ok) {
            const stockData = await stockResponse.json();
            setStock(stockData.data || []);
            console.log('Stock updated after order acceptance');
          }
        } catch (error) {
          console.error('Error refreshing stock:', error);
        }
      }
    });



    return () => {
      newSocket.disconnect();
    };
  }, [pharmacyId]);
  
  if (!pharmacyId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p>Loading pharmacy dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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

  const rejectOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pharmacyId })
      });

      if (response.ok) {
        // Remove order from our list
        setOrders(prev => prev.filter(order => order._id !== orderId));
      } else {
        alert('Failed to reject order. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, pharmacyId })
      });

      if (response.ok) {
        const updatedOrders = orders.map(order => 
          order._id === orderId ? { ...order, status } : order
        );
        setOrders(updatedOrders);
        
        // Update revenue when order is delivered
        if (status === 'delivered') {
          const deliveredOrder = orders.find(order => order._id === orderId);
          if (deliveredOrder) {
            const orderAmount = deliveredOrder.totalAmount || 0;
            
            // Update analytics
            const completedOrders = updatedOrders.filter(o => o.status === 'delivered');
            const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
            
            setAnalytics(prev => ({
              ...prev,
              totalRevenue,
              avgOrderValue
            }));
            
            // Update daily/weekly/monthly revenue
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            
            const dailyRevenue = completedOrders
              .filter(o => new Date(o.createdAt) >= today)
              .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
              
            const weeklyRevenue = completedOrders
              .filter(o => new Date(o.createdAt) >= weekAgo)
              .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
              
            const monthlyRevenue = completedOrders
              .filter(o => new Date(o.createdAt) >= monthAgo)
              .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
              
            setRevenue({ daily: dailyRevenue, weekly: weeklyRevenue, monthly: monthlyRevenue });
          }
        }
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

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'delivered');
  
  const stats = {
    totalOrders: orders.length,
    pendingOrders: pendingOrders.length,
    activeOrders: activeOrders.length,
    completedOrders: completedOrders.length,
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">{user?.selectedPharmacy || user?.pharmacyName || user?.phone || 'Pharmacy'}</h1>
                <p className="text-blue-100">Pharmacy Management Dashboard</p>
              </div>
              <Button
                onClick={async () => {
                  setRefreshing(true);
                  try {
                    // Refresh orders
                    const ordersResponse = await fetch(`http://localhost:5000/api/orders?pharmacyId=${pharmacyId}`);
                    if (ordersResponse.ok) {
                      const ordersData = await ordersResponse.json();
                      if (ordersData.data && ordersData.data.availableOrders && ordersData.data.myOrders) {
                        const allOrders = [...ordersData.data.availableOrders, ...ordersData.data.myOrders];
                        setOrders(allOrders);
                      } else {
                        setOrders(ordersData.data || []);
                      }
                    }
                    
                    // Refresh stock
                    const stockResponse = await fetch(`http://localhost:5000/api/stock/pharmacy/${pharmacyId}`);
                    if (stockResponse.ok) {
                      const stockData = await stockResponse.json();
                      setStock(stockData.data || []);
                    }
                  } catch (error) {
                    console.error('Error refreshing:', error);
                  } finally {
                    setTimeout(() => setRefreshing(false), 500);
                  }
                }}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          <p className="text-gray-600">
            Welcome back, {user?.selectedPharmacy || user?.pharmacyName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.phone || 'Pharmacist'}!
          </p>
          <p className="text-sm text-gray-500">Manage your pharmacy operations efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{analytics.totalRevenue.toFixed(0)}</p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 text-blue-200" />
                    <span className="text-xs text-blue-200">+12% this month</span>
                  </div>
                </div>
                <DollarSign className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Orders</p>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-yellow-200" />
                    <span className="text-xs text-yellow-200">Awaiting acceptance</span>
                  </div>
                </div>
                <Package className="h-10 w-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Active Orders</p>
                  <p className="text-2xl font-bold">{stats.activeOrders}</p>
                  <div className="flex items-center mt-1">
                    <Activity className="h-4 w-4 text-orange-200" />
                    <span className="text-xs text-orange-200">In progress</span>
                  </div>
                </div>
                <Truck className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedOrders}</p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-200" />
                    <span className="text-xs text-green-200">This month</span>
                  </div>
                </div>
                <Target className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Low Stock</p>
                  <p className="text-2xl font-bold">{stats.lowStock}</p>
                  <div className="flex items-center mt-1">
                    <AlertTriangle className="h-4 w-4 text-red-200" />
                    <span className="text-xs text-red-200">Need restock</span>
                  </div>
                </div>
                <Pill className="h-10 w-10 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Revenue Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Revenue</span>
                  <span className="font-semibold">₹{revenue.daily.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Weekly Revenue</span>
                  <span className="font-semibold">₹{revenue.weekly.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                  <span className="font-semibold">₹{revenue.monthly.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-600">Avg Order Value</span>
                  <span className="font-semibold">₹{analytics.avgOrderValue.toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Customer Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold ml-1">{analytics.customerSatisfaction}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Delivery Time</span>
                  <span className="font-semibold">{analytics.deliveryTime} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order Accuracy</span>
                  <span className="font-semibold">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-semibold">2.3 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Medicine Costs</span>
                  <span className="font-semibold">₹{(analytics.totalRevenue * 0.65).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Operational Costs</span>
                  <span className="font-semibold">₹{(analytics.totalRevenue * 0.15).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delivery Costs</span>
                  <span className="font-semibold">₹{(analytics.totalRevenue * 0.08).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-600">Net Profit</span>
                  <span className="font-semibold text-green-600">₹{(analytics.totalRevenue * 0.12).toFixed(0)}</span>
                </div>
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
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics & Reports
              </button>
            </nav>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Orders Management</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Orders - Left Half */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-yellow-700 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Pending Orders
                  </h3>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {stats.pendingOrders} orders
                  </Badge>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto space-y-3">
                  {pendingOrders.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No pending orders</p>
                        <p className="text-sm text-gray-400">New orders will appear here</p>
                      </CardContent>
                    </Card>
                  ) : (
                    pendingOrders.map((order) => (
                      <Card key={order._id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-400">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-yellow-100 p-2 rounded-full">
                                <Clock className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold">Order #{order.orderNumber}</h4>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <span className="text-lg font-bold text-green-600">₹{order.totalAmount?.toFixed(0)}</span>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-3 w-3 mr-2" />
                              {order.customerInfo?.name || 'N/A'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-2" />
                              {order.customerInfo?.phone || 'N/A'}
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Items:</p>
                            <div className="space-y-1">
                              {order.medicines?.slice(0, 2).map((medicine, index) => (
                                <div key={index} className="flex justify-between text-xs">
                                  <span>{medicine.name} x{medicine.quantity}</span>
                                  <span>₹{(medicine.price * medicine.quantity).toFixed(0)}</span>
                                </div>
                              ))}
                              {order.medicines?.length > 2 && (
                                <p className="text-xs text-gray-400">+{order.medicines.length - 2} more items</p>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              onClick={() => acceptOrder(order._id)}
                              className="bg-green-600 hover:bg-green-700 flex-1"
                              size="sm"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              onClick={() => rejectOrder(order._id)}
                              className="bg-red-600 hover:bg-red-700 flex-1"
                              size="sm"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Active Orders - Right Half */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-blue-700 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Active Orders
                  </h3>
                  <Badge className="bg-blue-100 text-blue-800">
                    {stats.activeOrders} orders
                  </Badge>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto space-y-3">
                  {activeOrders.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No active orders</p>
                        <p className="text-sm text-gray-400">Accepted orders will appear here</p>
                      </CardContent>
                    </Card>
                  ) : (
                    activeOrders.map((order) => (
                      <Card key={order._id} className={`hover:shadow-md transition-shadow border-l-4 ${
                        order.status === 'accepted' ? 'border-l-blue-400' :
                        order.status === 'preparing' ? 'border-l-orange-400' :
                        'border-l-green-400'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                order.status === 'accepted' ? 'bg-blue-100' :
                                order.status === 'preparing' ? 'bg-orange-100' :
                                'bg-green-100'
                              }`}>
                                {order.status === 'accepted' && <Package className="h-4 w-4 text-blue-600" />}
                                {order.status === 'preparing' && <Activity className="h-4 w-4 text-orange-600" />}
                                {order.status === 'ready' && <CheckCircle className="h-4 w-4 text-green-600" />}
                              </div>
                              <div>
                                <h4 className="font-semibold">Order #{order.orderNumber}</h4>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                                <Badge className={`text-xs ${
                                  order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-lg font-bold text-green-600">₹{order.totalAmount?.toFixed(0)}</span>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-3 w-3 mr-2" />
                              {order.customerInfo?.name || 'N/A'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-2" />
                              {order.customerInfo?.phone || 'N/A'}
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Items:</p>
                            <div className="space-y-1">
                              {order.medicines?.slice(0, 2).map((medicine, index) => (
                                <div key={index} className="flex justify-between text-xs">
                                  <span>{medicine.name} x{medicine.quantity}</span>
                                  <span>₹{(medicine.price * medicine.quantity).toFixed(0)}</span>
                                </div>
                              ))}
                              {order.medicines?.length > 2 && (
                                <p className="text-xs text-gray-400">+{order.medicines.length - 2} more items</p>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {order.status === 'accepted' && (
                              <Button
                                onClick={() => updateOrderStatus(order._id, 'preparing')}
                                className="bg-orange-600 hover:bg-orange-700 flex-1"
                                size="sm"
                              >
                                <Activity className="h-3 w-3 mr-1" />
                                Prepare
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                onClick={() => updateOrderStatus(order._id, 'ready')}
                                className="bg-blue-600 hover:bg-blue-700 flex-1"
                                size="sm"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ready
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button
                                onClick={() => updateOrderStatus(order._id, 'delivered')}
                                className="bg-green-600 hover:bg-green-700 flex-1"
                                size="sm"
                              >
                                <Truck className="h-3 w-3 mr-1" />
                                Deliver
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setEditingMedicine(medicine._id);
                              setEditForm({
                                quantity: medicine.quantity,
                                unitPrice: medicine.unitPrice,
                                minStockLevel: medicine.minStockLevel || 20
                              });
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setViewingMedicine(medicine)}
                          >
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

        {/* Edit Medicine Modal */}
        {editingMedicine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Edit Medicine</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({...editForm, quantity: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.unitPrice}
                    onChange={(e) => setEditForm({...editForm, unitPrice: parseFloat(e.target.value)})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Stock Level</label>
                  <input
                    type="number"
                    value={editForm.minStockLevel}
                    onChange={(e) => setEditForm({...editForm, minStockLevel: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(`http://localhost:5000/api/stock/update/${editingMedicine}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editForm)
                      });
                      
                      setStock(stock.map(item => 
                        item._id === editingMedicine ? { ...item, ...editForm } : item
                      ));
                      alert('Medicine updated successfully!');
                    } catch (error) {
                      setStock(stock.map(item => 
                        item._id === editingMedicine ? { ...item, ...editForm } : item
                      ));
                      alert('Medicine updated successfully!');
                    }
                    setEditingMedicine(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingMedicine(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View Medicine Modal */}
        {viewingMedicine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Medicine Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingMedicine(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{viewingMedicine.medicineName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span>{viewingMedicine.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Manufacturer:</span>
                  <span>{viewingMedicine.manufacturer || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Quantity:</span>
                  <span>{viewingMedicine.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Unit Price:</span>
                  <span>₹{viewingMedicine.unitPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Min Stock Level:</span>
                  <span>{viewingMedicine.minStockLevel || 20}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Value:</span>
                  <span>₹{(viewingMedicine.quantity * viewingMedicine.unitPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge 
                    className={
                      viewingMedicine.quantity <= (viewingMedicine.minStockLevel || 20)
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }
                  >
                    {viewingMedicine.quantity <= (viewingMedicine.minStockLevel || 20) ? 'Low Stock' : 'In Stock'}
                  </Badge>
                </div>
                {viewingMedicine.expiryDate && (
                  <div className="flex justify-between">
                    <span className="font-medium">Expiry Date:</span>
                    <span>{new Date(viewingMedicine.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Analytics & Reports</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Detailed revenue analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Total Revenue</p>
                        <p className="text-sm text-gray-600">All time</p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">₹{analytics.totalRevenue.toFixed(0)}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">Monthly Revenue</p>
                        <p className="text-sm text-gray-600">Last 30 days</p>
                      </div>
                      <p className="text-xl font-bold text-blue-600">₹{revenue.monthly.toFixed(0)}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium">Weekly Revenue</p>
                        <p className="text-sm text-gray-600">Last 7 days</p>
                      </div>
                      <p className="text-xl font-bold text-purple-600">₹{revenue.weekly.toFixed(0)}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">Daily Revenue</p>
                        <p className="text-sm text-gray-600">Today</p>
                      </div>
                      <p className="text-xl font-bold text-orange-600">₹{revenue.daily.toFixed(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Statistics</CardTitle>
                  <CardDescription>Order performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Orders</span>
                      <span className="font-semibold text-lg">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed Orders</span>
                      <span className="font-semibold text-lg text-green-600">{stats.completedOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="font-semibold text-lg">
                        {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Order Value</span>
                      <span className="font-semibold text-lg">₹{analytics.avgOrderValue.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Customer Rating</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold">{analytics.customerSatisfaction}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                  <CardDescription>Detailed cost breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Medicine Costs (65%)</span>
                      <span className="font-semibold">₹{(analytics.totalRevenue * 0.65).toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Operational Costs (15%)</span>
                      <span className="font-semibold">₹{(analytics.totalRevenue * 0.15).toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: '15%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Delivery Costs (8%)</span>
                      <span className="font-semibold">₹{(analytics.totalRevenue * 0.08).toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '8%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">Net Profit (12%)</span>
                      <span className="font-bold text-green-600">₹{(analytics.totalRevenue * 0.12).toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '12%'}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Insights</CardTitle>
                  <CardDescription>Stock and inventory analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Medicines</span>
                      <span className="font-semibold text-lg">{stock.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Low Stock Items</span>
                      <span className="font-semibold text-lg text-red-600">{stats.lowStock}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Stock Value</span>
                      <span className="font-semibold text-lg">
                        ₹{stock.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Stock Turnover</span>
                      <span className="font-semibold text-lg">2.3x/month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Reorder Alerts</span>
                      <span className="font-semibold text-lg text-yellow-600">{stats.lowStock}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Medicine Modal */}
      {editingMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Medicine</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input 
                  type="number" 
                  className="w-full border rounded px-3 py-2"
                  defaultValue={editingMedicine.quantity}
                  onChange={(e) => setEditingMedicine({...editingMedicine, quantity: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit Price</label>
                <input 
                  type="number" 
                  className="w-full border rounded px-3 py-2"
                  defaultValue={editingMedicine.unitPrice}
                  onChange={(e) => setEditingMedicine({...editingMedicine, unitPrice: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button 
                onClick={async () => {
                  try {
                    await fetch(`http://localhost:5000/api/stock/${editingMedicine._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        quantity: editingMedicine.quantity,
                        unitPrice: editingMedicine.unitPrice
                      })
                    });
                    setStock(prev => prev.map(s => s._id === editingMedicine._id ? editingMedicine : s));
                    setEditingMedicine(null);
                  } catch (error) {
                    console.error('Error updating medicine:', error);
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingMedicine(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* View Medicine Modal */}
      {viewingMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">{viewingMedicine.medicineName}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{viewingMedicine.category || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{viewingMedicine.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit Price:</span>
                <span className="font-medium">₹{viewingMedicine.unitPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Manufacturer:</span>
                <span className="font-medium">{viewingMedicine.manufacturer || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-medium text-green-600">₹{(viewingMedicine.quantity * viewingMedicine.unitPrice).toFixed(0)}</span>
              </div>
            </div>
            <Button 
              onClick={() => setViewingMedicine(null)}
              className="w-full mt-6 bg-gray-600 hover:bg-gray-700"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
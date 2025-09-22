import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Package, Clock, CheckCircle, XCircle, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import io from 'socket.io-client';

export default function PharmacyDashboard() {
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [newStockItem, setNewStockItem] = useState({
    medicineName: '',
    category: 'tablet',
    quantity: '',
    unitPrice: '',
    expiryDate: '',
    manufacturer: ''
  });

  const pharmacyId = '674a1b2c3d4e5f6789012345'; // King Pharmacy ID (the one with stock)

  useEffect(() => {
    // Initialize Socket.IO
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('joinPharmacy', pharmacyId);

    newSocket.on('newOrder', (orderData) => {
      setOrders(prev => [orderData.order, ...prev]);
      // Show notification
      new Notification('New Order Received!', {
        body: `Order ${orderData.order.orderNumber} from ${orderData.order.orderType}`,
        icon: '/nabha_logo.png'
      });
    });

    fetchOrders();
    fetchStock();

    return () => newSocket.close();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/pharmacy/${pharmacyId}`);
      const data = await response.json();
      console.log('Orders API response:', data);
      if (data.success && data.data && data.data.length > 0) {
        setOrders(data.data);
      } else {
        console.log('No orders found, using dummy orders for testing');
        setDummyOrders();
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setDummyOrders();
    } finally {
      setLoading(false);
    }
  };

  const setDummyOrders = () => {
    setOrders([
      {
        _id: 'order1',
        orderNumber: 'ORD001',
        orderType: 'patient',
        status: 'pending',
        priority: 'medium',
        items: [
          { medicineName: 'Paracetamol 500mg', quantity: 2, unitPrice: 2.50 }
        ],
        customerInfo: {
          name: 'John Doe',
          phone: '+919876543210',
          address: '123 Main St, City'
        },
        totalAmount: 5.00,
        createdAt: new Date(),
        deliveryType: 'delivery'
      }
    ]);
  };

  const checkAllOrders = async () => {
    try {
      console.log('Checking all orders...');
      const response = await fetch('http://localhost:5000/api/orders');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.log('API endpoint /api/orders not found or error');
        console.log('Let\'s check what orders exist by looking at the pharmacy-specific endpoint');
        
        // Try to get orders from the pharmacy endpoint and see what we get
        const pharmacyResponse = await fetch(`http://localhost:5000/api/orders/pharmacy/${pharmacyId}`);
        const pharmacyData = await pharmacyResponse.json();
        console.log('Pharmacy orders response:', pharmacyData);
        return;
      }
      
      const data = await response.json();
      console.log('All orders in system:', data);
      console.log('Current pharmacy ID:', pharmacyId);
      
      if (data.success && data.data) {
        const ordersForThisPharmacy = data.data.filter(order => 
          order.assignedPharmacy === pharmacyId || 
          order.assignedPharmacy?._id === pharmacyId
        );
        console.log('Orders for this pharmacy:', ordersForThisPharmacy);
        
        if (ordersForThisPharmacy.length > 0) {
          setOrders(ordersForThisPharmacy);
        }
      }
    } catch (error) {
      console.error('Error checking all orders:', error);
      console.log('The /api/orders endpoint probably doesn\'t exist. Let\'s check the pharmacy endpoint instead.');
      
      // Fallback: check the pharmacy endpoint
      try {
        const pharmacyResponse = await fetch(`http://localhost:5000/api/orders/pharmacy/${pharmacyId}`);
        const pharmacyData = await pharmacyResponse.json();
        console.log('Pharmacy orders response:', pharmacyData);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  const testOrderCreation = async () => {
    try {
      console.log('Testing order creation...');
      const testOrder = {
        orderType: 'patient',
        items: [{
          medicineName: 'Paracetamol 500mg',
          quantity: 1,
          unitPrice: 2.50,
          totalPrice: 2.50
        }],
        customerInfo: {
          name: 'Test Customer',
          phone: '+919999999999',
          address: 'Test Address'
        },
        deliveryType: 'delivery',
        deliveryAddress: 'Test Address',
        coordinates: { lat: 30.7046, lng: 76.1512 },
        orderedBy: '68ccf820249ad6de413eab2f',
        assignedPharmacy: pharmacyId
      };
      
      console.log('Sending test order:', testOrder);
      
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrder)
      });
      
      const result = await response.json();
      console.log('Test order result:', result);
      
      if (result.success) {
        console.log('Test order created successfully!');
        console.log('Order assigned to pharmacy:', result.assignedPharmacy);
        console.log('Our pharmacy ID:', pharmacyId);
        console.log('Do they match?', result.assignedPharmacy._id === pharmacyId || result.assignedPharmacy === pharmacyId);
        fetchOrders();
      } else {
        console.log('Test order failed:', result.message);
      }
    } catch (error) {
      console.error('Test order error:', error);
    }
  };

  const fetchStock = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/stock/pharmacy/${pharmacyId}`);
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        setStock(data.data);
      } else {
        // No stock found or empty response, use dummy data
        console.log('No stock found, using dummy data');
        setDummyStock();
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      // Fallback to dummy data
      setDummyStock();
    }
  };

  const setDummyStock = () => {
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
        quantity: 50,
        unitPrice: 8.00,
        expiryDate: new Date('2025-08-15'),
        batchNumber: 'AMX002',
        manufacturer: 'Cipla',
        minStockLevel: 15,
        isAvailable: true
      },
      {
        _id: '3',
        medicineName: 'Cough Syrup',
        category: 'syrup',
        quantity: 25,
        unitPrice: 45.00,
        expiryDate: new Date('2025-06-30'),
        batchNumber: 'CS003',
        manufacturer: 'Dabur',
        minStockLevel: 10,
        isAvailable: true
      },
      {
        _id: '4',
        medicineName: 'Insulin Injection',
        category: 'injection',
        quantity: 15,
        unitPrice: 120.00,
        expiryDate: new Date('2025-03-20'),
        batchNumber: 'INS004',
        manufacturer: 'Novo Nordisk',
        minStockLevel: 5,
        isAvailable: true
      },
      {
        _id: '5',
        medicineName: 'Antiseptic Cream',
        category: 'ointment',
        quantity: 30,
        unitPrice: 25.00,
        expiryDate: new Date('2026-01-15'),
        batchNumber: 'AC005',
        manufacturer: 'Johnson & Johnson',
        minStockLevel: 8,
        isAvailable: true
      },
      {
        _id: '6',
        medicineName: 'Eye Drops',
        category: 'drops',
        quantity: 40,
        unitPrice: 35.00,
        expiryDate: new Date('2025-09-10'),
        batchNumber: 'ED006',
        manufacturer: 'Allergan',
        minStockLevel: 12,
        isAvailable: true
      },
      {
        _id: '7',
        medicineName: 'Vitamin D3',
        category: 'tablet',
        quantity: 80,
        unitPrice: 5.00,
        expiryDate: new Date('2026-05-25'),
        batchNumber: 'VD007',
        manufacturer: 'Ranbaxy',
        minStockLevel: 25,
        isAvailable: true
      },
      {
        _id: '8',
        medicineName: 'Aspirin 75mg',
        category: 'tablet',
        quantity: 5,
        unitPrice: 1.50,
        expiryDate: new Date('2025-11-30'),
        batchNumber: 'ASP008',
        manufacturer: 'Bayer',
        minStockLevel: 20,
        isAvailable: true
      }
    ]);
  };

  const handleOrderAction = async (orderId, action, rejectionReason = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          rejectionReason,
          estimatedTime: action === 'accepted' ? new Date(Date.now() + 45 * 60000) : null
        })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const updateOrderProgress = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order progress:', error);
    }
  };

  const addStockItem = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newStockItem,
          pharmacy: pharmacyId,
          quantity: parseInt(newStockItem.quantity),
          unitPrice: parseFloat(newStockItem.unitPrice)
        })
      });

      if (response.ok) {
        setNewStockItem({
          medicineName: '',
          category: 'tablet',
          quantity: '',
          unitPrice: '',
          expiryDate: '',
          manufacturer: ''
        });
        fetchStock();
      }
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-purple-100 text-purple-800',
      delivered: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pharmacy Dashboard</h1>
          <p className="text-muted-foreground">Manage orders and inventory</p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="stock">Stock Management</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 mb-4">
            <Button onClick={fetchOrders} variant="outline">
              Refresh Orders
            </Button>
            <Button onClick={checkAllOrders} variant="outline">
              Check All Orders
            </Button>
            <Button onClick={testOrderCreation} variant="outline">
              Test Order Creation
            </Button>
          </div>

          <TabsContent value="orders" className="space-y-6">
            <div className="grid gap-6">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order._id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Order #{order.orderNumber}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                            <Badge variant="outline">
                              {order.orderType}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">₹{order.totalAmount}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Customer Info:</h4>
                          <p className="text-sm">{order.customerInfo.name}</p>
                          <p className="text-sm">{order.customerInfo.phone}</p>
                          <p className="text-sm">{order.deliveryType === 'delivery' ? order.deliveryAddress : 'Pickup'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Items:</h4>
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm flex justify-between">
                              <span>{item.medicineName} x{item.quantity}</span>
                              <span>₹{item.totalPrice}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        {order.status === 'assigned' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleOrderAction(order._id, 'accepted')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt('Rejection reason:');
                                if (reason) handleOrderAction(order._id, 'rejected', reason);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {order.status === 'accepted' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderProgress(order._id, 'preparing')}
                          >
                            Start Preparing
                          </Button>
                        )}
                        
                        {order.status === 'preparing' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderProgress(order._id, 'ready')}
                          >
                            Mark Ready
                          </Button>
                        )}
                        
                        {order.status === 'ready' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderProgress(order._id, 'delivered')}
                          >
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="stock" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Medicine Name"
                    value={newStockItem.medicineName}
                    onChange={(e) => setNewStockItem({...newStockItem, medicineName: e.target.value})}
                    className="p-2 border rounded-lg"
                  />
                  <select
                    value={newStockItem.category}
                    onChange={(e) => setNewStockItem({...newStockItem, category: e.target.value})}
                    className="p-2 border rounded-lg"
                  >
                    <option value="tablet">Tablet</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                    <option value="capsule">Capsule</option>
                    <option value="ointment">Ointment</option>
                    <option value="drops">Drops</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newStockItem.quantity}
                    onChange={(e) => setNewStockItem({...newStockItem, quantity: e.target.value})}
                    className="p-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Unit Price"
                    value={newStockItem.unitPrice}
                    onChange={(e) => setNewStockItem({...newStockItem, unitPrice: e.target.value})}
                    className="p-2 border rounded-lg"
                  />
                  <input
                    type="date"
                    value={newStockItem.expiryDate}
                    onChange={(e) => setNewStockItem({...newStockItem, expiryDate: e.target.value})}
                    className="p-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Manufacturer"
                    value={newStockItem.manufacturer}
                    onChange={(e) => setNewStockItem({...newStockItem, manufacturer: e.target.value})}
                    className="p-2 border rounded-lg"
                  />
                </div>
                <Button onClick={addStockItem} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {stock.map((item) => (
                <Card key={item._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{item.medicineName}</h3>
                        <p className="text-sm text-gray-600">{item.category} • {item.manufacturer}</p>
                        <p className="text-sm text-gray-600">Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {item.quantity} units
                          {item.quantity <= item.minStockLevel && (
                            <AlertTriangle className="h-4 w-4 text-red-500 inline ml-2" />
                          )}
                        </p>
                        <p className="text-sm text-gray-600">₹{item.unitPrice} each</p>
                        <Badge className={item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
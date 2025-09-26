import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Phone,
  User,
  Calendar,
  Activity
} from 'lucide-react';
import io from 'socket.io-client';

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/patient`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const foundOrder = data.data.find(o => o._id === orderId);
          setOrder(foundOrder);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Setup real-time updates
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for order status updates
    newSocket.on('orderStatusUpdate', (data) => {
      if (data.orderId === orderId) {
        setOrder(prev => prev ? { ...prev, status: data.status } : null);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [orderId]);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'accepted': return <CheckCircle className="h-5 w-5" />;
      case 'preparing': return <Activity className="h-5 w-5" />;
      case 'ready': return <Package className="h-5 w-5" />;
      case 'delivered': return <Truck className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'pending': return 20;
      case 'accepted': return 40;
      case 'preparing': return 60;
      case 'ready': return 80;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-gray-600">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
          <p className="text-gray-600">Track your order #{order.orderNumber}</p>
        </div>

        {/* Order Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                Order #{order.orderNumber}
              </CardTitle>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Order Progress</span>
                <span>{getProgressPercentage(order.status)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage(order.status)}%` }}
                ></div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${order.status === 'pending' ? 'text-blue-600' : 'text-gray-400'}`}>
                <Clock className="h-5 w-5" />
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              {order.acceptedAt && (
                <div className={`flex items-center gap-3 ${['accepted', 'preparing', 'ready', 'delivered'].includes(order.status) ? 'text-blue-600' : 'text-gray-400'}`}>
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Order Accepted by {order.pharmacyName}</p>
                    <p className="text-sm">{new Date(order.acceptedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
              
              {['preparing', 'ready', 'delivered'].includes(order.status) && (
                <div className={`flex items-center gap-3 ${['preparing', 'ready', 'delivered'].includes(order.status) ? 'text-blue-600' : 'text-gray-400'}`}>
                  <Activity className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Order Being Prepared</p>
                    <p className="text-sm">Your medicines are being prepared</p>
                  </div>
                </div>
              )}
              
              {['ready', 'delivered'].includes(order.status) && (
                <div className={`flex items-center gap-3 ${['ready', 'delivered'].includes(order.status) ? 'text-blue-600' : 'text-gray-400'}`}>
                  <Package className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Order Ready</p>
                    <p className="text-sm">Your order is ready for pickup/delivery</p>
                  </div>
                </div>
              )}
              
              {order.status === 'delivered' && (
                <div className="flex items-center gap-3 text-green-600">
                  <Truck className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Order Delivered</p>
                    <p className="text-sm">Your order has been delivered successfully</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Items Ordered</h4>
                  <div className="space-y-2">
                    {order.medicines?.map((medicine, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{medicine.name} x{medicine.quantity}</span>
                        <span>₹{(medicine.price * medicine.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>₹{order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
                
                {order.estimatedDeliveryTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Estimated delivery: {order.estimatedDeliveryTime}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pharmacy & Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy & Delivery Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.pharmacyName ? (
                  <div>
                    <h4 className="font-medium mb-2">Pharmacy Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{order.pharmacyName}</span>
                      </div>
                      {order.pharmacyPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{order.pharmacyPhone}</span>
                        </div>
                      )}
                      {order.pharmacyAddress && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{order.pharmacyAddress}</span>
                        </div>
                      )}
                    </div>
                    
                    {order.pharmacyPhone && (
                      <Button className="w-full mt-4" variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Pharmacy
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Waiting for pharmacy to accept your order</p>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
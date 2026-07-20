import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import api from '../lib/api';

export const CartModal = () => {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal,
    clearCart 
  } = useCart();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cod',
    coordinates: null
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  if (!isCartOpen) return null;

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setOrderData(prev => ({ ...prev, coordinates: coords }));
          setGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please enter address manually.');
          setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setGettingLocation(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    try {
      // Validate cart items
      const validItems = cartItems.filter(item => item && (item.name || item.medicineName));
      if (validItems.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      
      const orderPayload = {
        orderType: 'patient',
        items: validItems.map(item => ({
          medicineName: item.name || item.medicineName,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || parseFloat((item.price || '0').replace('₹', '')),
          totalPrice: (item.unitPrice || parseFloat((item.price || '0').replace('₹', ''))) * (item.quantity || 1)
        })),
        customerInfo: {
          name: orderData.name,
          phone: orderData.phone,
          address: orderData.address
        },
        deliveryType: 'delivery',
        deliveryAddress: orderData.address,
        coordinates: orderData.coordinates || { lat: 30.7046, lng: 76.1512 },
        orderedBy: '68ccf820249ad6de413eab2f'
      };

      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to place an order');
        return;
      }

      const response = await api.post('/orders', {
        medicines: validItems.map(item => ({
          name: item.name || item.medicineName,
          quantity: item.quantity || 1,
          price: item.unitPrice || parseFloat((item.price || '0').replace('₹', ''))
        })),
        deliveryAddress: orderData.address,
        totalAmount: getCartTotal()
      });

      const result = response.data;
      
      if (result.success) {
        alert(`Order placed successfully! Order ID: ${result.order._id}\nEstimated delivery: 30-45 minutes`);
        clearCart();
        setIsCartOpen(false);
        setShowCheckout(false);
      } else {
        alert('Error placing order: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Order error:', error);
      if (error.response?.data?.message) {
        alert('Error placing order: ' + error.response.data.message);
      } else {
        alert('Error placing order. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Medicine Cart ({cartItems.length})
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {!showCheckout ? (
            <div className="p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.filter(item => item && (item.name || item.medicineName)).map((item, index) => (
                    <div key={item.name || item.medicineName || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name || item.medicineName}</h3>
                        <p className="text-sm text-gray-600">{item.price || `₹${item.unitPrice}`} each</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.availability === "In Stock" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          {item.availability}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.name || item.medicineName, (item.quantity || 1) - 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity || 1}</span>
                          <button
                            onClick={() => updateQuantity(item.name || item.medicineName, (item.quantity || 1) + 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">
                            ₹{((item.unitPrice || parseFloat((item.price || '0').replace('₹', ''))) * (item.quantity || 1)).toFixed(2)}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.name || item.medicineName)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total: ₹{getCartTotal().toFixed(2)}</span>
                      <span className="text-sm text-gray-600">+ Delivery charges may apply</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={clearCart}
                        className="flex-1"
                      >
                        Clear Cart
                      </Button>
                      <Button 
                        onClick={() => setShowCheckout(true)}
                        className="flex-1"
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {cartItems.filter(item => item && (item.name || item.medicineName)).map((item, index) => (
                    <div key={item.name || item.medicineName || index} className="flex justify-between text-sm mb-1">
                      <span>{item.name || item.medicineName} x{item.quantity || 1}</span>
                      <span>₹{((item.unitPrice || parseFloat((item.price || '0').replace('₹', ''))) * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-semibold">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>₹{getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={orderData.name}
                    onChange={(e) => setOrderData({...orderData, name: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={orderData.phone}
                    onChange={(e) => setOrderData({...orderData, phone: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Address</label>
                  <div className="space-y-2">
                    <textarea
                      required
                      value={orderData.address}
                      onChange={(e) => setOrderData({...orderData, address: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      rows="3"
                      placeholder="Enter complete delivery address"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="w-full"
                    >
                      {gettingLocation ? 'Getting Location...' : '📍 Use Current Location'}
                    </Button>
                    {orderData.coordinates && (
                      <p className="text-xs text-green-600">
                        ✓ Location detected for accurate pharmacy assignment
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    value={orderData.paymentMethod}
                    onChange={(e) => setOrderData({...orderData, paymentMethod: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowCheckout(false)}
                    className="flex-1"
                  >
                    Back to Cart
                  </Button>
                  <Button type="submit" className="flex-1">
                    Place Order - ₹{getCartTotal().toFixed(2)}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
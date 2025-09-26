import React from 'react';
import { CheckCircle, X, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from './ui/Button';

export const OrderSuccessModal = ({ isOpen, onClose, orderData }) => {
  if (!isOpen || !orderData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 scale-100 opacity-100">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Order Placed Successfully!
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Order Number:</span>
              <span className="text-sm font-mono font-bold text-primary">
                {orderData.orderNumber}
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Total Amount:</span>
              <span className="text-sm font-semibold">₹{orderData.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Clock className="h-4 w-4" />
              <span>Estimated Delivery: {orderData.estimatedDeliveryTime || '30-45 min'}</span>
            </div>
            
            {orderData.closestPharmacies && orderData.closestPharmacies.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Closest Pharmacies:</p>
                {orderData.closestPharmacies.map((pharmacy, index) => (
                  <div key={pharmacy.id} className="flex justify-between items-center text-xs text-gray-600 mb-1">
                    <span>{pharmacy.name}</span>
                    <span>{pharmacy.distance?.toFixed(1)}km • {Math.round(pharmacy.duration)}min</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-600 mb-6">
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{orderData.deliveryAddress || 'Address not provided'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{orderData.customerInfo?.phone || 'Phone not provided'}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            You will receive updates about your order status. The pharmacy will contact you once your order is ready.
          </p>
          
          <Button onClick={onClose} className="w-full">
            Continue Shopping
          </Button>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
import React from 'react';

export const SimpleOrderSuccess = ({ show, onClose, total }) => {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4">Order Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your order of ₹{total} has been placed successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Estimated delivery: 30-45 minutes
          </p>
          <button 
            onClick={onClose}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
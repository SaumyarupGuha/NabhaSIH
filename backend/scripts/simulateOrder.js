const fetch = require('node-fetch');

const simulatePatientOrder = async () => {
  const orderData = {
    orderType: 'patient',
    items: [
      {
        medicineName: 'Paracetamol 500mg',
        quantity: 2,
        unitPrice: 2.50,
        totalPrice: 5.00
      },
      {
        medicineName: 'Cough Syrup',
        quantity: 1,
        unitPrice: 45.00,
        totalPrice: 45.00
      }
    ],
    customerInfo: {
      name: 'John Doe',
      phone: '+91 98765 43210',
      address: '123 Main Street, Nabha, Punjab'
    },
    deliveryType: 'delivery',
    deliveryAddress: '123 Main Street, Nabha, Punjab',
    coordinates: { lat: 30.7046, lng: 76.1512 },
    orderedBy: 'patient_123'
  };

  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    console.log('Order Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

simulatePatientOrder();
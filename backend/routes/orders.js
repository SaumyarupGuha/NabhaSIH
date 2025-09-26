const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Get orders for pharmacy dashboard (Amazon-style)
router.get('/', async (req, res) => {
  try {
    const { pharmacyId } = req.query;
    
    if (!pharmacyId) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy ID is required'
      });
    }

    // Get all pending orders (available for all pharmacies to accept)
    const availableOrders = await Order.find({ 
      status: 'pending',
      acceptedBy: null
    })
      .populate('patientId', 'firstName lastName phone')
      .sort({ createdAt: -1 });
    
    // Get orders accepted by this specific pharmacy
    const myOrders = await Order.find({ 
      acceptedBy: pharmacyId
    })
      .populate('patientId', 'firstName lastName phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        availableOrders,
        myOrders,
        stats: {
          totalAvailable: availableOrders.length,
          totalMine: myOrders.length,
          pending: myOrders.filter(o => o.status === 'accepted').length,
          inProgress: myOrders.filter(o => o.status === 'preparing').length,
          ready: myOrders.filter(o => o.status === 'ready').length,
          delivered: myOrders.filter(o => o.status === 'delivered').length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { items, customerInfo, deliveryAddress, orderedBy, coordinates } = req.body;
    
    console.log('📍 Order request coordinates:', coordinates);
    
    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Map items to medicines format
    const medicines = items.map(item => ({
      name: item.medicineName,
      quantity: item.quantity,
      price: item.unitPrice
    }));
    
    // Calculate delivery time using verified pharmacies
    let estimatedDeliveryTime = '30-45 min'; // default fallback
    if (coordinates) {
      try {
        const distanceCalculator = require('../services/distanceCalculator');
        
        if (req.body.assignedPharmacy) {
          // Calculate distance to specific verified pharmacy
          console.log(`🗺️ Calculating delivery time from ${req.body.assignedPharmacy} to customer location`);
          
          const distanceResults = await distanceCalculator.calculateDistanceToSpecificPharmacy(
            coordinates,
            req.body.assignedPharmacy
          );
          
          if (distanceResults.length > 0) {
            const estimatedTime = Math.round(distanceResults[0].durationInTraffic);
            estimatedDeliveryTime = `${estimatedTime} min`;
            console.log(`📍 Delivery calculation: ${distanceResults[0].distance.toFixed(2)}km, ${estimatedTime}min`);
          }
        } else {
          // Find nearest verified pharmacy
          const distanceResults = await distanceCalculator.calculateDistanceToVerifiedPharmacies(coordinates);
          
          if (distanceResults.length > 0) {
            const nearest = distanceResults.sort((a, b) => a.distance - b.distance)[0];
            const estimatedTime = Math.round(nearest.durationInTraffic);
            estimatedDeliveryTime = `${estimatedTime} min`;
            console.log(`📍 Nearest pharmacy: ${nearest.pharmacyName}, ${nearest.distance.toFixed(2)}km, ${estimatedTime}min`);
          }
        }
      } catch (error) {
        console.error('⚠️ Distance calculation failed:', error.message);
        console.log('Using default delivery time');
      }
    } else {
      console.log('⚠️ No coordinates provided, using default time');
    }
    
    console.log('⏰ Final estimatedDeliveryTime:', estimatedDeliveryTime);
    
    const order = new Order({
      patientId: orderedBy,
      medicines,
      totalAmount,
      deliveryAddress,
      customerInfo,
      estimatedDeliveryTime,
      status: 'pending'
    });
    
    await order.save();
    
    const orderObject = order.toObject();
    const responseData = {
      success: true,
      data: {
        ...orderObject,
        estimatedDeliveryTime: estimatedDeliveryTime,
        orderNumber: orderObject.orderNumber,
        totalAmount: orderObject.totalAmount,
        deliveryAddress: orderObject.deliveryAddress,
        customerInfo: orderObject.customerInfo
      },
      estimatedDeliveryTime: estimatedDeliveryTime,
      message: 'Order created successfully'
    };
    
    console.log('📤 Sending response with estimatedDeliveryTime:', estimatedDeliveryTime);
    console.log('📤 Full response data:', JSON.stringify(responseData, null, 2));
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// Accept order with atomic claiming (Amazon-style)
router.post('/:orderId/accept', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { pharmacyId } = req.body;

    console.log(`Pharmacy ${pharmacyId} attempting to accept order ${orderId}`);

    // Get pharmacy information
    const User = require('../models/User');
    const pharmacy = await User.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    const pharmacyInfo = {
      name: pharmacy.selectedPharmacy || pharmacy.pharmacyName || `${pharmacy.firstName} ${pharmacy.lastName}`,
      address: pharmacy.pharmacyAddress || 'Address not available',
      phone: pharmacy.phone
    };

    // Atomic update - only update if status is 'pending' and not claimed
    const order = await Order.findOneAndUpdate(
      { 
        _id: orderId, 
        status: 'pending', 
        acceptedBy: null 
      },
      { 
        status: 'accepted',
        acceptedBy: pharmacyId,
        pharmacyName: pharmacyInfo.name,
        pharmacyAddress: pharmacyInfo.address,
        pharmacyPhone: pharmacyInfo.phone,
        acceptedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'firstName lastName phone');

    if (!order) {
      console.log(`Order ${orderId} already taken or not found`);
      return res.status(409).json({
        success: false,
        message: 'Order already taken by another pharmacy'
      });
    }

    console.log(`Order ${orderId} successfully accepted by pharmacy ${pharmacyId}`);

    // Update stock quantities when order is accepted
    try {
      const Stock = require('../models/Stock');
      for (const medicine of order.medicines) {
        await Stock.findOneAndUpdate(
          { 
            pharmacy: pharmacyId,
            medicineName: medicine.name
          },
          { 
            $inc: { quantity: -medicine.quantity }
          },
          { new: true }
        );
        console.log(`📦 Reduced stock for ${medicine.name} by ${medicine.quantity}`);
      }
    } catch (stockError) {
      console.error('Error updating stock:', stockError);
      // Continue with order acceptance even if stock update fails
    }

    // Emit real-time updates
    if (req.io) {
      // Notify all pharmacies that this order is no longer available
      req.io.emit('orderAccepted', {
        orderId: order._id,
        acceptedBy: pharmacyId,
        pharmacyName: pharmacyInfo.name,
        order: order
      });
      
      // Notify customer about order acceptance (only if patientId exists)
      if (order.patientId && order.patientId._id) {
        // Emit to specific patient room
        req.io.to(`patient_${order.patientId._id}`).emit('orderStatusUpdate', {
          orderId: order._id,
          customerId: order.patientId._id,
          status: 'accepted',
          pharmacyName: pharmacyInfo.name,
          message: `Your order has been accepted by ${pharmacyInfo.name}`
        });
        
        // Also emit general event for backward compatibility
        req.io.emit('orderStatusUpdate', {
          orderId: order._id,
          customerId: order.patientId._id,
          status: 'accepted',
          pharmacyName: pharmacyInfo.name,
          message: `Your order has been accepted by ${pharmacyInfo.name}`
        });
      }

      // Emit stock update to pharmacy dashboard
      req.io.emit('stockUpdated', {
        pharmacyId: pharmacyId,
        message: 'Stock updated after order acceptance'
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order accepted successfully'
    });

  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept order'
    });
  }
});

// Reject order
router.post('/:orderId/reject', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { pharmacyId } = req.body;

    console.log('Reject request - OrderId:', orderId, 'PharmacyId:', pharmacyId);

    // First check if order exists
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      console.log('Order not found:', orderId);
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    console.log('Order status:', existingOrder.status);
    console.log('Already rejected by:', existingOrder.rejectedBy);

    // Add pharmacy to rejectedBy array and update status if all pharmacies reject
    const order = await Order.findOneAndUpdate(
      { 
        _id: orderId, 
        status: 'pending',
        rejectedBy: { $ne: pharmacyId }
      },
      { 
        $addToSet: { rejectedBy: pharmacyId },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      console.log('Order update failed - likely already rejected by this pharmacy or not pending');
      return res.status(400).json({ 
        success: false, 
        message: 'Order not found, no longer pending, or already rejected by this pharmacy' 
      });
    }

    console.log('Order rejected successfully by pharmacy:', pharmacyId);
    
    res.json({ 
      success: true, 
      message: 'Order rejected successfully',
      data: order
    });
  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject order' 
    });
  }
});

// Dedicated route for updating order status
router.put('/updateOrderStatus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    // Update order status in MongoDB
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        status: status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('patientId', 'firstName lastName phone');

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Emit real-time update
    if (req.io) {
      req.io.emit('orderStatusUpdated', {
        orderId: updatedOrder._id,
        status: status,
        pharmacyName: updatedOrder.pharmacyName,
        order: updatedOrder
      });
    }

    res.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// Update order status (Amazon-style with authorization)
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, pharmacyId } = req.body;

    // Validate status
    const validStatuses = ['accepted', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    // Find order and verify pharmacy ownership
    const order = await Order.findOne({ 
      _id: orderId, 
      acceptedBy: pharmacyId 
    }).populate('patientId', 'firstName lastName phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not owned by this pharmacy'
      });
    }

    // Update status
    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    console.log(`Order ${orderId} status updated to ${status} by pharmacy ${pharmacyId}`);

    // Emit real-time updates
    if (req.io) {
      // Notify customer (only if patientId exists)
      if (order.patientId && order.patientId._id) {
        // Emit to specific patient room
        req.io.to(`patient_${order.patientId._id}`).emit('orderStatusUpdate', {
          orderId: order._id,
          customerId: order.patientId._id,
          status: status,
          pharmacyName: order.pharmacyName,
          message: getStatusMessage(status, order.pharmacyName)
        });
        
        // Also emit general event for backward compatibility
        req.io.emit('orderStatusUpdate', {
          orderId: order._id,
          customerId: order.patientId._id,
          status: status,
          pharmacyName: order.pharmacyName,
          message: getStatusMessage(status, order.pharmacyName)
        });
      }
      
      // Notify pharmacy dashboard
      req.io.emit('orderUpdated', {
        orderId: order._id,
        status: status,
        order: order
      });
    }

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// Helper function for status messages
function getStatusMessage(status, pharmacyName) {
  const messages = {
    'accepted': `Your order has been accepted by ${pharmacyName}`,
    'preparing': `${pharmacyName} is preparing your order`,
    'ready': `Your order is ready for pickup at ${pharmacyName}`,
    'delivered': `Your order has been delivered by ${pharmacyName}`,
    'cancelled': `Your order has been cancelled by ${pharmacyName}`
  };
  return messages[status] || `Order status updated to ${status}`;
}

// Get patient orders
router.get('/patient', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../models/User');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const orders = await Order.find({ patientId: user._id })
      .populate('patientId', 'firstName lastName phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching patient orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Test Google Maps API
router.get('/test-maps', async (req, res) => {
  try {
    const distanceCalculator = require('../services/distanceCalculator');
    
    console.log('🧪 Testing Google Maps API...');
    
    // Test distance from Nabha center to a nearby location
    const nabhaCenter = { lat: 30.3752, lng: 76.1496 };
    const testLocation = { lat: 30.3800, lng: 76.1500 };
    
    const results = await distanceCalculator.calculateRealTimeDistance(
      [nabhaCenter],
      [testLocation]
    );
    
    res.json({
      success: true,
      message: 'Google Maps API test completed',
      data: results
    });
    
  } catch (error) {
    console.error('Maps API test error:', error);
    res.status(500).json({
      success: false,
      message: 'Maps API test failed',
      error: error.message
    });
  }
});

module.exports = router;
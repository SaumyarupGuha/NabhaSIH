const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { findOptimalPharmacy, updateStock } = require('../services/pharmacyMatcher');

// Create new order
router.post('/', async (req, res) => {
  try {
    const { orderType, items, customerInfo, deliveryType, deliveryAddress, coordinates } = req.body;
    
    const orderNumber = 'ORD' + Date.now();
    
    // Find optimal pharmacy
    const optimalMatch = await findOptimalPharmacy(items, coordinates, orderType);
    
    if (!optimalMatch) {
      return res.status(404).json({ 
        success: false, 
        message: 'No pharmacy available with required medicines' 
      });
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const order = new Order({
      orderNumber,
      orderType,
      orderedBy: req.body.orderedBy,
      assignedPharmacy: optimalMatch.pharmacy._id,
      items,
      totalAmount,
      deliveryType,
      deliveryAddress,
      customerInfo,
      coordinates,
      status: 'assigned',
      estimatedTime: new Date(Date.now() + 30 * 60000) // 30 minutes
    });

    await order.save();

    // Emit to pharmacy via Socket.IO
    req.app.get('io').to(`pharmacy_${optimalMatch.pharmacy._id}`).emit('newOrder', {
      order,
      distance: optimalMatch.distance,
      estimatedTime: 30
    });

    res.json({ 
      success: true, 
      data: order,
      assignedPharmacy: optimalMatch.pharmacy,
      estimatedDistance: optimalMatch.distance
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get orders for pharmacy
router.get('/pharmacy/:pharmacyId', async (req, res) => {
  try {
    const orders = await Order.find({ 
      assignedPharmacy: req.params.pharmacyId 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept/Reject order
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status, rejectionReason, estimatedTime } = req.body;
    
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status === 'accepted') {
      // Update stock
      const stockUpdated = await updateStock(order.assignedPharmacy, order.items);
      if (!stockUpdated) {
        return res.status(400).json({ success: false, message: 'Failed to update stock' });
      }
      
      order.status = 'accepted';
      order.estimatedTime = estimatedTime || new Date(Date.now() + 45 * 60000);
    } else if (status === 'rejected') {
      order.status = 'rejected';
      order.rejectionReason = rejectionReason;
    }

    await order.save();

    // Notify customer
    req.app.get('io').to(`order_${order._id}`).emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status,
      estimatedTime: order.estimatedTime,
      rejectionReason: order.rejectionReason
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status (preparing, ready, delivered)
router.patch('/:orderId/progress', async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );

    // Notify customer
    req.app.get('io').to(`order_${order._id}`).emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
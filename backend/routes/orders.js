const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Get orders for pharmacy dashboard (pending + accepted by current pharmacy)
router.get('/', async (req, res) => {
  try {
    const pharmacyId = req.query.pharmacyId || req.headers['x-pharmacy-id'];
    
    let query = {};
    if (pharmacyId) {
      // Return ONLY pending orders + orders accepted by THIS pharmacy
      query = {
        $or: [
          { status: 'pending', acceptedBy: null },  // Only unclaimed pending orders
          { acceptedBy: pharmacyId }  // Only orders accepted by this pharmacy
        ]
      };
    } else {
      // Return only pending orders if no pharmacy specified
      query = { status: 'pending', acceptedBy: null };
    }

    const orders = await Order.find(query)
      .populate('patientId', 'firstName lastName phone')
      .sort({ createdAt: -1 });

    console.log(`Pharmacy ${pharmacyId} sees ${orders.length} orders`);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { items, deliveryAddress, orderedBy, customerInfo } = req.body;

    const order = new Order({
      patientId: orderedBy || '507f1f77bcf86cd799439011',
      medicines: items ? items.map(item => ({
        name: item.medicineName,
        quantity: item.quantity,
        price: item.unitPrice
      })) : [],
      deliveryAddress: deliveryAddress || 'Test Address',
      customerInfo: customerInfo || {},
      totalAmount: items ? items.reduce((sum, item) => sum + (item.totalPrice || 0), 0) : 0,
      status: 'pending',
      acceptedBy: null  // Explicitly set to null for new orders
    });

    await order.save();
    
    // Populate for broadcast
    const populatedOrder = await Order.findById(order._id)
      .populate('patientId', 'firstName lastName phone');

    // Broadcast new order to all pharmacies
    if (req.io) {
      req.io.emit('newOrder', populatedOrder);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderNumber: order.orderNumber,
        _id: order._id,
        status: order.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, deliveredAt: status === 'delivered' ? new Date() : undefined },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Broadcast status update if io is available
    if (req.io) {
      req.io.emit('orderStatusUpdated', {
        orderId: order._id,
        status: order.status
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept order (atomic claiming - Amazon style)
router.post('/:id/accept', async (req, res) => {
  try {
    const { pharmacyId } = req.body;
    const orderId = req.params.id;

    // Use a default pharmacy ID if none provided
    const defaultPharmacyId = '507f1f77bcf86cd799439011';
    const actualPharmacyId = pharmacyId || defaultPharmacyId;

    console.log('Accepting order:', orderId, 'for pharmacy:', actualPharmacyId);

    // Atomic update: only accept if still pending and not claimed
    const order = await Order.findOneAndUpdate(
      { 
        _id: orderId,
        status: 'pending',
        acceptedBy: null  // Ensure not already claimed
      },
      { 
        status: 'accepted',
        acceptedBy: actualPharmacyId,
        acceptedAt: new Date()
      },
      { 
        new: true
      }
    );

    if (!order) {
      return res.status(409).json({ 
        success: false,
        message: 'Order already taken by another pharmacy or not found' 
      });
    }

    console.log('Order accepted successfully:', order._id);

    // Broadcast to all connected pharmacies
    if (req.io) {
      req.io.emit('orderClaimed', {
        orderId: order._id,
        claimedBy: actualPharmacyId,
        order: order
      });
    }

    res.json({ 
      success: true, 
      data: order,
      message: 'Order successfully claimed'
    });
  } catch (error) {
    console.error('Error claiming order:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to claim order' 
    });
  }
});

module.exports = router;
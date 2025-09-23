const express = require('express');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get orders for pharmacy dashboard
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'pharmacist') {
      // Return pending orders + orders accepted by current pharmacy
      query = {
        $or: [
          { status: 'pending' },
          { acceptedBy: req.user.id }
        ]
      };
    } else if (req.user.role === 'patient') {
      // Return orders placed by current patient
      query = { patientId: req.user.id };
    } else {
      // For demo purposes, return all pending orders
      query = { status: 'pending' };
    }

    const orders = await Order.find(query)
      .populate('patientId', 'name phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { medicines, deliveryAddress, totalAmount, pharmacyId } = req.body;

    const order = new Order({
      patientId: req.user.id,
      medicines,
      deliveryAddress,
      totalAmount,
      pharmacyId,
      status: 'pending'
    });

    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('patientId', 'name phone');

    // Broadcast new order to all pharmacies
    req.io.emit('newOrder', populatedOrder);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
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
    ).populate('patientId', 'name phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Broadcast status update
    req.io.emit('orderStatusUpdated', {
      orderId: order._id,
      status: order.status,
      updatedBy: req.user.id
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept order (atomic claiming)
router.post('/:id/accept', auth, async (req, res) => {
  try {
    if (req.user.role !== 'pharmacist') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Atomic update: only accept if still pending
    const order = await Order.findOneAndUpdate(
      { 
        _id: req.params.id, 
        status: 'pending',
        acceptedBy: null 
      },
      { 
        status: 'accepted',
        acceptedBy: req.user.id,
        acceptedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'name phone');

    if (!order) {
      return res.status(409).json({ message: 'Order already taken or not found' });
    }

    // Broadcast to all pharmacies
    req.io.emit('orderAccepted', {
      orderId: order._id,
      acceptedBy: req.user.id,
      pharmacyName: req.user.name
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
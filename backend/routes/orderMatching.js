const express = require('express');
const Order = require('../models/Order');
const Pharmacy = require('../models/Pharmacy');
const Stock = require('../models/Stock');
const distanceCalculator = require('../services/distanceCalculator');
const router = express.Router();

// Find nearby pharmacies for order placement
router.post('/find-pharmacies', async (req, res) => {
  try {
    const { userLocation, deliveryAddress, medicines } = req.body;

    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      return res.status(400).json({
        success: false,
        message: 'Valid user location is required'
      });
    }

    // Get all active pharmacies
    const pharmacies = await Pharmacy.find({
      isVerified: true,
      isActive: true,
      isOpen: true
    }).populate('stock');

    if (pharmacies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pharmacies available at the moment'
      });
    }

    // Find nearest pharmacies with stock availability
    const nearbyPharmacies = await distanceCalculator.findNearestPharmacies(
      userLocation,
      pharmacies,
      medicines
    );

    // Filter pharmacies within reasonable delivery distance (15km)
    const availablePharmacies = nearbyPharmacies
      .filter(pharmacy => pharmacy.distance <= 15)
      .slice(0, 5); // Limit to top 5 nearest

    // Add delivery zone information
    const pharmaciesWithDelivery = availablePharmacies.map(pharmacy => ({
      ...pharmacy,
      deliveryZone: distanceCalculator.getDeliveryZone(pharmacy.distance)
    }));

    res.json({
      success: true,
      data: pharmaciesWithDelivery,
      message: `Found ${pharmaciesWithDelivery.length} nearby pharmacies`
    });

  } catch (error) {
    console.error('Error finding pharmacies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby pharmacies'
    });
  }
});

// Create order with automatic pharmacy assignment
router.post('/create', async (req, res) => {
  try {
    const { 
      medicines, 
      pharmacyId, 
      deliveryAddress, 
      userLocation, 
      totalAmount,
      userId 
    } = req.body;

    // Verify pharmacy availability
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy || !pharmacy.isActive || !pharmacy.isOpen) {
      return res.status(400).json({
        success: false,
        message: 'Selected pharmacy is not available'
      });
    }

    // Check stock availability
    const stockCheck = await Promise.all(
      medicines.map(async (medicine) => {
        const stock = await Stock.findOne({
          pharmacyId: pharmacyId,
          medicineId: medicine.medicineId
        });
        
        return {
          medicineId: medicine.medicineId,
          requested: medicine.quantity,
          available: stock ? stock.quantity : 0,
          sufficient: stock && stock.quantity >= medicine.quantity
        };
      })
    );

    const insufficientStock = stockCheck.filter(item => !item.sufficient);
    if (insufficientStock.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for some medicines',
        data: insufficientStock
      });
    }

    // Calculate delivery details using Google Maps API
    const distanceResults = await distanceCalculator.calculateRealTimeDistance(
      [userLocation],
      [pharmacy.coordinates]
    );
    
    let distance, estimatedTime;
    if (distanceResults.length > 0) {
      distance = distanceResults[0].distance;
      estimatedTime = Math.round(distanceResults[0].durationInTraffic);
    } else {
      // Fallback calculation
      distance = distanceCalculator.calculateHaversineDistance(
        userLocation.lat, userLocation.lng,
        pharmacy.coordinates.lat, pharmacy.coordinates.lng
      );
      estimatedTime = Math.round((distance / 30) * 60); // 30 km/h average speed
    }
    
    const deliveryZone = distanceCalculator.getDeliveryZone(distance);
    console.log(`📍 Delivery calculation: ${distance.toFixed(2)}km, ${estimatedTime}min (${deliveryZone.zone} zone)`);

    // Generate order number
    const orderNumber = 'ORD' + Date.now().toString().slice(-8);

    // Create order
    const order = new Order({
      orderNumber,
      userId,
      pharmacyId,
      medicines,
      deliveryAddress,
      userLocation,
      totalAmount: totalAmount + deliveryZone.fee,
      deliveryFee: deliveryZone.fee,
      estimatedDeliveryTime: `${estimatedTime} min`,
      distance: distance,
      status: 'pending',
      createdAt: new Date()
    });

    await order.save();

    // Reserve stock (optional - implement if needed)
    await Promise.all(
      medicines.map(async (medicine) => {
        await Stock.findOneAndUpdate(
          {
            pharmacyId: pharmacyId,
            medicineId: medicine.medicineId
          },
          {
            $inc: { reservedQuantity: medicine.quantity }
          }
        );
      })
    );

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('pharmacyId', 'name address phone')
      .populate('userId', 'name phone');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// Get real-time stock availability
router.post('/check-stock', async (req, res) => {
  try {
    const { pharmacyId, medicines } = req.body;

    const stockAvailability = await Promise.all(
      medicines.map(async (medicine) => {
        const stock = await Stock.findOne({
          pharmacyId: pharmacyId,
          medicineId: medicine.medicineId
        }).populate('medicineId', 'name price');

        return {
          medicineId: medicine.medicineId,
          medicineName: stock?.medicineId?.name || 'Unknown',
          requestedQuantity: medicine.quantity,
          availableQuantity: stock ? stock.quantity : 0,
          price: stock?.medicineId?.price || 0,
          inStock: stock && stock.quantity >= medicine.quantity,
          lastUpdated: stock?.lastUpdated || null
        };
      })
    );

    const allInStock = stockAvailability.every(item => item.inStock);

    res.json({
      success: true,
      data: {
        pharmacyId,
        medicines: stockAvailability,
        allAvailable: allInStock,
        checkedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error checking stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check stock availability'
    });
  }
});

// Update delivery ETA based on traffic
router.patch('/update-eta/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { currentLocation } = req.body;

    const order = await Order.findById(orderId).populate('pharmacyId');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Calculate updated ETA
    const distances = await distanceCalculator.calculateRealTimeDistance(
      [currentLocation || order.pharmacyId.coordinates],
      [order.userLocation]
    );

    if (distances.length > 0) {
      const updatedETA = Math.round(distances[0].durationInTraffic);
      
      await Order.findByIdAndUpdate(orderId, {
        estimatedDeliveryTime: `${updatedETA} min`,
        lastETAUpdate: new Date()
      });

      res.json({
        success: true,
        data: {
          orderId,
          updatedETA: `${updatedETA} min`,
          updatedAt: new Date()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unable to calculate updated ETA'
      });
    }

  } catch (error) {
    console.error('Error updating ETA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ETA'
    });
  }
});

module.exports = router;
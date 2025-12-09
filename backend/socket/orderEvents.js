const Order = require('../models/Order');

const handleOrderEvents = (io) => {
  io.on('connection', (socket) => {


    // Join pharmacy room for targeted updates
    socket.on('joinPharmacy', (pharmacyId) => {
      socket.join(`pharmacy_${pharmacyId}`);
    });

    // Handle real-time order updates
    socket.on('orderStatusUpdate', async (data) => {
      try {
        const { orderId, status } = data;
        
        const order = await Order.findByIdAndUpdate(
          orderId,
          { status },
          { new: true }
        ).populate('patientId', 'name phone');

        if (order) {
          // Broadcast to all pharmacies
          io.emit('orderUpdated', order);
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
    });
  });
};

module.exports = handleOrderEvents;
const Order = require('../models/Order');

// Simulated Payment Handler
const makePayment = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ msg: 'Order already paid' });
    }

    // Simulate payment success
    order.paymentStatus = 'Paid';
    order.paymentId = `PAY-${Math.random().toString(36).substring(2, 12)}`;
    order.paidAt = new Date();
    order.status = 'Confirmed'; // Optionally auto-confirm the order

    await order.save();

    res.status(200).json({ msg: 'Payment successful', order });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { makePayment };

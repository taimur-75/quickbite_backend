const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Dish = require('../models/Dish');

// 1. Place Order (from cart)
const placeOrder = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.dish');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    let totalPrice = 0;
    const orderItems = cart.items.map(item => {
      totalPrice += item.dish.price * item.quantity;
      return { dish: item.dish._id, quantity: item.quantity };
    });

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalPrice
    });

    await newOrder.save();

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// 2. Get orders
const getOrders = async (req, res) => {
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';

  try {
    const query = isAdmin ? {} : { user: userId };
    const orders = await Order.find(query).populate('items.dish user');

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// 3. Get order by ID
const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).populate('items.dish user');
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    // Allow only admin or the user who placed the order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// 4. Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  const { orderId } = req.params;
  const { status } = req.body;

  if (!['Pending', 'Confirmed', 'Delivered', 'Cancelled'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// 5. Delete order (admin only)
const deleteOrder = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  const { orderId } = req.params;

  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    res.status(200).json({ msg: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};

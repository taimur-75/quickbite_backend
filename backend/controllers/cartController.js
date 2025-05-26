const Cart = require('../models/Cart');
const Dish = require('../models/Dish');

// Add or update an item in the cart
const addToCart = async (req, res) => {
  const userId = req.user._id;
  const { dishId, quantity } = req.body;

  if (!dishId || !quantity) {
    return res.status(400).json({ msg: 'Dish ID and quantity are required' });
  }

  try {
    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ msg: 'Dish not found' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ dish: dishId, quantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.dish.toString() === dishId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ dish: dishId, quantity });
      }
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.dish');

    const response = {
      cartId: populatedCart._id,
      userId: populatedCart.user,
      items: populatedCart.items.map(item => ({
        cartItemId: item._id,
        dishId: item.dish._id,
        dishName: item.dish.name,
        quantity: item.quantity,
        price: item.dish.price,
        category: item.dish.category
      })),
      createdAt: populatedCart.createdAt,
      updatedAt: populatedCart.updatedAt
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get current user's cart with dish details
const getCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.dish');

    if (!cart) {
      return res.status(200).json({ cartId: null, userId, items: [] });
    }

    const response = {
      cartId: cart._id,
      userId: cart.user,
      items: cart.items.map(item => ({
        cartItemId: item._id,
        dishId: item.dish._id,
        dishName: item.dish.name,
        quantity: item.quantity,
        price: item.dish.price,
        category: item.dish.category
      })),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update quantity for a cart item
const updateCartItem = async (req, res) => {
  const userId = req.user._id;
  const { dishId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ msg: 'Quantity must be at least 1' });
  }

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.dish.toString() === dishId);
    if (itemIndex === -1) {
      return res.status(404).json({ msg: 'Dish not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.dish');

    const response = {
      cartId: populatedCart._id,
      userId: populatedCart.user,
      items: populatedCart.items.map(item => ({
        cartItemId: item._id,
        dishId: item.dish._id,
        dishName: item.dish.name,
        quantity: item.quantity,
        price: item.dish.price,
        category: item.dish.category
      })),
      createdAt: populatedCart.createdAt,
      updatedAt: populatedCart.updatedAt
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  const userId = req.user._id;
  const { dishId } = req.params;

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.dish.toString() !== dishId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.dish');

    const response = {
      cartId: populatedCart._id,
      userId: populatedCart.user,
      items: populatedCart.items.map(item => ({
        cartItemId: item._id,
        dishId: item.dish._id,
        dishName: item.dish.name,
        quantity: item.quantity,
        price: item.dish.price,
        category: item.dish.category
      })),
      createdAt: populatedCart.createdAt,
      updatedAt: populatedCart.updatedAt
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
};

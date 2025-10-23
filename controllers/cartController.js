const Cart = require('../models/Cart');
const Dish = require('../models/Dish');

// Add or update multiple items in the cart
const addToCart = async (req, res) => {
  const userId = req.user._id;
  const { items } = req.body; // Expect an array

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: 'Items array is required' });
  }

  try {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // create a new cart
      cart = new Cart({ user: userId, items: [] });
    }

    for (const item of items) {
      const { dish, quantity } = item;

      if (!dish || !quantity) continue; // skip invalid

      const dishExists = await Dish.findById(dish);
      if (!dishExists) continue; // skip if dish not found

      const existingIndex = cart.items.findIndex(i => i.dish.toString() === dish);
      if (existingIndex > -1) {
        // update quantity
        cart.items[existingIndex].quantity = quantity;
      } else {
        // add new item
        cart.items.push({ dish, quantity });
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
    console.error('Cart save error:', err);
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

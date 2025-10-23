require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const dishRoutes = require('./routes/dishRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const imageProxy = require('./routes/imageProxy');

// CRITICAL: Import the specific webhook handler directly from the controller
const { handleStripeWebhook } = require('./controllers/paymentController');

const app = express();

connectDB();

const FRONTEND_URL = process.env.FRONTEND_URL;

// --- CRITICAL FIX: ISOLATED WEBHOOK ROUTE (MUST BE FIRST) ---
// This route uses bodyParser.raw() and must be defined BEFORE the global express.json()
// to ensure the raw body buffer is available for Stripe signature verification.
app.post(
    '/api/payments/webhook', 
    bodyParser.raw({ type: 'application/json' }), 
    handleStripeWebhook
);

app.use(cors({
    origin: FRONTEND_URL, // Use the environment variable here
    credentials: true // Keep this if your frontend sends cookies/auth headers
}));

// These parsers apply to all remaining routes (e.g., /api/payments/create-checkout-session)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API ROUTE MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);// This now only handles non-webhook routes.
app.use('/api/profile', profileRoutes);
app.use('/api/admin-users', adminUserRoutes);
app.use('/api/admin-orders', adminOrderRoutes);
app.use('/api/admin-dashboard', adminDashboardRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/image_proxy',imageProxy);

app.get('/', (req, res) => {
  res.send('QuickBite Backend Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

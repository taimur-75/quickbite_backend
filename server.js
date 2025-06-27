require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

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

const app = express();

connectDB();

app.use(express.json());

const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(cors({
    origin: FRONTEND_URL, // Use the environment variable here
    credentials: true // Keep this if your frontend sends cookies/auth headers
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
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

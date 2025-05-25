const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Access Denied: No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part after 'Bearer'

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to request
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Access Denied: Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access Denied: Admins only' });
  }
  next();
};

module.exports = { protect, isAdmin };

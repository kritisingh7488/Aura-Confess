const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Check for JWT token in cookies or Authorization header
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Please login to continue.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token. Please login again.' 
    });
  }
};

module.exports = authMiddleware;

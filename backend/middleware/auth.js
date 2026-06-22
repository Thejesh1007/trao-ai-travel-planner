const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // 1. Read the Authorization header
  // Frontend sends: "Authorization: Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  // 2. Check if header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  // 3. Extract just the token part (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  try {
    // 4. Verify the token using our secret key
    // If token is fake or expired, this line THROWS an error
    // If token is valid, it returns the payload we put in when we created it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach user info to request object
    // Now any controller after this middleware can access req.user.id
    req.user = decoded;

    // 6. Call next() to pass control to the actual route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = protect;
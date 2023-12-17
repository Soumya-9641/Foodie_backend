const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have an Admin model
require('dotenv').config();
async function isUser(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);

    const user = await User.findById(decoded.userId);

    if (!User) { 
      return res.status(403).json({ message: 'User access denied' });
    }

   
    req.adminId = User._id;
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

module.exports = isUser;
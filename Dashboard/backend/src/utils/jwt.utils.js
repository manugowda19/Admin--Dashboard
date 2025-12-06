const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } = require('../config/jwt');

exports.generateToken = (userId) => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });
};

exports.generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
};

exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtRefreshSecret);
};


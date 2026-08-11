require('dotenv').config();

module.exports.custom = {

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  jwtSecret: process.env.JWT_SECRET,

  jwtExpiresIn: '7d'

};
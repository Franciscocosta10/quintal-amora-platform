require('dotenv').config();

module.exports.custom = {

  jwtSecret: process.env.JWT_SECRET,

  jwtExpiresIn: '7d'

};
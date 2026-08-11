module.exports.security = {

  cors: {
    allRoutes: true,
    allowOrigins: 'http://localhost:5173',
    allowCredentials: false,
    allowRequestHeaders: 'content-type,authorization',
  },

  // csrf: false

};  
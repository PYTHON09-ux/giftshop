const { app, connectDB } = require('../app.js');

// Connect DB on cold start, then handle request
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
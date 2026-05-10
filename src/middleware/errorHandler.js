const notFound = (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
};

module.exports = { notFound, errorHandler };

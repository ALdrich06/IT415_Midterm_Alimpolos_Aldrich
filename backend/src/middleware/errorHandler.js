class AppError extends Error {
  constructor(message, statusCode = 400, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    console.error("[error]", err);
  }
  res.status(statusCode).json({
    message: err.message || "Internal server error.",
    details: err.details,
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };

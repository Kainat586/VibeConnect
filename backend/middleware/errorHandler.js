/**
 * Central error handler middleware
 */
export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    status,
  });
} 
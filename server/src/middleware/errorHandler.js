// Centralised error handler - all errors flow here via next(err)
// Keeps error shape consistent: { error: { code, message } }
export function errorHandler(err, req, res, next) {
  // Don't leak internals in production
  const isDev = process.env.NODE_ENV !== 'production';
  const statusCode = err.statusCode || 500;

  console.error(`❌ [${req.method}] ${req.url} — ${err.message}`);

  res.status(statusCode).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      ...(isDev && { stack: err.stack }),
    },
  });
}

export function notFound(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.url}`,
    },
  });
}

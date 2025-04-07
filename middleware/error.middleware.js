// errorHandler.js
const errorMiddleware = (err, req, res, next) => {
//   console.error(err.stack); // Log the error stack trace for debugging

  const statusCode = err.status || 500; // Default to 500 if status not set
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;

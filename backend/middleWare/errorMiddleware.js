const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  
  console.log("🚀 ~ file: errorMiddleware.js:11 ~ errorHandler ~ message:", error.message)
  console.log("🚀 ~ file: errorMiddleware.js:3 ~ errorHandler ~ res.statusCode:", res.statusCode)

  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : null,
  });
    
};

module.exports = errorHandler;

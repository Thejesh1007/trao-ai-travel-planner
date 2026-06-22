const mongoose = require('mongoose');

// This function connects to MongoDB using the URI from .env
const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise, so we await it
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // conn.connection.host tells us which server we connected to
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and exit the process
    // process.exit(1) means "exit with failure" - stops the server
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
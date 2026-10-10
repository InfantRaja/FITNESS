const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.warn('[Database Notice] If running locally without MongoDB, please install MongoDB Community Server or supply a valid MONGO_URI in .env (e.g. from MongoDB Atlas).');
  }
};

module.exports = connectDB;

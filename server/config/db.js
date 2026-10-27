const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/watch_party';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
      autoIndex: true,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[MongoDB] Connection notice: ${error.message}`);
    console.warn('[MongoDB] Operating in hybrid/in-memory fallback mode. Ensure MongoDB is running to enable persistent database storage.');
    isConnected = false;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('[MongoDB] Connection lost');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[MongoDB] Reconnected');
});

module.exports = {
  connectDB,
  isDbConnected: () => isConnected,
};

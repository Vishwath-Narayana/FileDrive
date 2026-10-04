const mongoose = require('mongoose');

// Atlas free/shared clusters can be slow to wake or briefly unreachable. Retry a few
// times with backoff before giving up, so a platform restart policy can take over.
const connectDB = async (attempts = 5) => {
  for (let i = 1; i <= attempts; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10_000,
        maxPoolSize: 10,
      });
      console.log('MongoDB connected successfully');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i}/${attempts} failed:`, error.message);
      if (i === attempts) process.exit(1);
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
};

module.exports = connectDB;

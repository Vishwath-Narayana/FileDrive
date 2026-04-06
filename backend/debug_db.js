require('dotenv').config();
const mongoose = require('mongoose');
require('./models/User'); // Register User model
const File = require('./models/File');

async function checkFiles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const files = await File.find().sort({ createdAt: -1 }).limit(1).populate('uploader', 'name');
    if (files.length === 0) {
      console.log("No files found in DB");
    } else {
      console.log("Latest File Data:");
      console.log(JSON.stringify(files[0], null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

checkFiles();

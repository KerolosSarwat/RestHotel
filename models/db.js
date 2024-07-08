const mongoose = require('mongoose');

const dbConnection = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/RestDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB database!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process on connection failure
  }
};

module.exports = dbConnection;

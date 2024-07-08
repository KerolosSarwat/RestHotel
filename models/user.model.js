const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // For password hashing

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
  },
});

// Hash password before saving the user
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10; // Adjust salt rounds as needed
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

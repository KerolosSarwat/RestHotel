const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  numAdults: {
    type: Number,
    required: true,
  },
  numChildren: {
    type: Number,
    required: true,
  },
  numMeals: {
    type: Number,
    required: true,
  },
  rooms: {
    type: [
      {
        roomId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Room',
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    required: true,
  },
  services: {
    type: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Confirmed', 'Pending', 'Cancelled'],
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now, // Use built-in function for creation timestamp
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Use built-in function for update timestamp
  },
});

module.exports = mongoose.model('Reservation', reservationSchema);

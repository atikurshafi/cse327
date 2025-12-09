const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['THEORY', 'LAB'],
    default: 'THEORY'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);


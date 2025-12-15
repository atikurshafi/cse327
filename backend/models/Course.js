const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['THEORY', 'LAB', 'CLUB'],
    default: 'THEORY'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);


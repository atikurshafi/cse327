const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  availability: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['FACULTY', 'CLUB'],
    default: 'FACULTY'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Instructor', instructorSchema);


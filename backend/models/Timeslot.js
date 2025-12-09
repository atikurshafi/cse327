const mongoose = require('mongoose');

const timeslotSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  dayPattern: {
    type: String,
    required: true,
    enum: ['ST', 'MW', 'RA'],
    trim: true
  },
  startTime: {
    type: String,
    required: true,
    trim: true
  },
  endTime: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timeslot', timeslotSchema);


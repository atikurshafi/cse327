const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  timeslotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timeslot',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate schedule entries
scheduleSchema.index({ courseId: 1, sectionId: 1, instructorId: 1, roomId: 1, timeslotId: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);


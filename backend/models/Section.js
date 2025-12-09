const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  sectionNumber: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique section per course
sectionSchema.index({ courseId: 1, sectionNumber: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);


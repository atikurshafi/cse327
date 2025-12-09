const Section = require('../models/Section');

// Get all sections
exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.find().populate('courseId', 'code name type').sort({ sectionNumber: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get section by ID
exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate('courseId', 'code name type');
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sections by course
exports.getSectionsByCourse = async (req, res) => {
  try {
    const sections = await Section.find({ courseId: req.params.courseId })
      .populate('courseId', 'code name type')
      .sort({ sectionNumber: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new section
exports.createSection = async (req, res) => {
  try {
    const { courseId, sectionNumber } = req.body;
    const section = new Section({ courseId, sectionNumber });
    await section.save();
    await section.populate('courseId', 'code name type');
    res.status(201).json(section);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Section already exists for this course' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Update section
exports.updateSection = async (req, res) => {
  try {
    const { courseId, sectionNumber } = req.body;
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { courseId, sectionNumber },
      { new: true, runValidators: true }
    ).populate('courseId', 'code name type');
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Section already exists for this course' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Delete section
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


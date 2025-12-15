const Instructor = require('../models/Instructor');

// Get all instructors
exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find().sort({ name: 1 });
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get instructor by ID
exports.getInstructorById = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    res.json(instructor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new instructor
exports.createInstructor = async (req, res) => {
  try {
    const { name, email, availability, type } = req.body;
    const instructor = new Instructor({ name, email, availability, type });
    await instructor.save();
    res.status(201).json(instructor);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Update instructor
exports.updateInstructor = async (req, res) => {
  try {
    const { name, email, availability, type } = req.body;
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      { name, email, availability, type },
      { new: true, runValidators: true }
    );
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    res.json(instructor);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Delete instructor
exports.deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndDelete(req.params.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    res.json({ message: 'Instructor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


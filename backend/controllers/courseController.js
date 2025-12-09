const Course = require('../models/Course');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ code: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const { code, name, type } = req.body;
    const course = new Course({ code, name, type });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Course code already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { code, name, type } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { code, name, type },
      { new: true, runValidators: true }
    );
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Course code already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


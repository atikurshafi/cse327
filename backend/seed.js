const mongoose = require('mongoose');
const Timeslot = require('./models/Timeslot');
require('./models/Instructor');
require('./models/Course');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/class-schedule';

// Sample timeslots data
const timeslots = [
  { code: 'ST1', dayPattern: 'ST', startTime: '08:00', endTime: '09:30' },
  { code: 'ST2', dayPattern: 'ST', startTime: '09:40', endTime: '11:10' },
  { code: 'ST3', dayPattern: 'ST', startTime: '11:20', endTime: '12:50' },
  { code: 'ST4', dayPattern: 'ST', startTime: '13:00', endTime: '14:30' },
  { code: 'ST5', dayPattern: 'ST', startTime: '14:40', endTime: '16:10' },
  { code: 'ST6', dayPattern: 'ST', startTime: '16:20', endTime: '17:50' },

  { code: 'MW1', dayPattern: 'MW', startTime: '08:00', endTime: '09:30' },
  { code: 'MW2', dayPattern: 'MW', startTime: '09:40', endTime: '11:10' },
  { code: 'MW3', dayPattern: 'MW', startTime: '11:20', endTime: '12:50' },
  { code: 'MW4', dayPattern: 'MW', startTime: '13:00', endTime: '14:30' },
  { code: 'MW5', dayPattern: 'MW', startTime: '14:40', endTime: '16:10' },
  { code: 'MW6', dayPattern: 'MW', startTime: '16:20', endTime: '17:50' },

  { code: 'RA1', dayPattern: 'RA', startTime: '08:00', endTime: '09:30' },
  { code: 'RA2', dayPattern: 'RA', startTime: '09:40', endTime: '11:10' },
  { code: 'RA3', dayPattern: 'RA', startTime: '11:20', endTime: '12:50' },
  { code: 'RA4', dayPattern: 'RA', startTime: '13:00', endTime: '14:30' },
  { code: 'RA5', dayPattern: 'RA', startTime: '14:40', endTime: '16:10' },
  { code: 'RA6', dayPattern: 'RA', startTime: '16:20', endTime: '17:50' },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Timeslot.deleteMany({});
    await mongoose.model('Instructor').deleteMany({});
    await mongoose.model('Course').deleteMany({});
    console.log('Cleared existing data');

    // 1. Create Timeslots
    // Regular classes (08:00 - 17:50) + Club slots (18:00 - 19:30)
    const timeslotsData = [
      // Sunday-Tuesday
      { code: 'ST1', dayPattern: 'ST', startTime: '08:00', endTime: '09:30' },
      { code: 'ST2', dayPattern: 'ST', startTime: '09:40', endTime: '11:10' },
      { code: 'ST3', dayPattern: 'ST', startTime: '11:20', endTime: '12:50' },
      { code: 'ST4', dayPattern: 'ST', startTime: '13:00', endTime: '14:30' },
      { code: 'ST5', dayPattern: 'ST', startTime: '14:40', endTime: '16:10' },
      { code: 'ST6', dayPattern: 'ST', startTime: '16:20', endTime: '17:50' },
      { code: 'ST7', dayPattern: 'ST', startTime: '18:00', endTime: '19:30' }, // Club slot

      // Monday-Wednesday
      { code: 'MW1', dayPattern: 'MW', startTime: '08:00', endTime: '09:30' },
      { code: 'MW2', dayPattern: 'MW', startTime: '09:40', endTime: '11:10' },
      { code: 'MW3', dayPattern: 'MW', startTime: '11:20', endTime: '12:50' },
      { code: 'MW4', dayPattern: 'MW', startTime: '13:00', endTime: '14:30' },
      { code: 'MW5', dayPattern: 'MW', startTime: '14:40', endTime: '16:10' },
      { code: 'MW6', dayPattern: 'MW', startTime: '16:20', endTime: '17:50' },
      { code: 'MW7', dayPattern: 'MW', startTime: '18:00', endTime: '19:30' }, // Club slot

      // Thursday-Saturday (RA) ? Assuming RA is Thursday-Saturday or similar standard
      { code: 'RA1', dayPattern: 'RA', startTime: '08:00', endTime: '09:30' },
      { code: 'RA2', dayPattern: 'RA', startTime: '09:40', endTime: '11:10' },
      { code: 'RA3', dayPattern: 'RA', startTime: '11:20', endTime: '12:50' },
      { code: 'RA4', dayPattern: 'RA', startTime: '13:00', endTime: '14:30' },
      { code: 'RA5', dayPattern: 'RA', startTime: '14:40', endTime: '16:10' },
      { code: 'RA6', dayPattern: 'RA', startTime: '16:20', endTime: '17:50' },
      { code: 'RA7', dayPattern: 'RA', startTime: '18:00', endTime: '19:30' }, // Club slot
    ];
    await Timeslot.insertMany(timeslotsData);
    console.log('Seeded timeslots');

    // 2. Create Instructors (Faculty and Clubs)
    const Instructor = mongoose.model('Instructor');
    const instructorsData = [
      { name: 'Dr. Smith', email: 'smith@univ.edu', type: 'FACULTY' },
      { name: 'Prof. Johnson', email: 'johnson@univ.edu', type: 'FACULTY' },
      // Clubs acting as Instructors
      { name: 'Computer Club', email: 'cc@univ.edu', type: 'CLUB' },
      { name: 'Debating Club', email: 'dc@univ.edu', type: 'CLUB' },
      { name: 'Cultural Club', email: 'cultural@univ.edu', type: 'CLUB' },
    ];
    await Instructor.insertMany(instructorsData);
    console.log('Seeded instructors and clubs');

    // 3. Create Courses (Regular and Club Activities)
    const Course = mongoose.model('Course');
    const coursesData = [
      { code: 'CSE101', name: 'Intro to CS', type: 'THEORY' },
      { code: 'CSE101L', name: 'Intro to CS Lab', type: 'LAB' },
      // Club Activities
      { code: 'CLUB_MTG', name: 'General Meeting', type: 'CLUB' },
      { code: 'WORKSHOP', name: 'Tech Workshop', type: 'CLUB' },
    ];
    await Course.insertMany(coursesData);
    console.log('Seeded courses and activities');

    await mongoose.connection.close();
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();


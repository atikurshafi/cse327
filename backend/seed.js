const mongoose = require('mongoose');
const Timeslot = require('./models/Timeslot');
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

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing timeslots
    await Timeslot.deleteMany({});
    console.log('Cleared existing timeslots');

    // Insert sample timeslots
    await Timeslot.insertMany(timeslots);
    console.log(`Seeded ${timeslots.length} timeslots`);

    // Display seeded data
    const seeded = await Timeslot.find().sort({ code: 1 });
    console.log('\nSeeded timeslots:');
    seeded.forEach(ts => {
      console.log(`  ${ts.code} - ${ts.dayPattern} (${ts.startTime} - ${ts.endTime})`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();


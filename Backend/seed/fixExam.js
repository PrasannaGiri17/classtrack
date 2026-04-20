const mongoose = require('mongoose');
async function run() {
  await mongoose.connect('mongodb://localhost:27017/school');
  await mongoose.connection.collection('exams').updateOne(
    { schoolId: 2 },
    { $set: { 
        academicYear: 2083, 
        'config.termDates': { 
          'First Term': ['2026-06-30', '2026-07-07'], 
          'Second Term': ['2027-04-12', '2027-04-19'] 
        } 
      } 
    }
  );
  process.exit(0);
}
run();

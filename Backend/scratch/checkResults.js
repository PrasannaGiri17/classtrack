const mongoose = require('mongoose');
const Result = require('../models/Result');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/school');
  const results = await Result.find({ studentId: '69bebcd2f90e172ec1ff26f0' }).sort({ academicYear: -1 });
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

run();

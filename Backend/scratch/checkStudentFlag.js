const mongoose = require('mongoose');
const { StudentFlag } = require('../models/StudentFlag');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/school');
  const flag = await StudentFlag.findOne({ studentId: '69bebcd2f90e172ec1ff26f0' }).sort({ generatedAt: -1 });
  console.log(JSON.stringify(flag, null, 2));
  process.exit(0);
}

run();

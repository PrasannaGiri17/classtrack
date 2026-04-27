const mongoose = require('mongoose');
const Holiday = mongoose.model('Holiday', new mongoose.Schema({ nepali_date: String, gregorian_date: String }));

async function run() {
  await mongoose.connect('mongodb://localhost:27017/school');
  const holidays = await Holiday.find({ 
    gregorian_date: { $gte: '2026-04-14', $lte: '2026-04-27' } 
  });
  console.log(JSON.stringify(holidays, null, 2));
  process.exit(0);
}

run();

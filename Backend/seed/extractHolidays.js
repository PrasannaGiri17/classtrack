const fs = require('fs');
const { MongoClient } = require('mongodb');

const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";

async function extractHolidays(filePath, db) {
  try {
    console.log(`📂 Processing ${filePath}...`);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    const holidays = [];
    for (const [gregorianDate, dayObj] of Object.entries(data)) {
      if (dayObj.is_public_holiday && dayObj.events && dayObj.events.length > 0) {
        // Normalize "2025/4/14" to "2025-04-14"
        const parts = gregorianDate.replace(/\//g, '-').split('-');
        const normalizedDate = parts[0] + '-' + parts[1].padStart(2, '0') + '-' + parts[2].padStart(2, '0');

        holidays.push({
          gregorian_date: normalizedDate,
          nepali_date: dayObj.nepali_date,
          title: dayObj.events[0],        // Main holiday title
          titles: dayObj.events,          // All titles array
          created_at: new Date()
        });
      }
    }

    if (holidays.length > 0) {
      await db.collection('holiday').insertMany(holidays, { ordered: false });
      console.log(`✅ Inserted ${holidays.length} holidays from ${filePath}`);
    } else {
      console.log(`ℹ️ No public holidays in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error in ${filePath}:`, error.message);
  }
}

async function main() {
  const client = new MongoClient(mongoURI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB (school DB)');
    const db = client.db('school');
    
    // Clear existing data (optional)
    // await db.collection('holiday').deleteMany({});
    // console.log('🗑️ Cleared existing holidays');
    
    // Process files
    await extractHolidays('artifact-2082.json', db);
    await extractHolidays('artifact-2083.json', db);
    
    // Final count
    const count = await db.collection('holiday').countDocuments();
    console.log(`🎉 Total holidays stored: ${count}`);
    console.log('📍 Location: school.holiday collection');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

main();

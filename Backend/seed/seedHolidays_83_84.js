const mongoose = require('mongoose');
const Holiday = require('../models/Holiday');

const mongoURI = "mongodb://localhost:27017/school";

const MAJOR_2083_HOLIDAYS = [
  { ad: "2026-04-14", bs: "2083-01-01", title: "New Year / नव वर्ष" },
  { ad: "2026-05-01", bs: "2083-01-18", title: "May Day / मजदूर दिवस" },
  { ad: "2026-05-01", bs: "2083-01-18", title: "Buddha Jayanti / बुद्ध जयन्ती" }, // Sometimes shifts
  { ad: "2026-05-29", bs: "2083-02-15", title: "Republic Day / गणतन्त्र दिवस" },
  { ad: "2026-08-28", bs: "2083-05-12", title: "Janai Purnima / जनै पूर्णिमा" },
  { ad: "2026-08-29", bs: "2083-05-13", title: "Gai Jatra / गाई जात्रा" },
  { ad: "2026-09-04", bs: "2083-05-19", title: "Krishna Janmashtami / कृष्ण जन्माष्टमी" },
  { ad: "2026-09-19", bs: "2083-06-03", title: "Constitution Day / संविधान दिवस" },
  { ad: "2026-10-10", bs: "2083-06-24", title: "Ghatasthapana / घटस्थापना" },
  { ad: "2026-10-17", bs: "2083-06-31", title: "Fulpati / फूलपाती" },
  { ad: "2026-10-18", bs: "2083-07-01", title: "Maha Ashtami / महा अष्टमी" },
  { ad: "2026-10-19", bs: "2083-07-02", title: "Maha Navami / महा नवमी" },
  { ad: "2026-10-20", bs: "2083-07-03", title: "Vijaya Dashami / विजया दशमी" },
  { ad: "2026-10-21", bs: "2083-07-04", title: "Ekadashi / दशैं बिदा" },
  { ad: "2026-10-22", bs: "2083-07-05", title: "Dwadashi / दशैं बिदा" },
  { ad: "2026-11-07", bs: "2083-07-21", title: "Laxmi Puja / लक्ष्मी पूजा" },
  { ad: "2026-11-08", bs: "2083-07-22", title: "Gai Puja / गाई पूजा" },
  { ad: "2026-11-09", bs: "2083-07-23", title: "Bhai Tika / भाई टीका" },
  { ad: "2026-11-15", bs: "2083-07-29", title: "Chhath Puja / छठ पूजा" },
  { ad: "2026-12-25", bs: "2083-09-10", title: "Christmas Day / क्रिसमस डे" },
  { ad: "2027-01-11", bs: "2083-09-27", title: "Prithvi Jayanti / पृथ्वी जयन्ती" },
  { ad: "2027-01-15", bs: "2083-10-01", title: "Maghe Sankranti / माघे संक्रान्ति" },
  { ad: "2027-01-29", bs: "2083-10-15", title: "Martyr's Day / शहीद दिवस" },
  { ad: "2027-02-19", bs: "2083-11-07", title: "Democracy Day / प्रजातन्त्र दिवस" },
  { ad: "2027-03-06", bs: "2083-11-22", title: "Maha Shivaratri / महाशिवरात्रि" },
  { ad: "2027-03-08", bs: "2083-11-24", title: "Women's Day / अन्तर्राष्ट्रिय नारी दिवस" },
  { ad: "2027-03-22", bs: "2083-12-08", title: "Holi Festival / फगु पूर्णिमा (Hilly)" },
  { ad: "2027-03-23", bs: "2083-12-09", title: "Holi Festival / फगु पूर्णिमा (Terai)" }
];

const MAJOR_2084_HOLIDAYS = [
  { ad: "2027-04-14", bs: "2084-01-01", title: "New Year / नव वर्ष" }
];

async function seed() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to local database...");

    // Step 0: Remove schoolId from ALL holidays so they are global
    await Holiday.updateMany({}, { $unset: { schoolId: "" } });
    console.log("Globalized existing holidays by removing schoolId...");

    const allHolidays = [...MAJOR_2083_HOLIDAYS, ...MAJOR_2084_HOLIDAYS];
    let count = 0;

    for (const h of allHolidays) {
      await Holiday.findOneAndUpdate(
        { nepali_date: h.bs }, 
        {
          gregorian_date: h.ad,
          nepali_date: h.bs,
          title: h.title,
          titles: [h.title],
          created_at: new Date()
        },
        { upsert: true, new: true }
      );
      count++;
    }

    // Now attempt to seed from the JSON artifacts as well (for any specific user additions)
    const fs = require('fs');
    const path = require('path');
    const artifacts = ['artifact-2083.json', 'artifact-2084.json'];
    
    for (const file of artifacts) {
      const p = path.join(__dirname, file);
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        for (const [ad, details] of Object.entries(data)) {
          if (details.is_public_holiday || (details.events && details.events.length > 0)) {
            await Holiday.findOneAndUpdate(
              { nepali_date: details.nepali_date.replace(/\//g, '-') },
              {
                gregorian_date: ad.replace(/\//g, '-'),
                nepali_date: details.nepali_date.replace(/\//g, '-'),
                title: details.events?.[0] || 'Public Holiday',
                titles: details.events,
                created_at: new Date()
              },
              { upsert: true }
            );
            count++;
          }
        }
      }
    }

    console.log(`✅ Successfully seeded ${count} holidays for 2083 and 2084.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
}

seed();

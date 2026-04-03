const fs = require('fs');
const path = require('path');

const files = ['artifact-2083.json', 'artifact-2084.json'];

for (const filename of files) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) continue;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let totalDays = Object.keys(data).length;
  let holidays = 0;
  let eventsCount = 0;
  let tithiCount = 0;

  for (const day of Object.values(data)) {
    if (day.is_public_holiday) holidays++;
    if (day.events && day.events.length > 0) eventsCount++;
    if (day.tithi) tithiCount++;
  }

  console.log(`- ${filename}: Total Days: ${totalDays}, Public Holidays: ${holidays}, Days with events: ${eventsCount}, Days with Tithi: ${tithiCount}`);
}

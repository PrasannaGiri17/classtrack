const mongoose = require('mongoose');
const ClassroomAttendance = require('../models/ClassroomAttendance');
const Holiday = require('../models/Holiday');

async function debug() {
  await mongoose.connect('mongodb://localhost:27017/school');
  const studentId = '69bebcd2f90e172ec1ff26f0';
  const schoolId = 2;
  const sectionId = '69be848d832755868b776c4a';
  const academicYear = 2083;
  const startAD = new Date('2026-04-15'); // Baisakh 2
  const endAD = new Date('2026-04-20');

  const holidayDocs = await Holiday.find({ nepali_date: { $regex: `^${academicYear}-` } }).lean();
  const holidaySet = new Set(holidayDocs.map(h => h.gregorian_date));
  const bsToAdMap = {};
  holidayDocs.forEach(h => { bsToAdMap[h.nepali_date] = h.gregorian_date; });

  const baisakh1BS = `${academicYear}-01-01`;
  const baisakh1ADStr = bsToAdMap[baisakh1BS] || `${academicYear - 57}-04-14`;
  const baisakh1AD = new Date(baisakh1ADStr);
  baisakh1AD.setHours(0,0,0,0);

  const attendanceDocs = await ClassroomAttendance.find({ schoolId, sectionId, year: academicYear }).lean();
  console.log("Attendance Docs Found:", attendanceDocs.length);

  const attendanceMap = {};
  attendanceDocs.forEach(doc => {
    const studentData = doc.attendanceData.find(d => d.studentId.toString() === studentId.toString());
    console.log(`Month: ${doc.month}, Student Found: ${!!studentData}`);
    if (studentData && studentData.dailyStatus) {
      if (!attendanceMap[doc.month]) attendanceMap[doc.month] = {};
      const statusObj = studentData.dailyStatus instanceof Map ? Object.fromEntries(studentData.dailyStatus) : studentData.dailyStatus;
      console.log(`DailyStatus Keys:`, Object.keys(statusObj));
      Object.assign(attendanceMap[doc.month], statusObj);
    }
  });

  const MONTH_NAMES = [null, 'Baisakh', 'Jestha', 'Ashad', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
  
  function adToBS(adDate, b1) {
    const diffTime = adDate.getTime() - b1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const lengths = [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30]; 
    let m = 1, d = diffDays + 1;
    for (let i = 0; i < lengths.length; i++) {
        if (d <= lengths[i]) break;
        d -= lengths[i]; m++;
    }
    return { m, d };
  }

  let working = 0, present = 0;
  let cur = new Date(startAD);
  cur.setHours(0,0,0,0);
  const endLimit = new Date(endAD);
  endLimit.setHours(0,0,0,0);

  while(cur <= endLimit) {
    const dateStr = cur.toISOString().split('T')[0];
    const isSat = cur.getDay() === 6;
    const isHoliday = holidaySet.has(dateStr);
    if (!isSat && !isHoliday) {
      working++;
      const bsDate = adToBS(cur, baisakh1AD);
      const monthName = MONTH_NAMES[bsDate.m];
      const status = attendanceMap[monthName]?.[String(bsDate.d)];
      console.log(`Date: ${dateStr}, BS: ${bsDate.m}/${bsDate.d}, Month: ${monthName}, Status: ${status}`);
      if (status === 'P' || status === 'L') present++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  console.log(`Working: ${working}, Present: ${present}`);
  process.exit(0);
}
debug();

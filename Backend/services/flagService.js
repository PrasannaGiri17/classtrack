// services/flagService.js
const ClassroomAttendance = require('../models/ClassroomAttendance');
const Result = require('../models/Result');
const { StudentFlag, resolveLastResultBasis, upsertStudentFlag } = require('../models/StudentFlag');
const Student = require('../models/studentModel');
const { Grade } = require('../models/School');
const Holiday = require('../models/Holiday');
const Exam = require('../models/Exam');

const MONTH_MAP = {
  'Baisakh': 1, 'Jestha': 2, 'Ashad': 3, 'Shrawan': 4, 'Bhadra': 5, 'Ashwin': 6,
  'Kartik': 7, 'Mangsir': 8, 'Poush': 9, 'Magh': 10, 'Falgun': 11, 'Chaitra': 12
};
const MONTH_NAMES = [
  null, 'Baisakh', 'Jestha', 'Ashad', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

/**
 * Main service function: calculate and save flags for all active students.
 */
async function calculateAndSaveFlags(schoolId) {
  const summary = { processed: 0, errors: [] };

  try {
    const examDoc = await Exam.findOne({ 
      schoolId, 
      'config.termDates': { $exists: true, $ne: {} } 
    }).sort({ academicYear: -1 }).lean();
    if (!examDoc) throw new Error(`No exam config found for schoolId ${schoolId}`);

    const academicYear = examDoc.academicYear || 2083;
    const termDates = examDoc.config?.termDates || {};
    
    // Sort and filter non-mid terms
    // termDates format: { "First Term": ["2026-08-01", "2026-08-10"], ... }
    const validTerms = Object.keys(termDates)
      .filter(t => !t.toLowerCase().includes('mid'))
      .sort((a, b) => {
        const lastA = [...termDates[a]].sort().reverse()[0];
        const lastB = [...termDates[b]].sort().reverse()[0];
        return lastA.localeCompare(lastB);
      });

    if (validTerms.length === 0) throw new Error("No non-mid terms defined in exam config.");

    // Load Holidays for the year for quick exclusion
    const holidayDocs = await Holiday.find({
      nepali_date: { $regex: `^${academicYear}-` }
    }).lean();
    const holidaySet = new Set(holidayDocs.map(h => h.gregorian_date));
    const bsToAdMap = {};
    holidayDocs.forEach(h => { bsToAdMap[h.nepali_date] = h.gregorian_date; });

    // Academic Year Start Anchor: Baisakh 1
    const baisakh1BS = `${academicYear}-01-01`;
    const baisakh1AD = bsToAdMap[baisakh1BS] || `${academicYear - 57}-04-14`;
    const startDate = new Date(baisakh1AD);
    startDate.setDate(startDate.getDate() + 1); // Start range from Baisakh 2

    // Build Term Intervals (AD dates)
    const termIntervals = [];
    let currentStart = new Date(startDate);
    currentStart.setHours(0, 0, 0, 0);

    for (const term of validTerms) {
      const dates = [...termDates[term]].sort();
      const endADStr = dates[dates.length - 1]; 
      const [ey, em, ed] = endADStr.split('-').map(Number);
      const endDate = new Date(ey, em - 1, ed);
      endDate.setHours(0, 0, 0, 0);
      
      termIntervals.push({
        term,
        start: new Date(currentStart),
        end: new Date(endDate)
      });
      
      // Next term starts the day AFTER this one ends
      currentStart = new Date(endDate);
      currentStart.setDate(currentStart.getDate() + 1);
      currentStart.setHours(0, 0, 0, 0);
    }

    // Cache grade subject counts
    const gradesData = await Grade.find({ schoolId }).lean();
    const gradeSubjectCountMap = {};
    gradesData.forEach(g => {
      gradeSubjectCountMap[g._id.toString()] = g.subjects?.length || 0;
    });

    const students = await Student.find({ schoolId, status: 'active' }).lean();

    for (const student of students) {
      try {
        const results = await Result.find({ studentId: student._id, schoolId }).lean();
        const expected = gradeSubjectCountMap[student.gradeId?.toString()] || 0;
        
        const basisResult = resolveLastResultBasis(results, expected);
        if (!basisResult) {
          summary.processed++;
          continue;
        }

        // Find relevant interval
        const interval = termIntervals.find(i => i.term === basisResult.term);
        if (!interval) {
          summary.processed++;
          continue;
        }

        // Calculate Precise Attendance within Interval
        const { attendancePct, count } = await calculatePreciseAttendance(
          student._id,
          schoolId,
          student.sectionId,
          interval.start,
          interval.end,
          holidaySet,
          academicYear,
          bsToAdMap
        );

        // Academic Percentage: Already provided in basisResult.summary.percentage 
        // as per the new rules in StudentFlag model helpers.

        // Upsert Flag
        const updatedFlag = await upsertStudentFlag({
          schoolId,
          student,
          result: basisResult,
          attendancePct,
          attendanceMonths: [`${interval.term} range`]
        });

        // Update Student master flag
        if (updatedFlag) {
          await Student.findByIdAndUpdate(student._id, { flag: updatedFlag.flagColor });
        }

        summary.processed++;
      } catch (studentErr) {
        console.error(`Flag error for student ${student._id}:`, studentErr);
        summary.errors.push({ studentId: student._id, error: studentErr.message });
      }
    }

  } catch (err) {
    console.error('calculateAndSaveFlags global error:', err);
    throw err;
  }

  return summary;
}

/**
 * Calculates attendance by iterating through working days in AD range
 * and fetching the corresponding daily status from BS ClassroomAttendance.
 */
async function calculatePreciseAttendance(studentId, schoolId, sectionId, startAD, endAD, holidaySet, academicYear, bsToAdMap) {
  let workingDaysCount = 0;
  let presentDaysCount = 0;

  // Pre-fetch all attendance for this section/year to avoid N queries in loop
  const attendanceDocs = await ClassroomAttendance.find({
    schoolId,
    sectionId,
    year: academicYear
  }).lean();

  // Map into a quick lookup: attendanceMap[monthName][dayNumber] = status
  const attendanceMap = {};
  attendanceDocs.forEach(doc => {
    const studentData = doc.attendanceData.find(d => d.studentId.toString() === studentId.toString());
    if (studentData && studentData.dailyStatus) {
      if (!attendanceMap[doc.month]) attendanceMap[doc.month] = {};
      // studentData.dailyStatus is a Map, convert to plain object if necessary or use .get
      const statusObj = studentData.dailyStatus instanceof Map ? Object.fromEntries(studentData.dailyStatus) : studentData.dailyStatus;
      Object.assign(attendanceMap[doc.month], statusObj);
    }
  });

  // Construct AD -> BS Day/Month mapper for the range
  // Anchor on Baisakh 1 of the academic year
  const baisakh1BS = `${academicYear}-01-01`;
  const baisakh1ADStr = bsToAdMap[baisakh1BS] || `${academicYear - 57}-04-14`;
  const [bYear, bMonth, bDay] = baisakh1ADStr.split('-').map(Number);
  const baisakh1AD = new Date(bYear, bMonth - 1, bDay);
  baisakh1AD.setHours(0, 0, 0, 0);

  // Iterating Day by Day
  let cur = new Date(startAD);
  cur.setHours(0, 0, 0, 0);
  const endLimit = new Date(endAD);
  endLimit.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (cur <= endLimit && cur <= today) {
    const dateStr = cur.toISOString().split('T')[0];
    const isSat = cur.getDay() === 6;
    const isHoliday = holidaySet.has(dateStr);

    if (!isSat && !isHoliday) {
      workingDaysCount++;
      
      // BS Month/Day lookup
      const bsDate = adToBS(cur, baisakh1AD); 
      const monthName = MONTH_NAMES[bsDate.m];
      const status = attendanceMap[monthName]?.[String(bsDate.d)];

      if (status === 'P' || status === 'L') {
        presentDaysCount++;
      }
    }
    cur.setDate(cur.getDate() + 1);
  }

  const attendancePct = workingDaysCount === 0 ? 0 : (presentDaysCount / workingDaysCount) * 100;
  return { attendancePct, count: workingDaysCount };
}

/**
 * Rough but stable AD to BS conversion based on Baisakh 1 anchor.
 * This assumes standard local calendar month lengths if possible.
 * For simplistic logic, we use standard BS month lengths:
 * Baisakh (31), Jestha (31/32), Ashad (31/32)... 
 * However, without a table, we'll just use a day-offset calculation.
 */
function adToBS(adDate, baisakh1AD) {
  const d1 = new Date(adDate.getFullYear(), adDate.getMonth(), adDate.getDate());
  const d2 = new Date(baisakh1AD.getFullYear(), baisakh1AD.getMonth(), baisakh1AD.getDate());
  const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
  
  // BS month lengths table (rough average for Nepali calendar)
  const lengths = [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30]; 
  
  let m = 1;
  let d = diffDays + 1;
  
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i]) break;
    d -= lengths[i];
    m++;
  }
  
  return { m, d };
}

module.exports = {
  calculateAndSaveFlags,
};

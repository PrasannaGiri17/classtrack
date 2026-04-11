// services/flagService.js
const ClassroomAttendance = require('../models/ClassroomAttendance');
const Result = require('../models/Result');
const StudentFlag = require('../models/StudentFlag');
const Student = require('../models/studentModel');

const NEPALI_MONTHS = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashoj',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

// Converts a Nepali year + month name to a sortable numeric key
function monthKey(year, monthName) {
  const idx = NEPALI_MONTHS.indexOf(monthName);
  if (idx === -1) return year * 100; // unknown month, put at start
  return year * 100 + (idx + 1);    // 1-indexed
}

// Given termDates config and a term name, extracts the last date of that term
function getTermLastDate(termDates, termName) {
  const dates = termDates?.[termName];
  if (!Array.isArray(dates) || dates.length === 0) return null;
  // Sort descending and return the latest date string
  return [...dates].sort().reverse()[0];
}

// Parse an AD date string "YYYY-MM-DD" into { year, month, day }
function parseDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
}

/**
 * Calculate attendance percentage for a student over a range defined by
 * a set of Nepali months (e.g., ["Baisakh-2082", "Jestha-2082"])
 * monthsToInclude: array of { year: Number, month: String }
 */
async function getAttendancePct(studentId, schoolId, sectionId, monthsToInclude) {
  try {
    if (!monthsToInclude || monthsToInclude.length === 0) return 0;

    let totalDays = 0;
    let presentDays = 0;

    for (const { year, month } of monthsToInclude) {
      const attDoc = await ClassroomAttendance.findOne({
        schoolId,
        sectionId,
        year,
        month,
      });
      if (!attDoc) continue;

      const studentRecord = attDoc.attendanceData.find(
        (r) => r.studentId.toString() === studentId.toString()
      );
      if (!studentRecord || !studentRecord.dailyStatus) continue;

      // dailyStatus is a Mongoose Map
      const statusMap = studentRecord.dailyStatus instanceof Map
        ? studentRecord.dailyStatus
        : new Map(Object.entries(studentRecord.dailyStatus));

      for (const [, status] of statusMap) {
        if (status === 'P' || status === 'A') {
          totalDays++;
          if (status === 'P') presentDays++;
        }
      }
    }

    if (totalDays === 0) return 0;
    return Math.round((presentDays / totalDays) * 100 * 100) / 100; // 2 decimal places
  } catch (err) {
    console.error('getAttendancePct error:', err);
    return 0;
  }
}

/**
 * Fetch mid-term and final-term scores (percentage) for a student
 */
async function getTermScores(studentId, schoolId, midTermName, finalTermName) {
  try {
    const results = await Result.find({
      studentId,
      schoolId,
      term: { $in: [midTermName, finalTermName].filter(Boolean) },
    }).lean();

    let midTermScore = 0;
    let finalTermScore = 0;

    for (const r of results) {
      const pct = r.summary?.percentage ?? 0;
      if (r.term === midTermName) midTermScore = pct;
      if (r.term === finalTermName) finalTermScore = pct;
    }

    return { midTermScore, finalTermScore };
  } catch (err) {
    console.error('getTermScores error:', err);
    return { midTermScore: 0, finalTermScore: 0 };
  }
}

/**
 * Compute flag color and points from attendance % and weighted exam score
 */
function computeFlag(attendancePct, weightedScore) {
  const attendancePoints = attendancePct >= 85 ? 2 : attendancePct >= 70 ? 1 : 0;
  const examPoints = weightedScore >= 60 ? 2 : weightedScore >= 40 ? 1 : 0;
  const totalPoints = attendancePoints + examPoints;

  let flagColor;
  if (totalPoints >= 4) flagColor = 'green';
  else if (totalPoints >= 2) flagColor = 'amber';
  else flagColor = 'red';

  return { flagColor, attendancePoints, examPoints, totalPoints };
}

/**
 * Determine which Nepali year+month combinations fall within a term date range.
 * startAD / endAD: AD date strings "YYYY-MM-DD"
 * We iterate from the academicYear start (Baisakh) up to the endAD month.
 * For simplicity we use the attendance docs that exist in the DB for that section.
 */
async function getMonthsInRange(schoolId, sectionId, academicYear, startKeyExclusive, endKey) {
  // Fetch all attendance docs for this section & year
  const docs = await ClassroomAttendance.find({
    schoolId,
    sectionId,
    year: academicYear,
  })
    .select('year month')
    .lean();

  const result = [];
  for (const doc of docs) {
    const key = monthKey(doc.year, doc.month);
    if (key > startKeyExclusive && key <= endKey) {
      result.push({ year: doc.year, month: doc.month });
    }
  }
  return result;
}

/**
 * Build term pairs dynamically based on termsCount.
 * Returns array like:
 *  For 2 terms: [
 *    { pairName: "Term1", midTerm: "First Mid Term",  finalTerm: "First Term"  },
 *    { pairName: "Term2", midTerm: "Second Mid Term", finalTerm: "Second Term" },
 *  ]
 *  For 3 terms the pattern continues with Third Mid Term / Third Term, etc.
 */
function buildTermPairs(termsCount, includeMidTerm) {
  const ordinals = ['First', 'Second', 'Third', 'Fourth'];
  const pairs = [];
  for (let i = 0; i < termsCount; i++) {
    const ord = ordinals[i] || `Term${i + 1}`;
    pairs.push({
      pairName: `Term${i + 1}`,
      midTerm: includeMidTerm ? `${ord} Mid Term` : null,
      finalTerm: `${ord} Term`,
    });
  }
  return pairs;
}

/**
 * Main service function: calculate and save flags for all active students in a school
 */
async function calculateAndSaveFlags(schoolId, academicYear) {
  // 1. Fetch exam config
  const Exam = require('../models/Exam');
  const examDoc = await Exam.findOne({ schoolId }).lean();
  if (!examDoc) throw new Error(`No exam config found for schoolId ${schoolId}`);

  const termsCount = examDoc.config?.termsCount || 2;
  const includeMidTerm = examDoc.config?.includeMidTerm !== false;
  const termDates = examDoc.config?.termDates || {};

  const termPairs = buildTermPairs(termsCount, includeMidTerm);

  // 2. Build sortable end-of-term keys for attendance range slicing
  //    We parse the last date of each final term to get an approximate Nepali month key.
  //    Since termDates stores AD dates, we convert month index by looking at AD month.
  //    Nepali year typically maps: Baisakh=Apr, Jestha=May, … so AD month m → Nepali month (m+8) mod 12.
  //    We use a simplified mapping: just use the AD date's month index as a proxy for ordering.
  function adDateToMonthKey(adDateStr, nepYear) {
    const parsed = parseDate(adDateStr);
    if (!parsed) return nepYear * 100;
    // Rough Nepali month index: AD April (4) ≈ Baisakh (1)
    const nepMonthIdx = ((parsed.month - 4 + 12) % 12) + 1; // 1-12
    return nepYear * 100 + nepMonthIdx;
  }

  // 3. Fetch all active students
  const students = await Student.find({ schoolId, status: 'active' })
    .select('_id gradeId sectionId flag')
    .lean();

  const summary = { processed: 0, errors: [] };

  for (const student of students) {
    try {
      let prevEndKey = academicYear * 100; // before Baisakh of that year

      for (const pair of termPairs) {
        const finalTermLastDate = getTermLastDate(termDates, pair.finalTerm);
        const endKey = finalTermLastDate
          ? adDateToMonthKey(finalTermLastDate, academicYear)
          : academicYear * 100 + 12; // fallback to Chaitra

        // Attendance months in this term's range
        const monthsForTerm = await getMonthsInRange(
          schoolId,
          student.sectionId,
          academicYear,
          prevEndKey,
          endKey
        );

        // Attendance %
        const attendancePct = await getAttendancePct(
          student._id,
          schoolId,
          student.sectionId,
          monthsForTerm
        );

        // Exam scores
        const { midTermScore, finalTermScore } = await getTermScores(
          student._id,
          schoolId,
          pair.midTerm,
          pair.finalTerm
        );

        // Weighted score
        let weightedScore;
        if (pair.midTerm) {
          weightedScore = midTermScore * 0.20 + finalTermScore * 0.80;
        } else {
          weightedScore = finalTermScore;
        }

        // Flag computation
        const { flagColor, attendancePoints, examPoints, totalPoints } = computeFlag(
          attendancePct,
          weightedScore
        );

        // Upsert flag record
        await StudentFlag.findOneAndUpdate(
          {
            studentId: student._id,
            schoolId,
            academicYear,
            termPair: pair.pairName,
          },
          {
            $set: {
              gradeId: student.gradeId,
              sectionId: student.sectionId,
              attendancePct,
              attendanceMonthsIncluded: monthsForTerm.map((m) => `${m.month}-${m.year}`),
              midTermScore: midTermScore || 0,
              finalTermScore: finalTermScore || 0,
              weightedScore,
              attendancePoints,
              examPoints,
              totalPoints,
              flagColor,
              generatedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );

        // Update Student.flag with latest term's flag
        await Student.findByIdAndUpdate(student._id, { flag: flagColor });

        prevEndKey = endKey;
      }

      summary.processed++;
    } catch (err) {
      console.error(`Flag error for student ${student._id}:`, err.message);
      summary.errors.push({ studentId: student._id, error: err.message });
    }
  }

  return summary;
}

module.exports = {
  calculateAndSaveFlags,
  getAttendancePct,
  getTermScores,
  computeFlag,
};

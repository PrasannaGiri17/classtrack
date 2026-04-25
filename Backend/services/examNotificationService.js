const Exam = require('../models/Exam');
const SchoolNotification = require('../models/SchoolNotification');
const { School } = require('../models/School');

/**
 * Checks for exam cycles starting tomorrow and sends notifications to relevant schools.
 * This runs periodically to ensure students and teachers are notified 24 hours in advance.
 */
const checkAndSendExamNotifications = async () => {
    try {
        // Calculate date for tomorrow (24 hours from now)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);
        
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // 1. Find all exam documents
        const exams = await Exam.find();

        for (const examDoc of exams) {
            const schoolId = examDoc.schoolId;
            const academicYear = examDoc.academicYear;
            
            // We want to avoid duplicate notifications for the same term/year/school
            // So we'll track which terms we've already identified as starting tomorrow for this school
            const termsStartingTomorrow = new Set();
            
            if (examDoc.schedules && examDoc.schedules.length > 0) {
                examDoc.schedules.forEach(schedule => {
                    if (schedule.entries && schedule.entries.length > 0) {
                        // Find the earliest date in this schedule
                        const sortedDates = schedule.entries
                            .filter(e => e.date)
                            .map(e => new Date(e.date))
                            .sort((a, b) => a - b);
                        
                        if (sortedDates.length > 0) {
                            const termStartDate = sortedDates[0];
                            
                            // Check if the term's first exam is tomorrow
                            if (termStartDate >= tomorrow && termStartDate <= tomorrowEnd) {
                                termsStartingTomorrow.add(schedule.term);
                            }
                        }
                    }
                });
            }

            // 2. Dispatch notifications for each identified term
            for (const term of termsStartingTomorrow) {
                await createExamNotification(schoolId, term, academicYear, tomorrowStr);
            }
        }
    } catch (error) {
        console.error("Critical error in exam notification service:", error);
    }
};

/**
 * Creates a notification record for a specific school and exam term.
 * Includes a duplicate check to prevent spamming users.
 */
const createExamNotification = async (schoolId, term, year, dateStr) => {
    try {
        const title = `Exam Alert: ${term} Begins Tomorrow`;
        const message = `Friendly reminder: The ${term} (${year}) examination cycle officially begins tomorrow, ${dateStr}. Please check the Academic Calendar for your specific subject routine and room assignments. Good luck to all students!`;
        
        // Prevent duplicate notifications for the same term/year/school starting on this date
        const existingNotification = await SchoolNotification.findOne({
            schoolId,
            title,
            createdAt: { 
                $gte: new Date(new Date().setHours(0,0,0,0)), 
                $lte: new Date(new Date().setHours(23,59,59,999)) 
            }
        });

        if (!existingNotification) {
            await SchoolNotification.create({
                schoolId,
                title,
                message,
                sender: "SYSTEM",
                receiver: "all",
                receiverId: null
            });
            console.log(`[Exam Notification Service] Dispatched exam start notice for "${term}" to School ID: ${schoolId}`);
        }
    } catch (err) {
        console.error(`Failed to dispatch exam notification for school ${schoolId}:`, err);
    }
};

module.exports = { checkAndSendExamNotifications };

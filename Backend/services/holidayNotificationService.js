const Holiday = require('../models/Holiday');
const SchoolNotification = require('../models/SchoolNotification');
const { School } = require('../models/School');
const Event = require('../models/Event');

/**
 * Checks for holidays occurring tomorrow and sends notifications to relevant schools.
 * This runs periodically to ensure users are notified 24 hours in advance.
 */
const checkAndSendHolidayNotifications = async () => {
    try {
        // Calculate date for tomorrow (24 hours from now)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        // Define date range for Event query (start of tomorrow to end of tomorrow)
        const tomorrowStart = new Date(tomorrow);
        tomorrowStart.setHours(0, 0, 0, 0);
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);

        // 1. Find standard holidays occurring on the target date
        const holidays = await Holiday.find({ gregorian_date: tomorrowStr });

        // 2. Find school-specific holiday events occurring tomorrow
        const customHolidays = await Event.find({
            type: 'HOLIDAY',
            startDate: { $gte: tomorrowStart, $lte: tomorrowEnd }
        });

        // Process standard holidays
        if (holidays && holidays.length > 0) {
            for (const holiday of holidays) {
                if (!holiday.schoolId) {
                    // Global holiday - notify all schools
                    const schools = await School.find({ status: 'Active' });
                    for (const school of schools) {
                        await createHolidayNotification(school.schoolId, holiday);
                    }
                } else {
                    // School-specific holiday
                    await createHolidayNotification(holiday.schoolId, holiday);
                }
            }
        }

        // Process custom events marked as holidays
        if (customHolidays && customHolidays.length > 0) {
            for (const event of customHolidays) {
                // Map event to holiday format for the notification helper
                await createHolidayNotification(event.schoolId, {
                    title: event.title,
                    gregorian_date: tomorrowStr
                });
            }
        }
    } catch (error) {
        console.error("Critical error in holiday notification service:", error);
    }
};

/**
 * Creates a notification record for a specific school and holiday.
 * Includes a duplicate check to prevent spamming users.
 */
const createHolidayNotification = async (schoolId, holiday) => {
    try {
        const title = `Holiday Reminder: ${holiday.title}`;
        const message = `Friendly reminder: Tomorrow (${holiday.gregorian_date}) is a public holiday for ${holiday.title}. All school activities and classes are suspended for the day. Enjoy your holiday!`;
        
        // Prevent duplicate notifications for the same holiday/school
        // We check for the combination of schoolId, title, and the specific date string in message
        const existingNotification = await SchoolNotification.findOne({
            schoolId,
            title,
            message: { $regex: holiday.gregorian_date }
        });

        if (!existingNotification) {
            await SchoolNotification.create({
                schoolId,
                title,
                message,
                sender: "Academic Administration",
                receiver: "all",
                receiverId: null
            });
            console.log(`[Notification Service] Dispatched holiday notice for "${holiday.title}" to School ID: ${schoolId}`);
        }
    } catch (err) {
        console.error(`Failed to dispatch notification for school ${schoolId}:`, err);
    }
};

module.exports = { checkAndSendHolidayNotifications };

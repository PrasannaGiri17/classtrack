const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required'],
        lowercase: true,
        trim: true
    },
    answer: {
        type: String,
        required: [true, 'Answer is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['all', 'student', 'teacher', 'admin'],
        default: 'all'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Seed data function
const seedChatbotData = async (ChatbotModel) => {
    try {
        const count = await ChatbotModel.countDocuments();
        if (count === 0) {
            const seedData = [
                // Shared (role: all)
                {
                    question: "how do i send a message?",
                    answer: "You can send messages by selecting a person from your contacts in this Messages portal and typing in the chat box.",
                    role: 'all'
                },
                {
                    question: "how do i check notifications?",
                    answer: "Click on 'Notification' in your sidebar or the bell icon in the top header to see recent alerts, messages, and system updates.",
                    role: 'all'
                },

                // Student Specific
                {
                    question: "how do i view my classroom?",
                    answer: "Go to the 'Classroom' section in your sidebar to see your enrolled classes, subjects, and teacher information.",
                    role: 'student'
                },
                {
                    question: "where can i find my assignments?",
                    answer: "All your coursework is listed under 'Assignments / Content'. You can download materials and track your submission status there.",
                    role: 'student'
                },
                {
                    question: "how do i pay my school fees?",
                    answer: "Visit the 'Fee Payment' page in your sidebar to view your due amount, payment history, and complete online transactions via Khalti.",
                    role: 'student'
                },
                {
                    question: "where is my class routine?",
                    answer: "Your weekly schedule is available in the 'Routine' section. You can check subject timings and teacher names for each period.",
                    role: 'student'
                },
                {
                    question: "how do i view exam results?",
                    answer: "Results for mid-terms and finals are posted in the 'Exam' section once published by the administration.",
                    role: 'student'
                },
                {
                    question: "what is class diary?",
                    answer: "The Class Diary shows daily updates, homework notes, and important logs shared by your teachers for each subject.",
                    role: 'student'
                },

                // Teacher Specific
                {
                    question: "how do i take attendance?",
                    answer: "Go to the 'Attendance' section in your sidebar. Select your class and section to mark students as present, absent, or late.",
                    role: 'teacher'
                },
                {
                    question: "how do i post an announcement?",
                    answer: "Use the 'Announcements' feature in your sidebar to send broadcast messages and updates to all your students and parents.",
                    role: 'teacher'
                },
                {
                    question: "how do i manage assignments?",
                    answer: "Navigate to 'Assignments' to create new tasks, upload reference materials, and grade student submissions.",
                    role: 'teacher'
                },
                {
                    question: "how do i update class diary?",
                    answer: "Teachers can log daily progress and homework in the 'Diary' section to keep students and parents informed.",
                    role: 'teacher'
                },
                {
                    question: "where can i see my routine?",
                    answer: "Your teaching schedule is located in the 'Routine' section, showing your assigned periods across different classes.",
                    role: 'teacher'
                },
                {
                    question: "how do i view classes?",
                    answer: "The 'Classroom' tab shows all classes where you are assigned as a teacher or co-teacher.",
                    role: 'teacher'
                },

                // Admin/General
                {
                    question: "how do i add a student?",
                    answer: "To add a student, go to 'Student Record' in the Admin sidebar and click the 'Add Student' button at the top right.",
                    role: 'admin'
                },
                {
                    question: "how do i view grades?",
                    answer: "Teachers can view and export grades from the 'Grade Management' section. Students can view their progress in the 'Classroom' tab.",
                    role: 'admin'
                },
                {
                    question: "how do i generate a report?",
                    answer: "Navigate to the designated feature page (like Student Record or Attendance) and look for the 'Export' or 'PDF' icon in the header.",
                    role: 'admin'
                },
                {
                    question: "what is a status flag?",
                    answer: "Status flags (green, yellow, red) help track student academic standing. Green is active, Yellow is at risk, and Red needs immediate attention.",
                    role: 'admin'
                }
            ];

            await ChatbotModel.insertMany(seedData);
            console.log('Chatbot seed data inserted successfully with role assignments');
        }
    } catch (error) {
        console.error('Error seeding chatbot data:', error);
    }
};


const Chatbot = mongoose.model('Chatbot', chatbotSchema);

// Run seed check
seedChatbotData(Chatbot);

module.exports = Chatbot;

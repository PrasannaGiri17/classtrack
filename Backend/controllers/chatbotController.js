const Chatbot = require('../models/Chatbot');

// @desc    Get all Q&A pairs
// @route   GET /api/chatbot
// @access  Public
const getAllQA = async (req, res) => {
    try {
        const qaPairs = await Chatbot.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: qaPairs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// @desc    Get Q&A filtered by role
// @route   GET /api/chatbot/role
// @access  Public
const getQAByRole = async (req, res) => {
    try {
        const { role } = req.query;
        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Role query parameter is required"
            });
        }

        // Return role-specific + 'all' entries combined
        const qaPairs = await Chatbot.find({
            role: { $in: [role, 'all'] }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: qaPairs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// @desc    Create new Q&A
// @route   POST /api/chatbot
// @access  Private (Admin)
const createQA = async (req, res) => {
    try {
        const { question, answer, role } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }
        if (!answer || !answer.trim()) {
            return res.status(400).json({
                success: false,
                message: "Answer is required"
            });
        }

        const newQA = new Chatbot({
            question: question.toLowerCase().trim(),
            answer: answer.trim(),
            role: role || 'all'
        });

        await newQA.save();

        res.status(201).json({
            success: true,
            data: newQA,
            message: "Q&A created successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// @desc    Update existing Q&A
// @route   PUT /api/chatbot/:id
// @access  Private (Admin)
const updateQA = async (req, res) => {
    try {
        const { question, answer, role } = req.body;

        const qa = await Chatbot.findById(req.params.id);
        if (!qa) {
            return res.status(404).json({
                success: false,
                message: "Q&A not found"
            });
        }

        if (question) qa.question = question.toLowerCase().trim();
        if (answer) qa.answer = answer.trim();
        if (role) qa.role = role;
        
        qa.updatedAt = Date.now();

        await qa.save();

        res.status(200).json({
            success: true,
            data: qa,
            message: "Q&A updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// @desc    Delete Q&A
// @route   DELETE /api/chatbot/:id
// @access  Private (Admin)
const deleteQA = async (req, res) => {
    try {
        const qa = await Chatbot.findByIdAndDelete(req.params.id);
        if (!qa) {
            return res.status(404).json({
                success: false,
                message: "Q&A not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Q&A deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// @desc    Match answer for a question
// @route   POST /api/chatbot/match
// @access  Public
const matchAnswer = async (req, res) => {
    try {
        let { question, role } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }

        const cleanQuestion = question.toLowerCase().trim();
        const userRole = role || 'all';

        // 1) Find entries matching role
        const pool = await Chatbot.find({
            role: { $in: [userRole, 'all'] }
        });

        // 2) Exact match first
        let match = pool.find(item => item.question === cleanQuestion);

        // 3) Partial/includes match if no exact match
        if (!match) {
            // Check if stored question is inside user question OR vice versa
            match = pool.find(item => 
                cleanQuestion.includes(item.question) || 
                item.question.includes(cleanQuestion)
            );
        }

        if (match) {
            return res.status(200).json({
                success: true,
                matched: true,
                answer: match.answer
            });
        } else {
            return res.status(200).json({
                success: true,
                matched: false,
                answer: "I'm sorry, I don't have an answer for that yet. Please contact your administrator."
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getAllQA,
    getQAByRole,
    createQA,
    updateQA,
    deleteQA,
    matchAnswer
};

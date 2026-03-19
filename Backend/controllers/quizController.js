const Quiz = require('../models/Quiz');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Teacher
exports.createQuiz = async (req, res) => {
  try {
    const { title, subject, grade, section, startTime, endTime, questions } = req.body;

    // Manual validation for backend-frontend consistency
    if (!title || !subject || !grade || !section || !startTime || !endTime || !questions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    const quiz = new Quiz({
      title,
      subject,
      grade,
      section,
      startTime,
      endTime,
      questions
    });

    const savedQuiz = await quiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ schoolId: req.schoolId }).sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Public
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update quiz details
// @route   PUT /api/quizzes/:id
// @access  Teacher
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate({ _id: req.params.id, schoolId: req.schoolId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Teacher
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, schoolId: req.schoolId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add contestant result and update stats
// @route   POST /api/quizzes/:id/result
// @access  Student
exports.addContestantResult = async (req, res) => {
  try {
    const { name, score } = req.body;
    const quizId = req.params.id;

    if (!name || (score === undefined)) {
      return res.status(400).json({ message: 'Contestant name and score are required' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Push new contestant
    quiz.stats.contestants.push({ name, score });
    
    // Update stats count
    quiz.stats.attempted += 1;

    // Recalculate Average Score
    const totalScore = quiz.stats.contestants.reduce((sum, curr) => sum + curr.score, 0);
    quiz.stats.avgScore = Math.round(totalScore / quiz.stats.attempted);

    // Recalculate Pass Rate (pass = score >= 40)
    const passedCount = quiz.stats.contestants.filter(c => c.score >= 40).length;
    quiz.stats.passRate = Math.round((passedCount / quiz.stats.attempted) * 100);

    // Update Top Score
    if (score > quiz.stats.topScore) {
      quiz.stats.topScore = score;
    }

    await quiz.save();
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Add result error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

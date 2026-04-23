const Quiz = require('../models/Quiz');
const StudentQuiz = require('../models/studentQuiz');

// @desc    Get quiz details for student (hides correctIndex)
// @route   GET /api/student/quiz/:id
// @access  Student
exports.getQuizDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.query; // Expecting studentId to check for existing attempt

    const quiz = await Quiz.findOne({ _id: id, schoolId: req.schoolId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if quiz is active
    const now = new Date();
    if (now < quiz.startTime) {
      return res.status(403).json({ message: 'Quiz has not started yet', startTime: quiz.startTime });
    }
    if (now > quiz.endTime) {
      return res.status(403).json({ message: 'Quiz has already ended' });
    }
    if (quiz.status === 'Closed') {
      return res.status(403).json({ message: 'This quiz is closed' });
    }

    // Check if student already attempted
    if (studentId) {
      const existingAttempt = await StudentQuiz.findOne({ schoolId: req.schoolId,  studentId, quizId: id });
      if (existingAttempt) {
        return res.status(403).json({ message: 'You have already attempted this quiz' });
      }
    }

    // Remove correctIndex from response
    const quizData = quiz.toObject();
    quizData.questions = quizData.questions.map(q => {
      const { correctIndex, ...rest } = q;
      return rest;
    });

    res.status(200).json(quizData);
  } catch (error) {
    console.error('Get quiz details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/student/quiz/submit
// @access  Student
exports.submitQuiz = async (req, res) => {
  try {
    const { studentId, quizId, answers, timeSpentMinutes } = req.body;
    console.log('Submission received:', { studentId, quizId, timeSpent: timeSpentMinutes });

    if (!studentId || !quizId || !answers) {
      console.log('Missing fields:', { studentId: !!studentId, quizId: !!quizId, answers: !!answers });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if already attempted
    const existingAttempt = await StudentQuiz.findOne({ schoolId: req.schoolId,  studentId, quizId });
    if (existingAttempt) {
      console.log('Already attempted:', { studentId, quizId });
      return res.status(403).json({ message: 'You have already submitted this quiz' });
    }

    const quiz = await Quiz.findOne({ _id: quizId, schoolId: req.schoolId });
    if (!quiz) {
      console.log('Quiz not found or outside school scope:', quizId);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const totalQuestions = quiz.questions.length;
    
    // Calculate score
    const processedAnswers = answers.map(submittedAnswer => {
      const question = quiz.questions.id(submittedAnswer.questionId);
      const isCorrect = question && question.correctIndex === submittedAnswer.selectedIndex;
      if (isCorrect) score++;
      
      return {
        questionId: submittedAnswer.questionId,
        selectedIndex: submittedAnswer.selectedIndex
      };
    });

    const percentage = Math.round((score / totalQuestions) * 100);

    // Save attempt
    const studentQuiz = new StudentQuiz({
      schoolId: req.schoolId,
      studentId,
      quizId,
      answers: processedAnswers,
      score,
      totalQuestions,
      percentage,
      timeSpentMinutes,
      submittedAt: new Date()
    });

    await studentQuiz.save();

    // Update Quiz stats
    const student = await require('../models/studentModel').findById(studentId);
    const contestantName = student ? `${student.firstName} ${student.lastName}` : "Unknown Student";

    // Add to contestants list
    quiz.stats.contestants.push({
      name: contestantName,
      score: percentage
    });

    quiz.stats.attempted += 1;
    const allAttempts = await StudentQuiz.find({ schoolId: req.schoolId,  quizId });
    
    const totalPercentage = allAttempts.reduce((sum, curr) => sum + curr.percentage, 0);
    quiz.stats.avgScore = Math.round(totalPercentage / quiz.stats.attempted);
    
    const passedCount = allAttempts.filter(a => a.percentage >= 40).length;
    quiz.stats.passRate = Math.round((passedCount / quiz.stats.attempted) * 100);

    if (percentage > quiz.stats.topScore) {
      quiz.stats.topScore = percentage;
    }

    await quiz.save();
    console.log('Submission successful for student:', studentId);

    res.status(201).json({
      message: 'Quiz submitted successfully',
      result: {
        score,
        totalQuestions,
        percentage,
        timeSpentMinutes
      }
    });
  } catch (error) {
    console.error('Submit quiz error detail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student attempts
// @route   GET /api/student/quiz/attempts/:studentId
// @access  Student
exports.getStudentAttempts = async (req, res) => {
  try {
    const { studentId } = req.params;
    const attempts = await StudentQuiz.find({ schoolId: req.schoolId,  studentId }).populate('quizId', 'title subject');
    res.status(200).json(attempts);
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

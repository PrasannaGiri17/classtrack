const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
const StudentQuiz = require('./models/studentQuiz');
const Student = require('./models/studentModel');

const URI = "mongodb://localhost:27017/school"; 

async function rebuildQuizContestants() {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");

    const quizzes = await Quiz.find({});
    console.log(`Found ${quizzes.length} quizzes to inspect`);

    for (const quiz of quizzes) {
      const attempts = await StudentQuiz.find({ quizId: quiz._id });
      
      if (attempts.length > 0) {
        console.log(`Rebuilding stats for Quiz: ${quiz.title} (${attempts.length} attempts)`);
        
        const contestants = [];
        for (const attempt of attempts) {
          const student = await Student.findById(attempt.studentId);
          const name = student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
          contestants.push({
            name: name,
            score: attempt.percentage
          });
        }

        const totalPercentage = attempts.reduce((sum, curr) => sum + curr.percentage, 0);
        const avgScore = Math.round(totalPercentage / attempts.length);
        const passedCount = attempts.filter(a => a.percentage >= 40).length;
        const passRate = Math.round((passedCount / attempts.length) * 100);
        const topScore = attempts.reduce((max, curr) => Math.max(max, curr.percentage), 0);

        await Quiz.updateOne({ _id: quiz._id }, {
          $set: {
            "stats.contestants": contestants,
            "stats.attempted": attempts.length,
            "stats.avgScore": avgScore,
            "stats.passRate": passRate,
            "stats.topScore": topScore
          }
        });
        
        console.log(`Updated Quiz: ${quiz.title}`);
      }
    }

    console.log("Rebuild complete");
    process.exit(0);
  } catch (err) {
    console.error("Rebuild failed:", err);
    process.exit(1);
  }
}

rebuildQuizContestants();

const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
const Grade = require("./models/School").Grade;

mongoose.connect(mongoURI).then(async () => {
    const grades = await Grade.find({ schoolId: 3, gradeNumber: { $in: [1, 2, 3, 4] } });
    console.log(JSON.stringify(grades.map(g => ({ gradeNumber: g.gradeNumber, _id: g._id })), null, 2));
    process.exit(0);
});

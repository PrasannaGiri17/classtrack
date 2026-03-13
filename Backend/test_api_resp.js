const mongoose = require('mongoose');
const FeeRecord = require('./models/FeeRecord');
const Student = require('./models/studentModel');
const { Grade } = require('./models/School');

async function testAdminStatus() {
    try {
        const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoURI);
        console.log('Connected to DB');

        const students = await Student.find()
          .populate("classId", "gradeName gradeNumber")
          .sort({ firstName: 1 });

        console.log(`Found ${students.length} students`);

        const statusReport = await Promise.all(students.map(async (stu) => {
          const records = await FeeRecord.find({ student: stu._id });
          const totalDue = records.reduce((sum, r) => sum + r.dueAmount, 0);
          const totalPaid = records.reduce((sum, r) => sum + r.paidAmount, 0);
          const unpaidMonths = records.filter(r => r.status !== "PAID").length;

          return {
            _id: stu._id,
            studentName: `${stu.firstName} ${stu.lastName}`,
            studentId: stu.studentId,
            profilePhoto: stu.profilePhoto,
            className: stu.classId?.gradeName || (stu.studentClass ? `Grade ${stu.studentClass}` : "N/A"),
            unpaidMonths,
            totalDueAmount: totalDue,
            totalPaidAmount: totalPaid,
            feeStatus: unpaidMonths > 0 ? "UNPAID" : "PAID"
          };
        }));

        console.log('Sample Data Result:', statusReport[0]);
        console.log('Total Results:', statusReport.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testAdminStatus();

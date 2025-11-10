const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      required: true,
    },

    rollNumber: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
const student = mongoose.model("student", studentSchema);
module.exports = student; 

const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true, index: true },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    title: {
      type: String,
      required: true, 
      trim: true,
    },

    code: {
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", SubjectSchema);

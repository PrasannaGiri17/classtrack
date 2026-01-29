const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    sectionName: {
      type: String,
      required: true,  
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Section", SectionSchema);

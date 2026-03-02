const mongoose = require("mongoose");

const ClassroomNoticeSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorType: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassroomNotice", ClassroomNoticeSchema);

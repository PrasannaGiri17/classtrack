const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true },
    className: {
      type: String,
      required: true,   
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", ClassSchema);

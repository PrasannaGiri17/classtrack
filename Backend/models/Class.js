const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
  {
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

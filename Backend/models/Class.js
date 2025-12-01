import mongoose from "mongoose";

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

export default mongoose.model("Class", ClassSchema);

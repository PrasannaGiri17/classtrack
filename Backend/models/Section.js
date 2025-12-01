import mongoose from "mongoose";

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

export default mongoose.model("Section", SectionSchema);

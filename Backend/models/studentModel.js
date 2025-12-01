import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    email: { type: String, unique: true, sparse: true },
    phone: { type: String, default: null },

    profilePhoto: { type: String, default: null },

    
    parentName: { type: String, default: null, trim: true },
    parentPhone: { type: String, default: null },
    Address: { type: String, default: null, trim: true },

    
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      default: null,
    },

    rollNumber: { type: Number, default: null },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Student", StudentSchema);

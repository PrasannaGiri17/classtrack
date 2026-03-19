// models/AdminModel.js
const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true, index: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, default: null, trim: true },
    birthdate: { type: Date, default: null },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    qualification: { type: String, default: null, trim: true },

    profilePhoto: { type: String, default: null },

    currentAddress: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

// Cascade delete: Remove associated User when Admin is deleted
AdminSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const User = mongoose.model("User");
    await User.deleteOne({ adminId: doc._id });
  }
});

module.exports = mongoose.model("Admin", AdminSchema);

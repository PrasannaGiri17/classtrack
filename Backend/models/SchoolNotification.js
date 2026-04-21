const mongoose = require("mongoose");

const schoolNotificationSchema = new mongoose.Schema({
  schoolId: { type: Number, required: true, index: true },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  sender:   { type: String, required: true },
  receiver: { type: String, enum: ['student', 'teacher', 'all'], default: 'all' },
}, { timestamps: true });

module.exports = mongoose.model("SchoolNotification", schoolNotificationSchema);

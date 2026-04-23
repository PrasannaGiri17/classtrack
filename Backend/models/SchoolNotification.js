const mongoose = require("mongoose");

const schoolNotificationSchema = new mongoose.Schema({
  schoolId: { type: Number, required: true, index: true },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  sender:   { type: String, required: true },
  receiver: { type: String, enum: ['student', 'teacher', 'all'], default: 'all' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model("SchoolNotification", schoolNotificationSchema);

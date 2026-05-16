const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    priority: { 
      type: String, 
      enum: ["urgent", "important", "normal", "warning", "syllabus"], 
      default: "normal" 
    },
    targetGroup: { type: String, required: true }, // e.g., "All School", "Grade 8", etc.
    sender: { type: String, required: true }, // Name/Office of sender
    senderId: { type: String, required: true }, // Admin ID
    senderType: { 
      type: String, 
      enum: ["admin", "teacher", "student"], 
      default: "admin" 
    },
    
    // Support for structured exam routines
    attachment: { type: String, default: null }, // General attachment path/URL
    routine_table: { type: mongoose.Schema.Types.Mixed, default: null }, // JSON data for portal-side rendering
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);

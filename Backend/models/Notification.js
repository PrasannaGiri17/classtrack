const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    priority: { 
      type: String, 
      enum: ["urgent", "important", "normal", "warning"], 
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
    schoolId: { type: Number, default: 1 }, // Default schoolId as seen in other models
    
    // Optional attachment or links could be added here
    attachment: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);

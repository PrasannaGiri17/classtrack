const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    schoolId: {
        type: Number,
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    text: {
        type: String,
        trim: true
    },
    images: [{
        type: String
    }],
    replyToId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for efficiently fetching conversations ordered by time
messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

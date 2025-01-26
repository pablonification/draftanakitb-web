const mongoose = require('mongoose');

const paidTweetSchema = new mongoose.Schema({
    senderID: {
        type: Number,
        required: true,
    },
    messageText: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mediaUrl: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    tweetStatus: {
        type: String,
        enum: ['pending', 'posted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    postedAt: {
        type: Date,
        default: null
    }
});

// Export both schema and model
module.exports = {
    paidTweetSchema,
    PaidTweet: mongoose.models.PaidTweet || mongoose.model('PaidTweet', paidTweetSchema)
};

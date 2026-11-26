const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    content: {
        type: String,
        required: true,
    },

    rating: {
        type: Number,
        required: false,
        default: null,
        min: 1,
        max: 5,
    },

    isApproved: {
        type: Boolean,
        default: false,
    },

    isReply: {
        type: Boolean,
        default: false,
    },

    mainComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: false,
    }
}, { timestamps: true });

const model = mongoose.model("Comment", schema);

module.exports = model;
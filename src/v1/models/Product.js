const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    covers: [
        {
            type: String,
            default: "",
        },
    ],

    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },

    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },

    currentPrice: {
        type: Number,
        required: true,
        min: 0,
    },

    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    tags: [{
        type: String,
        trim: true,
    }],

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },

    sold: {
        type: Number,
        default: 0,
        min: 0,
    },

    isActive: {
        type: Boolean,
        default: true,
    }

}, { timestamps: true });

schema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "product",
});

const model = mongoose.model("Product", schema);

module.exports = model;
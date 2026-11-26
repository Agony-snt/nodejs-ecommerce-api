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
    icon: {
        type: String,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const model = mongoose.model("Category", schema);

module.exports = model;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const schema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
    },

    lastname: {
        type: String,
        required: true,
        trim: true,
    },

    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    phone: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
        select: false,
    },

    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },

    birthDate: {
        type: Date,
        required: false,
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    refreshToken: {
        type: String,
        select: false,
        default: null,
    },

    avatar: {
        type: String,
        default: "",
    },

    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
    ],

    addresses: [
        {
            title: {
                type: String,
                enum: ["Home", "Work", "Other"],
                default: "Home",
            },
            receiver: {
                type: String,
                required: true,
            },
            province: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            street: {
                type: String,
                required: true,
            },
            postalCode: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
        },
    ],

    isBlocked: {
        type: Boolean,
        default: false,
    },

    lastLogin: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

schema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

const model = mongoose.model("User", schema);

module.exports = model;

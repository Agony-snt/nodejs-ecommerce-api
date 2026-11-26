const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },

            quantity: {
                type: Number,
                required: true,
            },

            price: {
                type: Number,
                required: true,
            },
        },
    ],

    address: {
        title: { type: String, enum: ["Home", "Work", "Other"] },
        receiver: String,
        province: String,
        city: String,
        street: String,
        postalCode: String,
        phone: String,
    },

    totalPrice: {
        type: Number,
        required: true,
    },

    paymentStatus: {
        type: String,
        enum: [
            "PENDING",
            "PAID",
            "REFUNDED",
        ],
        default: "PENDING",
    },

    orderStatus: {
        type: String,
        enum: [
            "PENDING",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
        ],
        default: "PENDING",
    },

}, {
    timestamps: true,
});

const model = mongoose.model("Order", schema);

module.exports = model;
const yup = require('yup');
const mongoose = require('mongoose');

exports.registerSchema = yup.object().shape({
    firstname: yup
        .string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters'),
    lastname: yup
        .string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters'),
    username: yup
        .string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be less than 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
    phone: yup
        .string()
        .required('Phone number is required')
        .matches(/(^(0?9)|(\+?989))\d{2}\W?\d{3}\W?\d{4}/g, 'Invalid phone number format'),
    email: yup
        .string()
        .nullable()
        .transform((value) => value === '' ? null : value)
        .email('Invalid email format'),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must be less than 100 characters'),
    birthDate: yup
        .string()
        .required('Birth date is required')
        .matches(
            /^\d{4}\/\d{1,2}\/\d{1,2}$/,
            "Birth date must be in YYYY/M/D or YYYY/MM/DD format"
        ),
});

exports.loginSchema = yup.object().shape({
    identifier: yup
        .string()
        .required('Username or phone is required'),
    password: yup
        .string()
        .required('Password is required')
});

exports.verificationCodeSchema = yup.object().shape({
    code: yup
        .string()
        .required('Verification code is required')
        .matches(/^\d+$/, 'Code must contain only numbers')
});

exports.forgotPasswordSchema = yup.object().shape({
    identifier: yup
        .string()
        .required('Username or phone is required')
});

exports.resetPasswordSchema = yup.object().shape({
    identifier: yup
        .string()
        .required('Username or phone is required'),
    newPassword: yup
        .string()
        .required('New password is required')
        .min(8, 'New password must be at least 8 characters')
        .max(100, 'New password must be less than 100 characters'),
    code: yup
        .string()
        .required('Verification code is required')
        .matches(/^\d+$/, 'Code must contain only numbers')
});

exports.changePasswordSchema = yup.object().shape({
    currentPassword: yup
        .string()
        .required('Current password is required'),
    newPassword: yup
        .string()
        .required('New password is required')
        .min(8, 'New password must be at least 8 characters')
        .max(100, 'New password must be less than 100 characters')
});

exports.userUpdateSchema = yup.object().shape({
    firstname: yup
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must be less than 50 characters"),

    lastname: yup
        .string()
        .trim()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must be less than 50 characters"),

    username: yup
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be less than 30 characters")
        .matches(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers and underscores"
        ),

    birthDate: yup
        .string()
        .matches(
            /^\d{4}\/\d{1,2}\/\d{1,2}$/,
            "Birth date must be in YYYY/M/D or YYYY/MM/DD format"
        ),
});

exports.createAddressSchema = yup.object().shape({
    title: yup
        .string()
        .required('Address title is required'),
    receiver: yup
        .string()
        .required('Receiver name is required')
        .min(2, 'Receiver name must be at least 2 characters')
        .max(100, 'Receiver name must be less than 100 characters'),
    province: yup
        .string()
        .required('Province is required')
        .min(2, 'Province must be at least 2 characters')
        .max(100, 'Province must be less than 100 characters'),
    city: yup
        .string()
        .required('City is required')
        .min(2, 'City must be at least 2 characters')
        .max(100, 'City must be less than 100 characters'),
    street: yup
        .string()
        .required('Street is required')
        .min(2, 'Street must be at least 2 characters')
        .max(200, 'Street must be less than 200 characters'),
    postalCode: yup
        .string()
        .required("Postal code is required")
        .matches(
            /^\d{10}$/,
            "Invalid postal code"
        ),
    phone: yup
        .string()
        .required('Phone number is required')
        .matches(/(^(0?9)|(\+?989))\d{2}\W?\d{3}\W?\d{4}/g, 'Invalid phone number format')
});

exports.updateAddressSchema = yup.object().shape({
    title: yup
        .string(),
    receiver: yup
        .string()
        .min(2, 'Receiver name must be at least 2 characters')
        .max(100, 'Receiver name must be less than 100 characters'),
    province: yup
        .string()
        .min(2, 'Province must be at least 2 characters')
        .max(100, 'Province must be less than 100 characters'),
    city: yup
        .string()
        .min(2, 'City must be at least 2 characters')
        .max(100, 'City must be less than 100 characters'),
    street: yup
        .string()
        .min(2, 'Street must be at least 2 characters')
        .max(200, 'Street must be less than 200 characters'),
    postalCode: yup
        .string()
        .matches(
            /^\d{10}$/,
            "Invalid postal code"
        ),
    phone: yup
        .string()
        .matches(/(^(0?9)|(\+?989))\d{2}\W?\d{3}\W?\d{4}/g, 'Invalid phone number format')
});

exports.createCategorySchema = yup.object().shape({
    title: yup
        .string()
        .required('Category title is required'),
    slug: yup
        .string()
        .required('Category slug is required')
        .matches(/^[a-zA-Z0-9-]+$/, "Slug only contains letters, numbers and hyphens")
});

exports.updateCategorySchema = yup.object().shape({
    title: yup
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(100, "Title must be less than 100 characters"),

    slug: yup
        .string()
        .trim()
        .lowercase()
        .matches(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug is invalid"
        ),

    isActive: yup
        .boolean(),
});

exports.createProductSchema = yup.object().shape({
    title: yup
        .string()
        .required("Title is required")
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(200, "Title must be less than 200 characters"),

    slug: yup
        .string()
        .required("Slug is required")
        .trim()
        .matches(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug is invalid"
        ),

    description: yup
        .string()
        .required("Description is required")
        .trim()
        .min(20, "Description must be at least 20 characters"),

    stock: yup
        .number()
        .required("Stock is required")
        .integer("Stock must be an integer")
        .min(0, "Stock cannot be negative"),

    category: yup
        .string()
        .required("Category is required")
        .test(
            "is-objectid",
            "Invalid category id",
            value => mongoose.Types.ObjectId.isValid(value)
        ),

    totalPrice: yup
        .number()
        .required("Total price is required")
        .min(0, "Total price cannot be negative"),

    discount: yup
        .number()
        .default(0)
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot be greater than 100"),

    tags: yup
        .array()
        .transform((value, originalValue) => {
            if (typeof originalValue === "string") {
                return originalValue
                    .split(",")
                    .map(tag => tag.trim().toLowerCase())
                    .filter(Boolean);
            }

            return value;
        })
        .of(
            yup.string()
                .trim()
                .lowercase()
                .min(2, "Each tag must be at least 2 characters")
                .max(30, "Each tag must be less than 30 characters")
        )
        .max(20, "You can add up to 20 tags")
        .test(
            "unique-tags",
            "Tags must be unique",
            (tags) => {
                if (!tags) return true;

                const normalized = tags.map(tag => tag.trim().toLowerCase());

                return new Set(normalized).size === normalized.length;
            }
        )
        .default([]),
});

exports.updateProductSchema = yup.object().shape({
    title: yup
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(200, "Title must be less than 200 characters"),

    slug: yup
        .string()
        .trim()
        .matches(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug is invalid"
        ),

    description: yup
        .string()
        .trim()
        .min(20, "Description must be at least 20 characters"),

    stock: yup
        .number()
        .integer("Stock must be an integer")
        .min(0, "Stock cannot be negative"),

    category: yup
        .string()
        .test(
            "is-objectid",
            "Invalid category id",
            value => !value || mongoose.Types.ObjectId.isValid(value)
        ),

    totalPrice: yup
        .number()
        .min(0, "Current price cannot be negative"),

    discount: yup
        .number()
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot be greater than 100"),

    isActive: yup
        .boolean(),

    tags: yup
        .array()
        .transform((value, originalValue) => {
            if (typeof originalValue === "string") {
                return originalValue
                    .split(",")
                    .map(tag => tag.trim().toLowerCase())
                    .filter(Boolean);
            }

            return value;
        })
        .of(
            yup.string()
                .trim()
                .lowercase()
                .min(2, "Each tag must be at least 2 characters")
                .max(30, "Each tag must be less than 30 characters")
        )
        .max(20, "You can add up to 20 tags")
        .test(
            "unique-tags",
            "Tags must be unique",
            tags => {
                if (!tags) return true;

                const normalized = tags.map(tag => tag.trim().toLowerCase());

                return new Set(normalized).size === normalized.length;
            }
        ),
});

exports.applyDiscountSchema = yup.object().shape({
    discount: yup
        .number()
        .default(0)
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot be greater than 100"),
});

exports.updateStockSchema = yup.object().shape({
    action: yup
        .string()
        .oneOf(["increase", "decrease"])
        .required("Action is required"),
    amount: yup
        .number()
        .integer()
        .min(1)
        .default(1),
});

exports.updatePriceSchema = yup.object().shape({
    totalPrice: yup
        .number()
        .required("Total price is required")
        .min(0, "Total price cannot be negative"),
});

exports.addToCartSchema = yup.object().shape({
    quantity: yup
        .number()
        .integer()
        .min(1)
        .required()
});

exports.updateCartSchema = yup.object().shape({
    action: yup
        .string()
        .required("action is required")
        .oneOf(
            ["increase", "decrease"],
            "Action must be either 'increase' or 'decrease'"
        ),

    amount: yup
        .number()
        .integer("Amount must be an integer")
        .min(1, "Amount must be at least 1")
        .default(1),
});

exports.updateOrderStatusSchema = yup.object().shape({
    status: yup
        .string()
        .required("Order status is required")
        .oneOf(
            [
                "PENDING",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
            ],
            "Invalid order status"
        ),
});

exports.createCommentSchema = yup.object().shape({
    productId: yup
        .string()
        .required("Product ID is required"),

    content: yup
        .string()
        .trim()
        .required("Comment content is required")
        .min(3, "Comment must be at least 3 characters")
        .max(1000, "Comment must be less than 1000 characters"),

    rating: yup
        .number()
        .integer("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5")
        .nullable(),
});

exports.updateCommentSchema = yup.object().shape({
    content: yup
        .string()
        .trim()
        .min(3, "Comment must be at least 3 characters")
        .max(1000, "Comment must be less than 1000 characters"),

    rating: yup
        .number()
        .integer("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5")
        .nullable(),
});

exports.replyCommentSchema = yup.object().shape({
    content: yup
        .string()
        .trim()
        .required("Reply content is required")
        .min(3, "Reply must be at least 3 characters")
        .max(1000, "Reply must be less than 1000 characters"),
});




////////////////////////////
exports.validate = (schema) => {
    return async (req, res, next) => {
        try {
            const value = await schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });

            req.body = value;

            next();
        } catch (err) {
            if (err.name === "ValidationError") {
                return res.status(400).json({
                    success: false,
                    message: err.errors[0],
                    errors: err.errors,
                });
            }

            next(err);
        }
    };
};
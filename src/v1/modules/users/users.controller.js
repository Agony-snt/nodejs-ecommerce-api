const { isValidObjectId } = require('mongoose');
const usersModel = require('../../models/User');
const bansModel = require("../../models/Ban");
const productsModel = require("../../models/Product");
const { successResponse, errorResponse } = require("../../utils/responses");
const configs = require("../../../configs");
const bcrypt = require('bcrypt');
const jalaali = require("jalaali-js");
const fs = require('fs');
const path = require('path');

//** Admin **// 
exports.showAll = async (req, res, next) => {
    try {
        const users = await usersModel.find({}).lean();

        return successResponse(res, 200, "Users retrieved successfully.", users);
    } catch (err) {
        next(err);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (!isValidObjectId(userId)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const user = await usersModel.findById(userId);
        if (!user) {
            return errorResponse(res, 404, "No user found with this Id !");
        }

        return successResponse(res, 200, "User retrieved successfully.", user);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (!isValidObjectId(userId)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const user = await usersModel.findByIdAndDelete(userId);
        if (!user) {
            return errorResponse(res, 404, "No user found with this Id !");
        }

        if (user.avatar) {
            fs.unlinkSync(path.join(__dirname, "../../../../public/avatars", user.avatar));
        }

        return successResponse(res, 200, "User removed successfully.");
    } catch (err) {
        next(err);
    }
};

exports.block = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (!isValidObjectId(userId)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const user = await usersModel.findByIdAndUpdate(userId, { $set: { isBlocked: true } });
        if (!user) {
            return errorResponse(res, 404, "No user found with this Id !");
        }

        return successResponse(res, 200, "User blocked successfully.");
    } catch (err) {
        next(err);
    }
}; /// Blocked user can not add any comments !

exports.unblock = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (!isValidObjectId(userId)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const user = await usersModel.findByIdAndUpdate(userId, { $set: { isBlocked: false } });
        if (!user) {
            return errorResponse(res, 404, "No user found with this Id !");
        }

        return successResponse(res, 200, "User unblocked successfully.");
    } catch (err) {
        next(err);
    }
};

exports.ban = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (!isValidObjectId(userId)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const user = await usersModel.findById(userId);
        if (!user) {
            return errorResponse(res, 404, "No user found with this Id !");
        }

        const isAlreadyBan = await bansModel.findOne({ phone: user.phone, email: user.email });
        if (isAlreadyBan) {
            return errorResponse(res, 409, "User has already been banned !");
        }

        await bansModel.create({ phone: user.phone, email: user.email });

        user.refreshToken = null;
        await user.save();

        res.clearCookie("access-token", {
            httpOnly: true,
            secure: configs.node_environment === "production",
            sameSite: "lax",
            path: "/",
        });

        res.clearCookie("refresh-token", {
            httpOnly: true,
            secure: configs.node_environment === "production",
            sameSite: "lax",
            path: "/",
        });


        return successResponse(res, 201, "User banned successfully.");
    } catch (err) {
        next(err);
    }
}; /// Banned user can not do anything on website not even login or register!

exports.unban = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (!isValidObjectId(userId)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const user = await usersModel.findById(userId);
        if (!user) {
            return errorResponse(res, 404, "No user found with this Id !");
        }

        const isBan = await bansModel.findOneAndDelete({ phone: user.phone, email: user.email });
        if (!isBan) {
            return errorResponse(res, 404, "User is not ban !");
        }

        return successResponse(res, 200, "User unbanned successfully.");
    } catch (err) {
        next(err);
    }
};



//** User **//
exports.showMe = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return errorResponse(res, 401, "Login required !");
        }

        return successResponse(res, 200, "User profile retrieved successfully.", user);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0 && !req.file) {
            return errorResponse(res, 400, "Please provide at least one field to update.");
        }

        const allowedFields = [
            "firstname",
            "lastname",
            "username",
            "birthDate",
            "avatar",
        ];

        const updates = {};

        if (req.file) {
            if (req.user.avatar) {
                fs.unlinkSync(path.join(__dirname, "../../../../public/avatars", req.user.avatar));
                await usersModel.findByIdAndUpdate(req.user._id, { $set: { avatar: "" } });
            }

            if (req.file.fieldname === "avatar") {
                updates.avatar = req.file.filename;
            }
        }

        for (const field of allowedFields) {
            if (req.body[field] !== undefined && req.body[field] !== "") {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return errorResponse(res, 400, `Please provide at least one of the following fields to update: ${allowedFields.join(", ")}.`);
        }

        if (updates.username) {
            const isUsernameExists = await usersModel.findOne({ username: updates.username });
            if (isUsernameExists) {
                return errorResponse(res, 409, "Username already exists !");
            }
        }

        if (updates.birthDate) {
            const [jy, jm, jd] = updates.birthDate.split("/").map(Number);

            const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);

            updates.birthDate = new Date(gy, gm - 1, gd);
        }

        const user = await usersModel.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });

        return successResponse(res, 200, "User profile updated successfully.", user);
    } catch (err) {
        next(err);
    }
};

exports.removeAccount = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            return errorResponse(res, 400, "Password is required to remove the account.");
        }

        const user = await usersModel.findById(req.user._id).select("+password");

        if (!user) {
            return errorResponse(res, 404, "User not found.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return errorResponse(res, 401, "Incorrect password");
        }

        if (user.avatar) {
            fs.unlinkSync(path.join(__dirname, "../../../../public/avatars", user.avatar));
        }

        await usersModel.findByIdAndDelete(req.user._id);

        res.clearCookie("access-token", {
            httpOnly: true,
            secure: configs.node_environment === "production",
            sameSite: "lax",
            path: "/",
        });

        res.clearCookie("refresh-token", {
            httpOnly: true,
            secure: configs.node_environment === "production",
            sameSite: "lax",
            path: "/",
        });

        return successResponse(res, 200, "Account removed successfully.");
    } catch (err) {
        next(err);
    }
};

exports.calculateAge = async (req, res, next) => {
    try {
        const birthDate = req.user.birthDate;
        if (!birthDate) {
            return errorResponse(res, 400, "birthDate hasn't been set yet !");
        }

        const isValidISODate = (dateString) => {
            const isoRegex =
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}(Z|[+-]\d{2}:\d{2})$/;

            return isoRegex.test(dateString) && !isNaN(new Date(dateString).getTime());
        }

        if (!isValidISODate) {
            return errorResponse(res, 400, "Invalid birthDate. Please provide a valid date in ISO 8601 format (e.g. 2004-04-14T19:30:00.000Z).");
        }


        const calculateAge = (dateOfBirth) => {
            const birthDate = new Date(dateOfBirth);

            if (isNaN(birthDate.getTime())) {
                return null; // Invalid date
            }

            const today = new Date();

            let age = today.getFullYear() - birthDate.getFullYear();

            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }

            return age;
        }

        const age = calculateAge(birthDate);

        return successResponse(res, 200, "Age calculated successfully", age);
    } catch (err) {
        next(err);
    }
};

exports.showAddresses = async (req, res, next) => {
    try {
        const addresses = await usersModel.findById(req.user._id).select("-_id addresses");

        return successResponse(res, 200, "User addresses retrieved successfully.", addresses);
    } catch (err) {
        next(err);
    }
};

exports.createAddress = async (req, res, next) => {
    try {
        const {
            title,
            receiver,
            province,
            city,
            street,
            postalCode,
            phone
        } = req.body;

        const address = await usersModel.findByIdAndUpdate(req.user._id, {
            $push: {
                addresses: {
                    title,
                    receiver,
                    province,
                    city,
                    street,
                    postalCode,
                    phone
                }
            }
        }, { new: true, runValidators: true }).select("-_id addresses");

        return successResponse(res, 201, "Address added successfully.", address);
    } catch (err) {
        next(err);
    }
};

exports.updateAddress = async (req, res, next) => {
    try {
        const addressId = req.params.id;

        if (!isValidObjectId(addressId)) {
            return errorResponse(res, 400, "Invalid address Id !");
        }

        const address = await usersModel.findOne({ _id: req.user._id, "addresses._id": addressId });
        if (!address) {
            return errorResponse(res, 404, "Address not found.");
        }

        if (Object.keys(req.body).length === 0) {
            return errorResponse(res, 400, "Please provide at least one field to update.");
        }

        const allowedFields = [
            "title",
            "receiver",
            "province",
            "city",
            "street",
            "postalCode",
            "phone",
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[`addresses.$.${field}`] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return errorResponse(res, 400, "Please provide at least one field to update.");
        }

        await usersModel.updateOne({ _id: req.user._id, "addresses._id": addressId }, { $set: updates }, { runValidators: true });

        return successResponse(res, 200, "Address updated successfully.");
    } catch (err) {
        next(err);
    }
};

exports.removeAddress = async (req, res, next) => {
    try {
        const addressId = req.params.id;

        if (!isValidObjectId(addressId)) {
            return errorResponse(res, 400, "Invalid address Id !");
        }

        const address = await usersModel.findByIdAndUpdate(req.user._id, {
            $pull: { addresses: { _id: addressId } }
        }, { new: true }).select("-_id addresses");

        if (!address) {
            return errorResponse(res, 404, "Address not found.");
        }

        return successResponse(res, 200, "Address removed successfully.");
    } catch (err) {
        next(err);
    }
};

exports.showAllWishlists = async (req, res, next) => {
    try {
        const wishlist = req.user.wishlist;
        if (wishlist.length === 0) {
            return errorResponse(res, 404, "No product found in wishlist !");
        }

        return successResponse(res, 200, "User wishlist retrieved successfully.", wishlist);
    } catch (err) {
        next(err);
    }
};

exports.AddToWishlist = async (req, res, next) => {
    try {
        const { productSlug } = req.params;

        const product = await productsModel.findOne({ slug: productSlug });
        if (!product) {
            return errorResponse(res, 404, "No product found with this slug !");
        }

        let isExist = false;
        for (const item of req.user.wishlist) {
            if (item._id.toString() === product._id.toString()) {
                isExist = true;
                break;
            }
        }

        if (isExist) {
            return errorResponse(res, 409, "Product is already in wishlist !");
        }

        const user = req.user;

        user.wishlist.push(product._id);
        await user.save();

        return successResponse(res, 200, "Product added to wishlist successfully.");
    } catch (err) {
        next(err);
    }
};

exports.removeFromWishlist = async (req, res, next) => {
    try {
        const { productSlug } = req.params;

        const product = await productsModel.findOne({ slug: productSlug });
        if (!product) {
            return errorResponse(res, 404, "No product found with this slug !");
        }

        let isExist = false;
        for (const item of req.user.wishlist) {
            if (item._id.toString() === product._id.toString()) {
                isExist = true;
                break;
            }
        }

        if (!isExist) {
            return errorResponse(res, 404, "Product is not in whishlist !");
        }

        await usersModel.findByIdAndUpdate(req.user._id, { $pull: { wishlist: product._id } });

        return successResponse(res, 200, "Product removed from wishlist successfully.");
    } catch (err) {
        next(err);
    }
};

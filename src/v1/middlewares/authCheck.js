const jwt = require("jsonwebtoken");
const usersModel = require("../models/User");
const { errorResponse } = require("../utils/responses");
const configs = require("../../configs");

exports.isAuth = async (req, res, next) => {
    try {
        const token = req.cookies["access-token"];
        if (!token) {
            return errorResponse(res, 401, "Login required !");
        }

        const payload = jwt.verify(token, configs.auth.access_secret);
        if (!payload) {
            return errorResponse(res, 401, "Login required !");
        }

        const user = await usersModel
            .findOne({ phone: payload.phone })
            .populate("wishlist", "title")
            .select("+refreshToken");
        if (!user) {
            return errorResponse(res, 401, "Login required !");
        }

        req.user = user;
        return next();
    } catch (err) {
        next(err);
    }
};

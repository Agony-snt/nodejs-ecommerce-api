const { errorResponse } = require("../utils/responses");

exports.isAdmin = (req, res, next) => {
    if (req.user?.role !== "ADMIN") {
        return errorResponse(res, 403, "Access denied !");
    }

    return next();
};
const bcrypt = require("bcrypt");
const { errorResponse } = require("../utils/responses");

exports.isVerify = async (req, res, next) => {
    try {
        const { code } = req.body;

        const isCodeValid = req.cookies["verification-code"];
        if (!isCodeValid) {
            return errorResponse(res, 400, "Verification code has expired !");
        }

        const isMatch = await bcrypt.compare(code, isCodeValid);
        if (!isMatch) {
            return errorResponse(res, 406, "Invalid verification code !");
        }

        req.code = code;
        return next();
    } catch (err) {
        next(err);
    }
};

const express = require("express");

const authController = require("./auth.controller");
const { isAuth } = require("../../middlewares/authCheck");
const { isVerify } = require("../../middlewares/verificationCode");
const {
    validate,
    registerSchema,
    loginSchema,
    verificationCodeSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
} = require("../../utils/validation");

const router = express.Router();

router.route("/register").post(validate(registerSchema), authController.register);

router.route("/login").post(validate(loginSchema), authController.login);

router.route("/logout").post(isAuth, authController.logout);

router.route("/refresh").post(authController.refresh);

router.route("/check").get(isAuth, authController.checkAuth);

router.route("/send-verification-code").post(isAuth, authController.sendCode);

router.route("/resend-verification-code").post(isAuth, authController.resendCode);

router.route("/verify-email").post(isAuth, validate(verificationCodeSchema), isVerify, authController.verifyEmail);

router.route("/forgot-password").post(validate(forgotPasswordSchema), authController.forgotPassword);

router.route("/reset-password").patch(validate(resetPasswordSchema), isVerify, authController.resetPassword);

router.route("/change-password").patch(isAuth, validate(changePasswordSchema), authController.changePassword);


module.exports = router;

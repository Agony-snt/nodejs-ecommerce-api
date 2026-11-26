const express = require("express");

const usersController = require("./users.controller");
const { isAuth } = require("../../middlewares/authCheck");
const { isAdmin } = require("../../middlewares/authGaurd");
const { validate, userUpdateSchema, createAddressSchema, updateAddressSchema } = require("../../utils/validation");
const { uploadAvatar } = require("../../utils/upload");

const router = express.Router();

// users routes
router.route("/me")
    .get(isAuth, usersController.showMe)
    .patch(isAuth, uploadAvatar.single("avatar"), validate(userUpdateSchema), usersController.update)
    .delete(isAuth, usersController.removeAccount);

router.route("/calculate-age").get(isAuth, usersController.calculateAge);

router.route("/addresses")
    .get(isAuth, usersController.showAddresses)
    .post(isAuth, validate(createAddressSchema), usersController.createAddress);

router.route("/addresses/:id")
    .patch(isAuth, validate(updateAddressSchema), usersController.updateAddress)
    .delete(isAuth, usersController.removeAddress);

router.route("/wishlist").get(isAuth, usersController.showAllWishlists);

router.route("/wishlist/:productSlug")
    .post(isAuth, usersController.AddToWishlist)
    .delete(isAuth, usersController.removeFromWishlist);


/// Admin only routes
router.route("/").get(isAuth, isAdmin, usersController.showAll);

router.route("/:id")
    .get(isAuth, isAdmin, usersController.getById)
    .delete(isAuth, isAdmin, usersController.remove);

router.route("/:id/block").patch(isAuth, isAdmin, usersController.block);

router.route("/:id/unblock").patch(isAuth, isAdmin, usersController.unblock);

router.route("/:id/ban").post(isAuth, isAdmin, usersController.ban);

router.route("/:id/unban").delete(isAuth, isAdmin, usersController.unban);



module.exports = router;

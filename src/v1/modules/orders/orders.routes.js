const express = require('express');

const ordersController = require("./orders.controller");
const { isAuth } = require('../../middlewares/authCheck');
const { isAdmin } = require("../../middlewares/authGaurd");
const { validate, addToCartSchema, updateCartSchema, updateOrderStatusSchema } = require('../../utils/validation');

const router = express.Router();

///////// Cart
router.route("/cart")
    .get(isAuth, ordersController.showCart)
    .delete(isAuth, ordersController.emptyCart);

router.route("/cart/:productId")
    .post(isAuth, validate(addToCartSchema), ordersController.addItem)
    .patch(isAuth, validate(updateCartSchema), ordersController.changeQuantity)
    .delete(isAuth, ordersController.removeProduct);


///////// Orders

/// admins
router.route("/admin/")
    .get(isAuth, isAdmin, ordersController.adminShowAll);

router.route("/:id/admin")
    .get(isAuth, isAdmin, ordersController.adminGetOne);

router.route("/:id/status")
    .patch(isAuth, isAdmin, validate(updateOrderStatusSchema), ordersController.changeStatus);


/// costumers
router.route("/")
    .get(isAuth, ordersController.showAll)
    .post(isAuth, ordersController.create);

router.route("/:id")
    .get(isAuth, ordersController.getOne);

router.route("/:id/cancel")
    .patch(isAuth, ordersController.cancel);

router.route("/:id/pay")
    .patch(isAuth, ordersController.pay);


module.exports = router;
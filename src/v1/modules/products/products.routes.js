const express = require('express');

const productsController = require('./products.controller');
const { isAuth } = require("../../middlewares/authCheck");
const { isAdmin } = require("../../middlewares/authGaurd");
const { uploadCovers } = require("../../utils/upload");
const {
    validate,
    createProductSchema,
    updateProductSchema,
    applyDiscountSchema,
    updateStockSchema,
    updatePriceSchema,
} = require('../../utils/validation');

const router = express.Router();

router.route("/")
    .get(productsController.getAll)
    .post(isAuth, isAdmin, uploadCovers.array("covers", 10), validate(createProductSchema), productsController.create);

router.route("/discounted").get(productsController.getDiscountedProducts);

router.route("/search").get(productsController.search);

router.route("/:id")
    .get(productsController.getOne)
    .patch(isAuth, isAdmin, uploadCovers.array("covers", 10), validate(updateProductSchema), productsController.update)
    .delete(isAuth, isAdmin, productsController.remove);

router.route("/:id/discount").patch(isAuth, isAdmin, validate(applyDiscountSchema), productsController.applyDiscount);

router.route("/:id/discount/remove").patch(isAuth, isAdmin, productsController.removeDiscount);

router.route("/:id/stock").patch(isAuth, isAdmin, validate(updateStockSchema), productsController.updateStock);

router.route("/:id/price").patch(isAuth, isAdmin, validate(updatePriceSchema), productsController.updatePrice);

router.route("/category/:slug").get(productsController.getByCategory);


module.exports = router;
const express = require('express');

const categoriesController = require('./categories.controller');
const { isAuth } = require('../../middlewares/authCheck');
const { isAdmin } = require('../../middlewares/authGaurd');
const { validate, createCategorySchema, updateCategorySchema } = require('../../utils/validation');
const { uploadIcon } = require('../../utils/upload');

const router = express.Router();

router.route("/")
    .get(categoriesController.getAll)
    .post(isAuth, isAdmin, uploadIcon.single("icon"), validate(createCategorySchema), categoriesController.create);

router.route("/:id")
    .get(categoriesController.getOne)
    .patch(isAuth, isAdmin, uploadIcon.single("icon"), validate(updateCategorySchema), categoriesController.update)
    .delete(isAuth, isAdmin, categoriesController.remove);


module.exports = router;
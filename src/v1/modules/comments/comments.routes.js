const express = require('express');

const commentsController = require("./comments.controller");
const { isAuth } = require('../../middlewares/authCheck');
const { isAdmin } = require('../../middlewares/authGaurd');
const { validate, createCommentSchema, updateCommentSchema, replyCommentSchema } = require("../../utils/validation");

const router = express.Router();


router.route("/")
    .get(isAuth, isAdmin, commentsController.getAll)
    .post(isAuth, validate(createCommentSchema), commentsController.create);

router.route("/user")
    .get(isAuth, commentsController.getUserComments);

router.route("/:id")
    .get(isAuth, commentsController.getOneById)
    .patch(isAuth, validate(updateCommentSchema), commentsController.update)
    .delete(isAuth, commentsController.remove);

router.route("/product/:id")
    .get(commentsController.getProductComments);

router.route("/:id/approve")
    .patch(isAuth, isAdmin, commentsController.approve);

router.route("/:id/reply")
    .post(isAuth, validate(replyCommentSchema), commentsController.reply);


module.exports = router;
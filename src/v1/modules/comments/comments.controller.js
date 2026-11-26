const { isValidObjectId } = require("mongoose");
const commentsModel = require("../../models/Comment");
const productsModel = require('../../models/Product');
const { errorResponse, successResponse } = require("../../utils/responses");

exports.getAll = async (req, res, next) => {
    try {
        const comments = await commentsModel
            .find({})
            .populate("user", "firstname lastname username phone")
            .populate("product", "title")
            .lean();

        const allComments = [];

        comments.forEach((comment) => {
            // Skip answers, we'll attach them to their parent
            if (comment.isReply) return;

            const answers = comments.filter(
                (answer) =>
                    answer.isReply &&
                    String(answer.mainComment) === String(comment._id)
            );

            allComments.push({
                Comment: comment,
                Replies: answers,
            });
        });

        if (allComments.length === 0) {
            return errorResponse(res, 404, "No comments found !");
        }

        return successResponse(res, 200, "Comments retrieved successfully.", allComments);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { productId, content, rating } = req.body;

        console.log("BODY:", req.body);
        console.log("PRODUCT ID:", req.body.productId);
        console.log("CONTENT TYPE:", req.headers["content-type"]);


        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, "Invalid product ID !");
        }

        const product = await productsModel.findById(productId);
        if (!product) {
            return errorResponse(res, 404, "No product found with this ID !");
        }

        const comment = await commentsModel.create({
            user: req.user.id,
            product: productId,
            content,
            rating: rating || null,
        });

        return successResponse(res, 201, "Comment created successfully.", comment);
    } catch (err) {
        next(err);
    }
};

exports.getOneById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid comment ID !");
        }

        const comment = await commentsModel
            .findById(id)
            .populate("user", "firstname lastname username phone")
            .populate("product", "title");

        if (!comment) {
            return errorResponse(res, 404, "No comment found with this Id !");
        }

        if (comment.user._id.toString() !== req.user._id.toString() && req.user.role === "USER") {
            return errorResponse(res, 403, "User not allowed !");
        }

        return successResponse(res, 200, "Comment retrieved successfully.", comment);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { content, rating } = req.body;
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid comment ID !");
        }

        const comment = await commentsModel
            .findById(id)
            .populate("user", "firstname lastname username phone")
            .populate("product", "title");

        if (!comment) {
            return errorResponse(res, 404, "No comment found with this Id !");
        }

        if (comment.user._id.toString() !== req.user._id.toString() && req.user.role === "USER") {
            return errorResponse(res, 403, "User not allowed to update comment !");
        }

        if (comment.isApproved) {
            comment.isApproved = false;
        }

        comment.content = content;
        comment.rating = rating;

        await comment.save();

        return successResponse(res, 200, "Comment updated successfully.", comment);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid comment ID !");
        }

        const comment = await commentsModel.findById(id);
        if (!comment) {
            return errorResponse(res, 404, "No comment found with this Id !");
        }

        if (comment.user._id.toString() !== req.user._id.toString() && req.user.role === "USER") {
            return errorResponse(res, 403, "User not allowed to remove comment !");
        }

        await commentsModel.deleteOne({ _id: id });
        await commentsModel.deleteMany({ mainComment: id });

        return successResponse(res, 200, "Comment removed successfully.");
    } catch (err) {
        next(err);
    }
};

exports.getUserComments = async (req, res, next) => {
    try {
        const comments = await commentsModel
            .find({ user: req.user._id })
            .populate("user", "firstname lastname username phone")
            .populate("product", "title");

        if (comments.length === 0) {
            return errorResponse(res, 404, "User has no comments !");
        }

        return successResponse(res, 200, "User comments retrieved successfully.", comments);
    } catch (err) {
        next(err);
    }
};

exports.getProductComments = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid product ID !");
        }

        const comments = await commentsModel
            .find({ product: id, isApproved: true })
            .populate("user", "username")
            .populate("product", "title")
            .sort({ createdAt: -1 });

        const allComments = [];

        comments.forEach((comment) => {
            // Skip answers, we'll attach them to their parent
            if (comment.isReply) return;

            const answers = comments.filter(
                (answer) =>
                    answer.isReply &&
                    String(answer.mainComment) === String(comment._id)
            );

            allComments.push({
                Comment: comment,
                Replies: answers,
            });
        });


        if (allComments.length === 0) {
            return errorResponse(res, 404, "No comments found for this product !");
        }

        return successResponse(res, 200, "Product comments retrieved successfully.", allComments);
    } catch (err) {
        next(err);
    }
};

exports.approve = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid comment ID !");
        }

        const comment = await commentsModel.findByIdAndUpdate(id, { $set: { isApproved: true } });
        if (!comment) {
            return errorResponse(res, 404, "No comment found with this Id !");
        }

        return successResponse(res, 200, "Comment got approved successfully.");
    } catch (err) {
        next(err);
    }
};

exports.reply = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid comment ID !");
        }

        const comment = await commentsModel.findById(id);
        if (!comment) {
            return errorResponse(res, 404, "No comment found with this Id !");
        }

        const reply = await commentsModel.create({
            user: req.user._id,
            product: comment.product,
            content,
            isReply: true,
            mainComment: id
        });

        return successResponse(res, 201, "Replied to comment successfully.", reply);
    } catch (err) {
        next(err);
    }
};


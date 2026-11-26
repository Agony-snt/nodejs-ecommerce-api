const categoryModel = require("../../models/Category");
const { isValidObjectId } = require("mongoose");
const { successResponse, errorResponse } = require("../../utils/responses");

exports.getAll = async (req, res, next) => {
    try {
        const categories = await categoryModel.find().lean();

        return successResponse(res, 200, "Categories retrieved successfully.", categories);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { title, slug } = req.body;

        const isExist = await categoryModel.findOne({ slug });
        if (isExist) {
            return errorResponse(res, 409, "Category with this slug already exists !");
        }

        if (req.file) {
            req.body.icon = req.file.filename;
        }

        const category = await categoryModel.create({ title, slug, icon: req.body.icon });

        return successResponse(res, 201, "Category created successfully.", category);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const category = await categoryModel.findById(id).lean();
        if (!category) {
            return errorResponse(res, 404, "Category not found !");
        }

        return successResponse(res, 200, "Category retrieved successfully.", category);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0 && !req.file) {
            return errorResponse(res, 400, "Please provide at least one field to update.");
        }

        const { id } = req.params;
        const { title, isActive } = req.body;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const category = await categoryModel.findById(id);
        if (!category) {
            return errorResponse(res, 404, "Category not found !");
        }

        req.body.icon = category.icon; // Preserve the existing icon if no new file is uploaded
        if (req.file) {
            req.body.icon = req.file.filename;
        }

        await categoryModel.updateOne({ id }, { title, isActive, icon: req.body.icon });

        return successResponse(res, 200, "Category updated successfully.");
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const category = await categoryModel.findByIdAndDelete(id);
        if (!category) {
            return errorResponse(res, 404, "Category not found !");
        }

        return successResponse(res, 200, "Category removed successfully.");
    } catch (err) {
        next(err);
    }
};

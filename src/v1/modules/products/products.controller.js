const productsModel = require('../../models/Product');
const categoryModel = require("../../models/Category");
const usersModel = require("../../models/User");
const path = require('path');
const fs = require('fs');
const { successResponse, errorResponse } = require('../../utils/responses');
const { isValidObjectId } = require('mongoose');
const jwt = require('jsonwebtoken');
const configs = require('../../../configs');


exports.getAll = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = "latest",
            minPrice,
            maxPrice,
            category,
            inStock,
            hasDiscount
        } = req.query;

        const currentPage = Number(page);
        const pageLimit = Number(limit);
        const skip = (currentPage - 1) * pageLimit;

        const filter = {};

        if (req.cookies["access-token"]) {
            const payload = jwt.verify(req.cookies["access-token"], configs.auth.access_secret);

            const user = await usersModel.findOne({ phone: payload.phone });

            if (user.role === "ADMIN") {
                const products = await productsModel
                    .find(filter)
                    .populate("category", "title")
                    .select("-__v")
                    .lean();

                return successResponse(res, 200, "Products retrieved successfully.", products);
            }
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.currentPrice = {};

            if (minPrice !== undefined) {
                filter.currentPrice.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                filter.currentPrice.$lte = Number(maxPrice);
            }
        }

        if (category) {
            if (!isValidObjectId(category)) {
                return errorResponse(res, 400, "Invalid category ID !");
            }

            const isCategoryExists = await categoryModel.findById(category);
            if (!isCategoryExists) {
                return errorResponse(res, 404, "No category found with this ID !");
            }

            filter.category = category;
        }

        if (inStock !== undefined) {
            if (inStock === "true") {
                filter.stock = { $gt: 0 };
            } else if (inStock === "false") {
                filter.stock = 0;
            } else {
                return errorResponse(res, 400, "inStock must be true or false");
            }
        }

        if (hasDiscount !== undefined) {
            if (hasDiscount === "true") {
                filter.discount = { $gt: 0 };
            } else if (hasDiscount === "false") {
                filter.discount = 0;
            } else {
                return errorResponse(res, 400, "hasDiscount must be true or false");
            }
        }

        const sortOptions = {
            latest: { createdAt: -1 },
            oldest: { createdAt: 1 }
        };

        if (!sortOptions[sort]) {
            return errorResponse(res, 400, "Invalid sort [latest | oldest]");
        }

        filter.isActive = true;

        const products = await productsModel
            .find(filter)
            .populate("category", "title")
            .select("-__v")
            .sort(sortOptions[sort])
            .skip(skip)
            .limit(pageLimit)
            .lean();

        return successResponse(res, 200, "Products retrieved successfully.", products);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { title, slug, description, stock, category, totalPrice, discount, tags } = req.body;

        const isExists = await productsModel.findOne({ slug });
        if (isExists) {
            return errorResponse(res, 409, "Product with this slug already exists !");
        }

        const isCategoryValid = await categoryModel.findById(category);
        if (!isCategoryValid) {
            return errorResponse(res, 404, "No category found with this Id !");
        }

        const covers = req.files?.map(file => file.filename) || [];

        let currentPrice = totalPrice;
        if (discount > 0) {
            currentPrice = totalPrice - totalPrice * (discount / 100);
        }

        const product = await productsModel.create({
            title,
            slug,
            description,
            stock,
            category,
            totalPrice,
            currentPrice,
            discount,
            covers,
            tags,
        });

        return successResponse(res, 201, "Product created successfully.", product);
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

        const product = await productsModel
            .findOne({ _id: id, isActive: true })
            .populate("category", "title")
            .select("-__v")
            .lean();

        if (!product) {
            return errorResponse(res, 404, "No product found with this ID !");
        }

        return successResponse(res, 200, "Product retrieved successfully.", product);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        if (Object.keys(req.body).length === 0 && !req.files) {
            return errorResponse(res, 400, "Please provide at least one field to update.");
        }

        const fields = [
            "title",
            "slug",
            "description",
            "stock",
            "category",
            "totalPrice",
            "discount",
            "isActive",
            "tags"
        ];

        let newCovers;
        if (req.files) {
            newCovers = req.files.map(file => file.filename);
        }

        const updates = {};
        for (const field of fields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const product = await productsModel.findByIdAndUpdate(id, { $set: updates, $push: { covers: { $each: newCovers } } }, { new: true })
            .populate("category", "title")
            .select("-__v");

        if (!product) {
            return errorResponse(res, 404, "No product found with this ID !");
        }

        return successResponse(res, 200, "Product updated successfully.", product);
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

        const product = await productsModel.findByIdAndDelete(id);
        if (!product) {
            return errorResponse(res, 404, "No product found with this ID !");
        }

        if (product.covers.length > 0) {
            for (const cover of product.covers) {
                let filePath = path.join(__dirname, `../../../../public/covers/${cover}`);
                fs.unlinkSync(filePath)
            }
        }

        return successResponse(res, 200, "Product removed successfully.");
    } catch (err) {
        next(err);
    }
};

exports.applyDiscount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { discount } = req.body;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const product = await productsModel.findById(id);
        if (!product) {
            return errorResponse(res, 404, "No product found with this ID !");
        }

        const newPrice = product.totalPrice - product.totalPrice * (discount / 100);

        product.discount = discount;
        product.currentPrice = newPrice;
        await product.save();

        return successResponse(res, 200, "Discount applied on product successfully.");
    } catch (err) {
        next(err);
    }
};

exports.removeDiscount = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const product = await productsModel.findById(id);
        if (!product) {
            return errorResponse(res, 404, "No product found with this ID !");
        }

        product.discount = 0;
        product.currentPrice = product.totalPrice;
        await product.save();

        return successResponse(res, 200, "Discount removed successfully.");
    } catch (err) {
        next(err);
    }
};

exports.updateStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { action, amount } = req.body;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const product = await productsModel.findById(id);
        if (!product) {
            return errorResponse(res, 404, "No product found with this ID !");
        }

        if (action === "increase") {
            product.stock += amount;
        } else if (action === "decrease") {
            product.stock -= amount;

            if (product.stock < 0) {
                return errorResponse(res, 400, "Invalid number, is greater than stock");
            }
        } else {
            return errorResponse(res, 400, "Invalid action !");
        }

        await product.save();

        return successResponse(res, 200, "Stock updated successfully.");
    } catch (err) {
        next(err);
    }
};

exports.updatePrice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { totalPrice } = req.body;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !");
        }

        const product = await productsModel.findById(id);
        if (!product) {
            return errorResponse(res, 404, "No product found with this ID !");
        }

        const newCurrentPrice = totalPrice - totalPrice * (product.discount / 100);

        product.totalPrice = totalPrice;
        product.currentPrice = newCurrentPrice;
        await product.save();

        return successResponse(res, 200, "Price updated successfully.");
    } catch (err) {
        next(err);
    }
};

exports.getDiscountedProducts = async (req, res, next) => {
    try {
        const products = (await productsModel
            .find({ isActive: true })
            .populate("category", "title")
            .sort({ createdAt: -1 })
            .select("-__v")
            .lean()
        ).filter(product => product.discount > 0);

        if (!products) {
            return errorResponse(res, 404, "No discounted product was found !");
        }

        return successResponse(res, 200, "Discounted products retrieved successfully.", products);
    } catch (err) {
        next(err);
    }
};

exports.getByCategory = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const category = await categoryModel.findOne({ slug });
        if (!category) {
            return errorResponse(res, 404, "No category found with this slug !");
        }

        const products = await productsModel
            .find({ category: category._id, isActive: true })
            .populate("category", "title")
            .sort({ createdAt: -1 })
            .select("-__v")
            .lean()

        if (products.length === 0) {
            return errorResponse(res, 404, "No product was found in this category !");
        }

        return successResponse(res, 200, `Products in ${category.title} category retrieved successfully.`, products);
    } catch (err) {
        next(err);
    }
};

exports.search = async (req, res, next) => {
    try {
        const { q } = req.query;

        const result = await productsModel.find({
            isActive: true,
            $or: [
                { title: { $regex: q, $options: "i" } },
                { slug: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { tags: { $regex: q.toLowerCase() } }
            ]
        }).sort({ createdAt: -1 });

        if (result.length === 0) {
            return errorResponse(res, 404, "No results !");
        }

        return successResponse(res, 200, "Result retrieved successfully.", result);
    } catch (err) {
        next(err);
    }
};

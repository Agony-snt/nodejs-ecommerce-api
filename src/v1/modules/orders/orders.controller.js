const { isValidObjectId } = require("mongoose");
const cartModel = require("../../models/Cart");
const ordersModel = require("../../models/Order");
const productsModel = require("../../models/Product");
const { errorResponse, successResponse } = require("../../utils/responses");

///////// Cart

exports.showCart = async (req, res, next) => {
    try {
        const cart = await cartModel.findOne({ user: req.user._id })
            .populate("user", "firstname lastname username phone")
            .populate("items.product", "title")
            .lean();

        if (!cart) {
            return errorResponse(res, 404, "Cart is empty !", []);
        }

        return successResponse(res, 200, "Cart items retrieved successfully.", cart);
    } catch (err) {
        next(err);
    }
};

exports.addItem = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, "Invalid objectId !")
        }

        const product = await productsModel.findById(productId);
        if (!product) {
            return errorResponse(res, 404, "No product found with this ID !");
        }

        if (!product.isActive) {
            return errorResponse(res, 400, "Product is not active !");
        }

        if (product.stock === 0) {
            return errorResponse(res, 409, "Out of stock !");
        }

        const cart = await cartModel.findOne({ user: req.user._id });
        const item = cart?.items.find(item => item.product.toString() === productId);

        if (item) {

            const indexOfItem = cart.items.findIndex(item => item.product.toString() === product._id.toString());
            const itemCount = cart.items[indexOfItem].quantity + quantity;

            if (itemCount > product.stock) {
                return errorResponse(res, 400, `Invalid quantity, product stock is ${product.stock} more left !`);
            }

            const price = product.currentPrice * itemCount;

            cart.items[indexOfItem].quantity = itemCount;
            cart.items[indexOfItem].price = price;
            cart.totalPrice = cart.items.reduce(
                (sum, item) => sum + item.price,
                0
            );

            await cart.save();

            return successResponse(res, 200, "Product added to cart successfully.");
        }

        if (cart) {
            if (quantity > product.stock) {
                return errorResponse(res, 400, `Invalid quantity, product stock is ${product.stock} more left !`);
            }

            const price = product.currentPrice * quantity;

            const item = { product: product._id, quantity, price };

            cart.items.push(item);
            cart.totalPrice = cart.items.reduce(
                (sum, item) => sum + item.price,
                0
            );
            await cart.save();

            return successResponse(res, 200, "Product added to cart successfully.");
        }

        if (quantity > product.stock) {
            return errorResponse(res, 400, `Invalid quantity, product stock is ${product.stock} more left !`);
        }

        const price = product.currentPrice * quantity;

        const newCart = await cartModel.create({
            user: req.user._id,
            items: [
                { product: product._id, quantity, price }
            ],
            totalPrice: price
        });

        return successResponse(res, 201, "Product added to cart successfully.");

    } catch (err) {
        next(err);
    }
};

exports.emptyCart = async (req, res, next) => {
    try {
        const cart = await cartModel.findOneAndDelete({ user: req.user._id });
        if (!cart) {
            return errorResponse(res, 409, "Cart is already empty !");
        }

        return successResponse(res, 200, "Cart got empty successfully.");
    } catch (err) {
        next(err);
    }
};

exports.changeQuantity = async (req, res, next) => {
    try {
        const { action, amount } = req.body;
        const { productId } = req.params;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, "Invalid objectId !")
        }

        const product = await productsModel.findById(productId);
        if (!product) {
            return errorResponse(res, 404, "No product found with this ID !");
        }

        const cart = await cartModel.findOne({ user: req.user._id, "items.product": productId });

        if (!cart) {
            return errorResponse(res, 404, "This product is not in user's cart !");
        }

        if (action === "increase") {
            const indexOfItem = cart.items.findIndex(item => item.product.toString() === productId);
            const totalAmount = cart.items[indexOfItem].quantity + amount;
            if (totalAmount > product.stock) {
                return errorResponse(res, 400, `Invalid quantity, product stock is ${product.stock} more left !`);
            }

            const price = product.currentPrice * totalAmount;

            cart.items[indexOfItem].quantity = totalAmount;
            cart.items[indexOfItem].price = price;
            cart.totalPrice = cart.items.reduce(
                (sum, item) => sum + item.price,
                0
            );

            await cart.save();

            return successResponse(res, 200, "Product quantity increased successfully.");
        } else if (action === "decrease") {
            const indexOfItem = cart.items.findIndex(item => item.product.toString() === productId);
            const totalAmount = cart.items[indexOfItem].quantity - amount;

            if (totalAmount <= 0) {
                const cartItems = cart.items.filter(item => item.product.toString() !== productId);

                if (cartItems.length === 0) {
                    await cartModel.deleteOne({ user: req.user._id });

                    return successResponse(res, 200, "Cart got empty successfully.");
                } else {
                    cart.items = cartItems;
                    cart.totalPrice = cart.items.reduce(
                        (sum, item) => sum + item.price,
                        0
                    );

                    await cart.save();
                }

                return successResponse(res, 200, "Product got removed from cart successfully");
            }

            const price = product.currentPrice * totalAmount;

            cart.items[indexOfItem].quantity = totalAmount;
            cart.items[indexOfItem].price = price;
            cart.totalPrice = cart.items.reduce(
                (sum, item) => sum + item.price,
                0
            );

            await cart.save();
            return successResponse(res, 200, "Product quantity decreased successfully.");
        } else {
            return errorResponse(res, 400, "Invalid action !");
        }
    } catch (err) {
        next(err);
    }
}

exports.removeProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, "Invalid objectId !")
        }

        const product = await productsModel.findById(productId);
        if (!product) {
            return errorResponse(res, 404, "No product found with this ID !");
        }

        const cart = await cartModel.findOne({ user: req.user._id, "items.product": product._id });
        if (!cart) {
            return errorResponse(res, 404, "Product is not in user's cart !");
        }

        const cartItems = cart.items.filter(item => item.product.toString() !== productId);

        if (cartItems.length === 0) {
            await cartModel.deleteOne({ user: req.user._id });
        } else {
            cart.items = cartItems;

            await cart.save();
        }

        return successResponse(res, 200, "Product removed from cart successfully.");
    } catch (err) {
        next(err);
    }
};



///////// Orders

/// admins
exports.adminShowAll = async (req, res, next) => {
    try {
        const orders = await ordersModel
            .find({})
            .populate("user", "firstname lastname username phone")
            .populate("items.product", "title")
            .lean();

        if (orders.length === 0) {
            return errorResponse(res, 404, "No available order was found !");
        }

        return successResponse(res, 200, "Orders retrieved successfully.", orders);
    } catch (err) {
        next(err);
    }
};

exports.adminGetOne = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !")
        }

        const order = await ordersModel
            .findById(id)
            .populate("user", "firstname lastname username phone")
            .populate("items.product", "title")
            .lean();

        if (!order) {
            return errorResponse(res, 404, "No order was found with this Id !");
        }

        return successResponse(res, 200, "Order retrieved successfully.", order);
    } catch (err) {
        next(err);
    }
};

exports.changeStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !")
        }

        const order = await ordersModel.findById(id);

        if (!order) {
            return errorResponse(res, 404, "No order was found with this Id !");
        }

        if (order.orderStatus === "CANCELLED") {
            return errorResponse(res, 400, "Order has been cancelled !");
        }

        if (order.paymentStatus !== "PAID") {
            return errorResponse(res, 400, "Order hasn't been paid yet !");
        }

        order.orderStatus = status;
        await order.save();

        return successResponse(res, 200, "Order status updated successfully.");
    } catch (err) {
        next(err);
    }
};


/// costumers
exports.showAll = async (req, res, next) => {
    try {
        const orders = await ordersModel
            .find({ user: req.user._id })
            .populate("user", "firstname lastname username phone")
            .populate("items.product", "title")
            .lean();

        if (orders.length === 0) {
            return errorResponse(res, 404, "No available order was found !");
        }

        return successResponse(res, 200, "Orders retrieved successfully.", orders);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { addressTitle } = req.body;

        const cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            return errorResponse(res, 404, "User cart is empty !");
        }

        const isExists = await ordersModel.findOne({ user: req.user._id, items: cart.items });
        if (isExists && isExists.address.title === addressTitle && isExists.orderStatus !== "CANCELLED") {
            return errorResponse(res, 409, "An order for these items already exists !");
        }

        const orderOnPending = await ordersModel.findOne({ user: req.user._id, orderStatus: "PENDING", paymentStatus: "PENDING" });
        if (orderOnPending) {
            if (addressTitle === orderOnPending.address.title) {
                orderOnPending.items = cart.items;
                orderOnPending.totalPrice = cart.totalPrice;

                await orderOnPending.save();

                return successResponse(res, 200, "Order updated successfully.", orderOnPending);
            }
        }

        const address = req.user.addresses.find(item => item.title === addressTitle);
        if (!address) {
            return errorResponse(res, 404, "No address found with this title !");
        }

        const obj = address.toObject();
        Reflect.deleteProperty(obj, "_id");


        const order = await ordersModel.create({
            user: req.user._id,
            items: cart.items,
            address: obj,
            totalPrice: cart.totalPrice
        });

        await cartModel.deleteOne({ _id: cart._id });

        return successResponse(res, 201, "Order created successfully.", order);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !")
        }

        const order = await ordersModel
            .findById(id)
            .populate("user", "firstname lastname username phone")
            .populate("items.product", "title")
            .lean();

        if (!order) {
            return errorResponse(res, 404, "No order was found with this Id !");
        }

        return successResponse(res, 200, "Order retrieved successfully.", order);
    } catch (err) {
        next(err);
    }
};

exports.cancel = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !")
        }

        const order = await ordersModel.findById(id);
        if (!order) {
            return errorResponse(res, 404, "No order was found with this Id !");
        }

        if (order.user !== req.user._id && req.user.role === "USER") {
            return errorResponse(res, 403, "User not allowed !");
        }


        if (order.orderStatus === "CANCELLED") {
            return errorResponse(res, 409, "Order already been cancelled !");
        }

        if (order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED") {
            return errorResponse(res, 403, "Order can not be cancelled !");
        }

        if (order.paymentStatus === "PAID") {
            order.paymentStatus = "REFUNDED";

            const items = order.items;
            items.forEach(async (item) => {
                await productsModel.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
            });
        }

        order.orderStatus = "CANCELLED"
        await order.save();

        return successResponse(res, 200, "Order got cancelled successfully.");
    } catch (err) {
        next(err);
    }
};

exports.pay = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Invalid objectId !")
        }

        const order = await ordersModel.findById(id);
        if (!order) {
            return errorResponse(res, 404, "No order was found with this Id !");
        }

        if (order.user._id.toString() !== req.user._id.toString() && req.user.role === "USER") {
            return errorResponse(res, 403, "User not allowed !");
        }

        if (order.orderStatus === "CANCELLED") {
            return errorResponse(res, 400, "Order has been cancelled !");
        }

        if (order.paymentStatus === "PAID") {
            return errorResponse(res, 409, "Order already been paid !");
        }


        const items = order.items;
        items.forEach(async (item) => {
            await productsModel.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, sold: item.quantity } });
        });


        order.paymentStatus = "PAID";
        order.orderStatus = "PROCESSING";
        await order.save();

        return successResponse(res, 200, "Order got paid successfully.");
    } catch (err) {
        next(err);
    }
};

const express = require("express");
const configs = require("./configs");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const morgan = require("morgan");
const cors = require("cors");

const { errHandler } = require("./v1/middlewares/errorHandler");
const { setHeaders } = require("./v1/middlewares/setHeaders");

const authRouter = require("./v1/modules/auth/auth.routes");
const usersRouter = require("./v1/modules/users/users.routes");
const categoriesRouter = require("./v1/modules/categories/categories.routes");
const productsRouter = require("./v1/modules/products/products.routes");
const ordersRouter = require("./v1/modules/orders/orders.routes");
const commentsRouter = require("./v1/modules/comments/comments.routes");
const docsRouter = require("./v1/modules/docs/docs.routes");

const app = express();

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

app.use(cookieParser());
app.use(setHeaders);
app.use(cors());
app.use(morgan("dev"));
app.use(
    session({
        secret: configs.session_secret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    }),
);

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/docs", docsRouter);

app.use((req, res, next) => {
    return res.status(404).json({
        status: "404 Not Found",
        message: "Route not found",
    });
});

app.use(errHandler);

module.exports = app;
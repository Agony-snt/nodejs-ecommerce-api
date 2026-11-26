require("dotenv").config();

module.exports = {
    port: process.env.PORT,
    mongodb: process.env.MONGO_URI,
    auth: {
        access_secret: process.env.ACCESS_TOKEN_SECRET,
        access_expTime: process.env.ACCESS_EXPIRE_TIME,
        refresh_secret: process.env.REFRESH_TOKEN_SECRET,
        refresh_expTime: process.env.REFRESH_EXPIRE_TIME,
    },
    session_secret: process.env.SESSION_SECRET,
    node_environment: process.env.NODE_ENV,
};

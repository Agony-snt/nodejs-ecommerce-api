const jwt = require('jsonwebtoken');
const configs = require("../../configs");

const generateAccessToken = (phone) => {
    return jwt.sign({ phone }, configs.auth.access_secret, { expiresIn: configs.auth.access_expTime });
};

const generateRefreshToken = (phone) => {
    return jwt.sign({ phone }, configs.auth.refresh_secret, { expiresIn: configs.auth.refresh_expTime });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
};
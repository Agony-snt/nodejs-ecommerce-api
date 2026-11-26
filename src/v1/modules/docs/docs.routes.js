const express = require('express');
const swaggerUI = require('swagger-ui-express');

const swaggerDoc = require('./swagger.json');

const router = express.Router();

router.use(swaggerUI.serve);
router.use(swaggerUI.setup(swaggerDoc, {}));

module.exports = router;
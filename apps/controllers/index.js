const router = require("express").Router();

router.use(process.env.SECURITY_ADMIN_PATH, require(__dirname + "/admin"));
router.use(process.env.SECURITY_CLIENT_PATH, require(__dirname + "/api-client"));

module.exports = router;
const router = require("express").Router();
const users = require("./users")
const pins = require("./pins")
router.use("/users", users);
router.use("/pins", pins);
module.exports = router;
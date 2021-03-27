const router = require("express").Router();
const users = require("./users")
const pins = require("./pins")
const comments = require("./comments/index");
const notification = require("./notifications/index");

router.use("/comments", comments);
router.use("/notification", notification);
router.use("/users", users);
router.use("/pins", pins);
module.exports = router;
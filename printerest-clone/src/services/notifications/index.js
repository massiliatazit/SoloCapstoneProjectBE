const express = require("express");

const { authorize } = require("../midllewares");

const Notification = require("./shema");

const route = express.Router();

const q2m = require("query-to-mongo");
route.get("/", authorize, async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await Notification.countDocuments({ to: req.user._id });
    const notification = await Notification.find({ to: req.user._id })
      .sort({ createdAt: -1 })
      .skip(query.options.skip)
      .limit(query.options.limit)
      .populate(
        "from",
        "-password -refreshTokens -email -followers -following -saved"
      );

    const links = query.links("/notification", total);
    res.status(200).send({ notification, total, links });
  } catch (error) {
    next(error);
  }
});
route.post("/view/:id", authorize, async (req, res, next) => {
  try {
    //set viewd true and return ok true
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { viewed: true },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    notification && res.send(201).send({ notification, ok: true });
  } catch (error) {
    next(error);
  }
});
module.exports = route;

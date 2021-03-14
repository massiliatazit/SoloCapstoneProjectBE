const express = require("express");
const PinModel = require("../db/PinsSchema");
const { authorize } = require("../midllewares");
const UserSchema = require("../db/UsersSchema");
const pinRoute = express.Router();
pinRoute.post("/", authorize, async (req, res, next) => {
  try {
    const newPin = new PinModel({ ...req.body, user: req.user._id });
    const savedPin = await newPin.save();
    if (req.body.saved) {
      await UserSchema.findByIdAndUpdate(
          userID, {
        $push: {
          saved: savedPin._id,
        },
        
      },
      {
        new: true,
        useFindAndModify: false,
      });
    }
    res.status(201).send({ pin: savedPin.populate("user"), ok: true });
  } catch (error) {}
});
module.exports = pinRoute;

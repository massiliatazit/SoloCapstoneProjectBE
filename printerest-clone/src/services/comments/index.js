const express = require("express");
const mongoose = require("mongoose");
const { authorize } = require("../midllewares");
const CommentSchema = require("./schema");
const route = express.Router();
const PinModel = require ("../db/PinsSchema")
route.post("/:pin", authorize, async (req, res, next) => {
    try {
      //when pining a comment get the pin and add notification to the pin owner
      const newComment = new Comment({ ...req.body, pin: req.params.pin, user: req.user._id });
      const { _id } = await newComment.save();
      const pin = await PinModel.findByIdAndUpdate(req.params.pin, { $push: { comments: _id } }, { runValidators: true, new: true }).populate(
        "user",
        "-password -refreshTokens -email -followers -following -saved -puts -tagged -pins"
      );
  
    //   const notification = new Notification({ from: req.user._id, to: pin.user._id, pin: req.params.pin, action: "left a comment" });
    //   await notification.save();
  
      res.status(201).send(pin);
    } catch (error) {
      next(error);
    }
  });
route.get("/:pin", authorize, async (req, res, next) => {
    try {
      const comments = await CommentSchema.find({ pin: req.params.pin }).populate("user", "-password -refreshTokens -email -followers -following -saved");
      res.status(201).send(comments);
    } catch (error) {
      next(error);
    }
  });
route.put("/:id", authorize, async (req, res, next) => {
    try {
      const updatedComment = await CommentSchema.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
        runValidators: true,
        new: true,
        useFindAndModify: false,
      }).populate("user", "-password -refreshTokens -email -followers -following -saved");
      if (updatedComment) res.status(201).send(updatedComment);
      else res.status(401).send("User not Authorized");
    } catch (error) {
      next(error);
    }
  });
route.delete("/:id", authorize, async (req, res, next) => {
    try {
      await CommentSchema.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      res.status(200).send("DELETED");
    } catch (error) {
      next(error);
    }
  });
  module.exports = route;
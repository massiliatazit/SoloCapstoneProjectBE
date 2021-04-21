const express = require("express");
const StoryModel = require("./schema");
const { authorize } = require("../midllewares");
const UserSchema = require("../db/UsersSchema");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../cloudinary")

const multer = require("multer");

const uniqid = require("uniqid");
  const storageVideo = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "pins",
      resource_type: "video",
      public_id: (req, file) => uniqid(req.user.username, "_stories"),
    },
  });
  const parserVideo = multer({ storage: storageVideo });
  
route.post("/", authorize, async (req, res, next) => {
    try {
      const newStory = new StoryModel({ ...req.body, user: req.user._id });
      await newStory.save();
      res.status(201).send(newStory._id);
    } catch (error) {
      next(error);
    }
  });
  route.put("/:id/media", authorize, parserVideo.single("video"), async (req, res, next) => {
    try {
      const modifiedStory = await StoryModel.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        {  video: req.file.fieldname === "video" && req.file.path },
        {
          runValidators: true,
          new: true,
          useFindAndModify: false,
        }
      );
      res.status(201).send(modifiedStory.populate("user", "-password -refreshTokens -email -followers -following -saved "));
    } catch (error) {
      next(error);
    }
  });
  
  route.get("/", authorize, async (req, res, next) => {
    try {
      const query = req.user.following.map((followed_user) => {
        return { user: followed_user };
      });
  
      const newStory = await StoryModel.find({ exclude: { $nin: [req.user._id] }, $or: [...query, { user: req.user._id }] }).populate(
        "user",
        "-password -refreshTokens -email -followers -following -saved"
      );
      res.status(201).send(newStory);
    } catch (error) {
      next(error);
    }
  });
  
  route.get("/:userId", authorize, async (req, res, next) => {
    try {
      const stories = await StoryModel.find({ user: req.params.userId, exclude: { $nin: [req.user._id] } }).populate("user", "-password -refreshTokens -email -followers -following -saved -posts -tagged");
      res.status(200).send(stories);
    } catch (error) {
      next(error);
    }
  });
  
  route.put("/:id", authorize, async (req, res, next) => {
    try {
      const modifiedStory = await StoryModel.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
        runValidators: true,
        new: true,
        useFindAndModify: false,
      });
  
      res.status(200).send(modifiedStory.populate("user", "-password -refreshTokens -email -followers -following -saved "));
    } catch (error) {
      next(error);
    }
  });
  
  route.delete("/:id", authorize, async (req, res, next) => {
    try {
      await StoryModel.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      res.status(200).send("DELETED");
    } catch (error) {
      next(error);
    }
  });
  module.exports = route;
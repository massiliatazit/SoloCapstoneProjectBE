const express = require("express");
const StoryModel = require("./schema");
const { authorize } = require("../midllewares");
const UserSchema = require("../db/UsersSchema");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../cloudinary")
const route = express.Router();
const multer = require("multer");

const uniqid = require("uniqid");
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "pins",
      format: async (req, file) => "png" || "jpg",
      public_id: (req, file) => req.user.username + "_stories",
      //transformation: [{ width: 400, height: 400, gravity: "face", crop: "fill" }],
    },
  });
  const storageVideo = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "pins",
      resource_type: "video",
      public_id: (req, file) => uniqid(req.user.username, "_stories"),
    },
  });
  const parserVideo = multer({ storage: storageVideo });
  const parserImage = multer({ storage: storage });
route.post("/", authorize, async (req, res, next) => {
    try {
      const newStory = new StoryModel({ ...req.body, user: req.user._id });
      await newStory.save();
      res.status(201).send(newStory._id);
    } catch (error) {
      next(error);
    }
  });
  route.put("/:id/media", authorize, parserImage.single("image"), async (req, res, next) => {
    try {
      const modifiedStory = await StoryModel.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        {$push: {images: req.file.path}}
        // , video: req.file.fieldname === "video" && req.file.path },
      
        // {
        //   runValidators: true,
        //   new: true,
        //   useFindAndModify: false,
        // }
      );
      const story = await StoryModel.findOneAndUpdate({ _id: req.params.id,  user: req.user._id},{ $push: {images: req.file.path}}).populate("user", "-password -refreshTokens -email -followers -following -saved ")
      console.log(story)
      res.status(201).send(story);
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
  route.get("/:storyId", authorize, async (req, res, next)=>{
    try { const story = await StoryModel.findById(req.params.storyId).populate("user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts");
    if(story._id){
      res.status(201).send(story);
    }else {
      const error = new Error("Story not found");
      error.status = 404;
      next(error);
    }
      
    } catch (error) {
      next(error);
      
    }
  
  })
  
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
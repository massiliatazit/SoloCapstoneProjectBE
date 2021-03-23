const express = require("express");
const PinModel = require("../db/PinsSchema");
const { authorize } = require("../midllewares");
const UserSchema = require("../db/UsersSchema");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../cloudinary")

const multer = require("multer");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pins",
    format: async (req, file) => "png" || "jpg",
    public_id: (req, file) => req.user.username + "_profile",
    transformation: [{ width: 400, height: 400, gravity: "face", crop: "fill" }],
  },
});

const cloudinaryMulter = multer({ storage: storage });
const pinRoute = express.Router();

//create saved pins
pinRoute.post("/", authorize, async (req, res, next) => {
  try {
    const newPin = new PinModel({ ...req.body, owner: req.user._id });
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
    res.status(201).send({ pin: {...savedPin._doc,owner:req.user}, ok: true });
  } catch (error) {
    console.log(error);
  }
});

pinRoute.get("/:username",authorize,async (req, res, next)=>{

  try {
    if (req.user.username === req.params.username){
      const UserPins = await PinModel.find({owner:req.user._id} )
      if(UserPins){
        res.send(200).send(UserPins)

      }else{
        res.send(404).send("no pins for this user yet")
      }
    }else{

      res.send(404).send("this user doesn't exist")
    }
 
  } catch (error) {
    console.log(error)
    next(error)
    
  }
})


pinRoute.put("/:id/picture", authorize, cloudinaryMulter.single("image"), async (req, res, next) => {
  try {
    const updatedPin = await PinModel.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { images: req.file.path }, { runValidators: true, new: true })
      // .populate("comments.user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts")
      
      .populate("user", "-password -refreshTokens -email -followers -following -saved ");

    res.send(updatedPin);
  } catch (error) {
    next(error);
  }
});

module.exports = pinRoute;

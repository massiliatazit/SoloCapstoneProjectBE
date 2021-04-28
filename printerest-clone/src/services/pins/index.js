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
        res.status(200).send(UserPins)

      }else{
        res.status(404).send("no pins for this user yet")
      }
    }else{

      res.status(404).send("this user doesn't exist")
    }
 
  } catch (error) {
    console.log(error)
    next(error)
    
  }
})



pinRoute.put("/:id/picture", authorize, cloudinaryMulter.single("image"), async (req, res, next) => {
  try {
  
    const updatedPin = await PinModel.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { images: req.file.path }, { runValidators: true, new: true })
      
      
        .populate("user", "-password -refreshTokens -email -followers -following -saved -username ");
     console.log("here media",updatedPin)
    res.send(updatedPin);
  } catch (error) {
    next(error);
  }
});
pinRoute.delete("/:id", authorize, async function (req, res, next) {
  try {
    const todelete = await PinModel.findOne({ _id: req.params.id, owner: req.user._id })
    console.log(todelete)
    await PinModel.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.status(201).send({ ok: true });
  } catch (error) {
    next(error);
    console.log(error);
  }
});

module.exports = pinRoute;

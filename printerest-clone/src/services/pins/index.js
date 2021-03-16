const express = require("express");
const PinModel = require("../db/PinsSchema");
const { authorize } = require("../midllewares");
const UserSchema = require("../db/UsersSchema");

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
    res.status(201).send({ pin: savedPin.populate("user"), ok: true });
  } catch (error) {
    console.log(error);
  }
});

pinRoute.get("/:username",authorize,async (req, res, next)=>{

  try {
    if (req.user.username === req.params.username){
      const UserPins = await PinModel.findOne({pinnedBy:req.user} )
      res.send(200).send(UserPins)
    }else{

      res.send(404).send("no pins pinned by this user yet")
    }
 
  } catch (error) {
    console.log(error)

    
  }
})
module.exports = pinRoute;

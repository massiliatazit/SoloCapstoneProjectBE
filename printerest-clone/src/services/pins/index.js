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

// postRouter.put("/:id", authorize, async function (req, res, next) {
//   try {
//     const updatedPin= await PinModel.findOneAndUpdate({ _id: req.params.id, user: req.user }, req.body);

//     if (updatedPin) {
//       req.body.tags.forEach(async (userID) => {
//         const user = await UserSchema.findOne({ _id: userID, tagged: req.params.id });
//         user
//           ? await UserSchema.findByIdAndUpdate(
//               userID,
//               {
//                 $pull: { tagged: sevedPost._id },
//               },
//               {
//                 new: true,
//                 useFindAndModify: false,
//               }
//             )
//           : await UserSchema.findByIdAndUpdate(
//               userID,
//               {
//                 $push: { tagged: sevedPost._id },
//               },
//               {
//                 new: true,
//                 useFindAndModify: false,
//               }
//             );
//         if (!user) {
//           notification = new Notification({ from: req.user._id, to: userID, post: updated._id, action: "tagged you" });
//           await notification.save();
//         }
//       });
//     }
//     res.send(updated);
//   } catch (error) {
//     next(error);
//   }
// });
module.exports = pinRoute;

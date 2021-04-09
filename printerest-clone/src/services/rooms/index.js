const express = require("express");
const {
    authenticate,
   
    
  } = require("../midllewares/tools");

const RoomModel = require("./schema");

const roomRouter = express.Router();

//CREATE ROOM
roomRouter.post("/", authenticate, async (req, res, next) => {
  try {
    const newRoom = await new RoomModel(req.body);
    const { _id } = await newRoom.save();
    res.status(201).send({ message: _id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});





roomRouter.get("/", authenticate, async (req, res, next) => {
  try {
    const allRooms = await RoomModel.find().populate({
      path: "participants",
      populate: {
        path: "user",
        model: "user",
      },
    });
    res.send(allRooms);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET ROOM BY ID
roomRouter.get("/:id", authenticate, async (req, res, next) => {
  try {
    const singleRoom = await RoomModel.findById(req.params.id);
    if (singleRoom) {
      res.send(singleRoom);
    } else {
      res.status(404).send({ message: "Could not find a room with this id" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//ADD USER TO ROOM AND VIS-VERSA
roomRouter.put(
  "/:roomId/add-user/:userId",
  authenticate,
  async (req, res, next) => {
    console.log(req.user._id);
    console.log(req.params.userId);
    try {
      if (req.user._id.toString() === req.params.userId) {
        await RoomModel.addUserToRoom(req.params.userId, req.params.roomId);
        await UserModel.addRoomToUser(req.params.userId, req.params.roomId);
        res.send({ message: "authorized" });
      } else {
        res.status(401).send({ message: "This is not your account!" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);



module.exports = roomRouter;
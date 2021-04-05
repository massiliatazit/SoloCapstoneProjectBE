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





module.exports = roomRouter;
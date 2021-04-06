const MessageModel = require("../services/messages/schema");
const RoomModel = require("../services/messages/schema");

const addUserSocketToRoom = async (data, socketId) => {
  try {
    await RoomModel.findOneAndUpdate(
      {
        _id: data.roomId,
        "participants.user": data.userId,
      },
      { "participants.$.socketId": socketId }
    );
  } catch (error) {
    console.log(error);
  }
};

const removeUserSocketFromRoom = async (data) => {
  try {
    await RoomModel.findOneAndUpdate(
      {
        _id: data.roomId,
        "participants.user": data.userId,
      },
      { "participants.$.socketId": "" }
    );
  } catch (error) {
    console.log(error);
  }
};

const getUsersInRoom = async (roomId) => {
  try {
    const room = await RoomModel.findById(roomId);
    return room.participants;
  } catch (error) {
    console.log(error);
  }
};

const addMessageToRoom = async (data) => {
  try {
    await RoomModel.findByIdAndUpdate(data.roomId, {
      $push: {
        chatHistory: {
          sender: data.sender,
          text: data.text,
          createdAt: data.createdAt,
          attachment: data.attachment,
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
};



module.exports = {
  addUserSocketToRoom,
  getUsersInRoom,
  removeUserSocketFromRoom,
  addMessageToRoom,

};
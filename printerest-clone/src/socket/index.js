const MessageModel = require("../services/messages/schema");
const RoomModel = require("../services/rooms/schema");

const addUserSocketToRoom = async (data, socket,io) => {
  try {
    /** in data you either have roomId or participants */
    
   
    let room ;
    
    const {participants,userId} = data;
    room = await RoomModel.findOne({participants:{$all:[participants[0],userId]}})
    console.log("try to find room",room)
    if(room===null){

      console.log("creating room")
      console.log(participants)
      /**  if there is no roomId create one with given participants add yourself to room
       * 
        */
      room = await new RoomModel({participants:[...participants,userId]}).save()
      
    }
  

    // join to the room
    socket.join(room._id)

    // populate participant so you can get their socketId
    room = await RoomModel.findById(room._id).populate("participants")
    // make all participants join to the room
    room.participants.forEach ( (participant)=>{

      /**
       * but how do we make them join because we dont have their socket_
       *  io.sockets.connected = {
       *  "socketId":"socketObject"
       * }
       *   
       */
      const socketOfParticipant= io.sockets.connected[participant.socketId]
      if(socketOfParticipant){
        socketOfParticipant.join(room._id)
      }
    })
    console.log("everyone is joined to room ", room._id)
    io.to(room._id).emit("roomId",{roomId:room._id,chatHistory:room.chatHistory})
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
    console.log("adding")
    console.log(data)
    await RoomModel.findByIdAndUpdate(data.roomId, {
      $push: {
        chatHistory: {
          sender: data.sender,
          text: data.text,
          createdAt: new Date(),
          
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
};


const updateMySocketId = async (socket,data) => {
  try {
    const {_id} = data;
    await User.findByIdAndUpdate(_id,{socketId:socket.id})

    const allConversations = await RoomModel.find({participants:_id});
    allConversations.forEach(async(conversation)=>{
      socket.join(conversation._id)
    })
  } catch (error) {
    console.log("Socket Id is not updated")
  }
}


module.exports = {
  addUserSocketToRoom,
  getUsersInRoom,
  removeUserSocketFromRoom,
  addMessageToRoom,
  updateMySocketId
};
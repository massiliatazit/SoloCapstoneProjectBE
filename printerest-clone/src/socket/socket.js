const socketio = require("socket.io");
const {
  addUserSocketToRoom,
  getUsersInRoom,
  removeUserSocketFromRoom,
  addMessageToRoom,
  updateMySocketId,
} = require("./index");
const createSocketServer = (server) => {
  // create to server
  const io = socketio(server);
  io.on("connection", (socket) => {
    console.log(`New socket connection --> ${socket.id}`);

    socket.on("JOIN_ROOM", async (data) => {
      try {
        console.log("joined to room");
        // socket.join(data.roomId);

        await addUserSocketToRoom(data, socket, io);
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("LEAVE_ROOM", async (data) => {
      try {
        socket.leave(data.roomId);

        await removeUserSocketFromRoom(data, socket.id);

        const offlineMessage = {
          sender: "Nazz: double nazz",
          text: `${data.username} is now offline`,
          createdAt: new Date(),
          
        };

        socket.to(data.roomId).broadcast.emit("CHAT_MESSAGE", offlineMessage);

        const userList = await getUsersInRoom(data.roomId);
        io.to(data.roomId).emit("roomData", {
          room: data.roomId,
          list: userList,
        });
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("CHAT_MESSAGE", async (data) => {
      await addMessageToRoom(data);
      socket.to(data.roomId).emit("CHAT_MESSAGE", data);
        console.log("message received")
    });
    socket.on("SET_ONLINE", (data) => updateMySocketId(socket, data));
  });
};
module.exports = createSocketServer;

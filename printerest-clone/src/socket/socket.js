const socketio = require('socket.io')
const {
    addUserSocketToRoom,
    getUsersInRoom,
    removeUserSocketFromRoom,
    addMessageToRoom,
   
  } = require ("./index")
const createSocketServer = server => {// create to server
    const io = socketio(server)
io.on("connection",(socket)=>{
console.log(`New socket connection --> ${socket.id}`)
socket.on("JOIN_ROOM", async (data) => {
    try {
      socket.join(data.roomId);

      await addUserSocketToRoom(data, socket.id);

      const onlineMessage = {
        sender: "Nazz: double nazz",
        text: `${data.username} is now online`,
        createdAt: new Date(),
      };

      socket.to(data.roomId).broadcast.emit("CHAT_MESSAGE", onlineMessage);

      const userList = await getUsersInRoom(data.roomId);
      io.to(data.roomId).emit("roomData", {
        room: data.roomId,
        list: userList,
      });
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
  });

})

}
    module.exports =createSocketServer;
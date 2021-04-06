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
socket.on("join",({name,room})=>{
    console.log(name,room)
})
socket.on("disconnect",()=>{
    console.log("user left chat")
})
})
}
    module.exports =createSocketServer;
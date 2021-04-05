const socketio = require('socket.io')
const createSocketServer = server => {// create to server
    const io = socketio(server)
io.on("connection",(socket)=>
console.log(`New socket connection --> ${socket.id}`)
)}
    module.exports =createSocketServer
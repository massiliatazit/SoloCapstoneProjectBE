const socketio = require('socket.io')
const createSocketServer = server => {// create to server
    const io = socketio(server)}
    module.exports =createSocketServer
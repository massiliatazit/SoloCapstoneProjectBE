const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const {join} = require('path')
const server = express()
const socketio = require('socket.io')
 const http = require('http')
const httpServer = http.createServer(server)
createSocketServer(httpServer)
const serviceRouters = require('./services')
const passport = require("passport");
const oauth = require("./services/midllewares/oauth");
const { notFoundHandler, forbiddenHandler, badRequestHandler, genericErrorHandler } = require("./errorHandlers");
const port = process.env.PORT ||7000 
const staticFolderPath = join(__dirname, '../public')

server.use(express.static(staticFolderPath))
server.use(express.json())

const whitelist = [process.env.FE_URL];
const corsOptions = {
    origin: (origin, callback) => {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  };
  server.use(cors(corsOptions));
server.use(passport.initialize());
server.use("/", serviceRouters);
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(forbiddenHandler);
server.use(genericErrorHandler);
mongoose.connect(process.env.MONGO_CONNECTION,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
  
}).then(httpServer.listen(port,()=>{
    console.log("Running on port", port,)
})).catch(err=>console.log(err))

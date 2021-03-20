const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, {
  cors: {
    origin: "*",
  },
});
const rooms = {};
const roomsToHost = {};
const hostToRoom = {};
io.on("connection", (socket) => {
  socket.on("join room", (roomID) => {
    if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
    } else {
      rooms[roomID] = [socket.id];
      roomsToHost[roomID] = socket.id;
      hostToRoom[socket.id] = roomID;
    }
    if (hostToRoom[socket.id] !== roomID) {
      io.to(roomsToHost[roomID]).emit("send clint id to host", {
        id: socket.id,
      });
    }
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user join", {
      hostSignal: payload.signal,
      hosTfId: payload.callerID,
    });
  });
  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });
});
server.listen(process.env.PORT || 5000, () => {
  console.log("The port 5000 is ready to start.");
});

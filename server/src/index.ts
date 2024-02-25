import express from "express";
import { Server } from "socket.io";
const PORT = process.env.PORT || 3500;

const app = express();

const server = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === `production`
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id.substring(0, 5)} connected`);

  // Upon connection - only to user
  socket.emit("message", "Welcome to Chat App!");

  // Upon connection - to all others
  socket.broadcast.emit(
    "message",
    `${socket.id.substring(0, 5)} has joined the chat!`
  );

  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", `${data}`);
  });

  socket.on("activity", (data) => {
    socket.broadcast.emit("activity", `${data} is typing...`);
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

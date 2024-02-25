import { createServer } from "http";
import { Server } from "socket.io";

const server = createServer();
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === `production`
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", `${data}`);
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(3500, () => {
  console.log("listening on port 3500");
});

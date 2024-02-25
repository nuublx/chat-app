const ws = require("ws");
const buffer = require("buffer/").Buffer;

const server = new ws.Server({ port: "3000" }, () =>
  console.log("Server started ")
);

server.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (message) => {
    const b = buffer.from(message);
    console.log(b.toString());
    socket.send(`You said: ${message}`);
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

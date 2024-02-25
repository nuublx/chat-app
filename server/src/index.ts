import ws from "ws";

const server = new ws.Server({ port: 3000 }, () =>
  console.log("Server started ")
);

server.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (message) => {
    console.log(`Received: ${message}`);
    console.log(message.toString());
    socket.send(`You said: ${message}`);
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

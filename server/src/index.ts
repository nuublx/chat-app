import express from "express";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3500;
const ADMIN = "Admin";

const app = express();

const server = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
interface User {
  id: string;
  name: string;
  room: string;
}
// state
const UsersState = {
  users: [] as User[],
  setUsers: function (users: User[]) {
    this.users = users;
  },
};

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
  socket.emit("message", buildMsg(ADMIN, "Welcome to chat!"));

  socket.on("enterRoom", ({ name, room }) => {
    // leave previous room
    const prevRoom = getUser(socket.id)?.room;
    if (!!prevRoom) {
      socket.leave(prevRoom);
      io.to(prevRoom).emit(
        "message",
        buildMsg(ADMIN, `${name} has left the room`)
      );
    }
    const user: User = { id: socket.id, name: name, room: room };
    activateUser(user);
    // Cannot update previous room users list until after the state update in activate user
    if (prevRoom) {
      io.to(prevRoom).emit("userList", {
        users: getUsersInRoom(prevRoom),
      });
    }
    socket.join(user.room);

    // to user who joined
    socket.emit("message", buildMsg(ADMIN, `Welcome to ${room} room `));
    // to everyone
    socket.broadcast
      .to(user.room)
      .emit("message", buildMsg(ADMIN, `${name} has joined the room`));

    // update user list for room
    io.to(user.room).emit("userList", {
      users: getUsersInRoom(user.room),
    });

    // update rooms list for everyone
    io.emit("roomsList", {
      rooms: getAllActiveRooms(),
    });
  });

  socket.on(`close`, () => {
    const user = getUser(socket.id);
    if (!!user) {
      deactivateUser(user.id);
      io.to(user.room).emit(
        "message",
        buildMsg(ADMIN, `${user.name} has left the room`)
      );
      io.to(user.room).emit("userList", {
        users: getUsersInRoom(user.room),
      });

      io.emit("roomsList", {
        rooms: getAllActiveRooms(),
      });
    }
    console.log(`User ${socket.id} disconnected`);
  });

  socket.on("message", ({ name, text }) => {
    const room = getUser(socket.id)?.room;
    if (!!room) {
      io.to(room).emit("message", buildMsg(name, text));
    }
  });

  socket.on("activity", (name) => {
    const room = getUser(socket.id)?.room;
    if (!!room) {
      socket.broadcast.to(room).emit("activity", name);
    }
  });
});

function buildMsg(name: string, text: string) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}

// User functions
function activateUser(user: User) {
  UsersState.setUsers([
    ...UsersState.users.filter((u) => u.id !== user.id),
    user,
  ]);
}

function deactivateUser(id: string) {
  UsersState.setUsers(UsersState.users.filter((u) => u.id !== id));
}

function getUser(id: string) {
  return UsersState.users.find((u) => u.id === id);
}

function getUsersInRoom(room: string) {
  return UsersState.users.filter((u) => u.room === room);
}

function getAllActiveRooms() {
  return Array.from(new Set(UsersState.users.map((u) => u.room)));
}

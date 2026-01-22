import { Server } from "socket.io";

const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Frontend URL
      methods: ["GET", "POST"],
    },
  });

  const rooms = {}; // roomId -> Set of socket ids

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-call", (roomId, username) => {
      socket.join(roomId);

      if (!rooms[roomId]) rooms[roomId] = new Set();
      const otherUsers = Array.from(rooms[roomId]); // Existing users
      rooms[roomId].add(socket.id);

      // Send new user the list of existing users
      socket.emit("all-users", otherUsers);

      // Notify other users that a new user joined
      socket.to(roomId).emit("user-joined", socket.id, username);

      // Forward signaling data
      socket.on("signal", (toId, data) => {
        io.to(toId).emit("signal", socket.id, data);
      });

      // Chat messages
      socket.on("chat-message", (msg, sender) => {
        io.to(roomId).emit("chat-message", msg, sender);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        rooms[roomId].delete(socket.id);
        socket.to(roomId).emit("user-left", socket.id);
        console.log(`User disconnected: ${socket.id} from room ${roomId}`);
      });
    });
  });

  console.log("Socket.io server running...");
};

export default connectToSocket;

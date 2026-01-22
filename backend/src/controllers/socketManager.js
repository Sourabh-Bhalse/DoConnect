 import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://doconnectfrontend.onrender.com",
      methods: ["GET", "POST"],
    },
  });

  const rooms = {};

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("join-call", (roomId, username) => {
      socket.join(roomId);

      if (!rooms[roomId]) rooms[roomId] = new Set();
      const others = Array.from(rooms[roomId]);
      rooms[roomId].add(socket.id);

      socket.emit("all-users", others);
      socket.to(roomId).emit("user-joined", socket.id, username);

      socket.on("signal", (toId, data) => {
        io.to(toId).emit("signal", socket.id, data, username);
      });

      socket.on("chat-message", (msg, sender) => {
        io.to(roomId).emit("chat-message", msg, sender);
      });

      socket.on("disconnect", () => {
        rooms[roomId]?.delete(socket.id);
        socket.to(roomId).emit("user-left", socket.id);
      });
    });
  });

  console.log("✅ Socket.io ready");
};

export default connectToSocket;

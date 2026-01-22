 import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./src/routes/user.js";
import meetingRoutes from "./src/routes/meeting.js";
import connectToSocket from "./src/controllers/socketManager.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ CORS setup for local dev and production frontend
app.use(
  cors({
    origin: [
      "http://localhost:3000", // local frontend
      "https://doconnectfrontend.onrender.com", // production frontend
    ],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

// ✅ API routes
app.use("/api/user", userRoutes);
app.use("/api/meeting", meetingRoutes);

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

// ✅ Socket.io setup
connectToSocket(server);

// ✅ Listen on Render-provided port or local dev port
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

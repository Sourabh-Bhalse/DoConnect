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

// ✅ CORS
app.use(
  cors({
    origin: "https://doconnectfrontend.onrender.com",
    credentials: true,
  }),
);

app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/meeting", meetingRoutes);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

// Socket.io
connectToSocket(server);

// ✅ REQUIRED FOR RENDER
const PORT = process.env.PORT || 10000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

import express from "express";
import Meeting from "../models/meeting.js";
import verifyToken from "../middlewares/verifyToken.js"; // Middleware to verify JWT

const router = express.Router();

/**
 * @route   POST /api/meeting/save
 * @desc    Save a meeting to user history
 * @access  Protected
 */
router.post("/save", verifyToken, async (req, res) => {
  try {
    const { meetingCode } = req.body;
    const userId = req.user.id;

    if (!meetingCode) {
      return res.status(400).json({ message: "Meeting code is required" });
    }

    const meeting = new Meeting({ user: userId, meetingCode });
    await meeting.save();

    return res.status(200).json({ message: "Meeting saved successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/meeting/history
 * @desc    Get user's meeting history
 * @access  Protected
 */
router.get("/history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const meetings = await Meeting.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json(meetings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;

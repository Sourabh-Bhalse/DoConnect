import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    meetingCode: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Meeting", meetingSchema);

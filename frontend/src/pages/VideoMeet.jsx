import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  Button,
  IconButton,
  TextField,
} from "@mui/material";

import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ChatIcon from "@mui/icons-material/Chat";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import CloseIcon from "@mui/icons-material/Close";

import "../styles/VideoMeet.css";

const SERVER_URL = "http://localhost:3000";
const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

const VideoMeet = () => {
  const { url: roomId } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const peersRef = useRef({});
  const screenStreamRef = useRef(null);
  const chatEndRef = useRef(null);

  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/auth");
  }, [navigate, token]);

  // ========== MEDIA ==========
  const getUserMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    setLocalStream(stream);
    return stream;
  };

  // ========== PEER CONNECTION ==========
  const createPeer = (userId, stream, userName) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.ontrack = (e) => {
      setRemoteStreams(prev => {
        if (prev.find(p => p.id === userId)) return prev;
        return [...prev, { id: userId, username:userName, stream: e.streams[0] }];
      });
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("signal", userId, { type: "ice", candidate: e.candidate });
      }
    };

    peersRef.current[userId] = peer;
    return peer;
  };

  // ========== JOIN CALL ==========
  const joinCall = async () => {
    if (!username.trim()) return;
    setJoined(true);

    const stream = await getUserMedia();

    // Save meeting history backend
    await axios.post(
      `${SERVER_URL}/api/meeting/save`,
      { meetingCode: roomId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Connect socket
    socketRef.current = io(SERVER_URL, { auth: { token } });
    socketRef.current.emit("join-call", roomId, username);

    // When a new user joins
    socketRef.current.on("user-joined", async (userId,userName) => {
      if (userId === socketRef.current.id) return;
      const peer = createPeer(userId, stream, userName);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socketRef.current.emit("signal", userId, { type: "offer", sdp: offer });
    });

    // When receiving signaling data
    socketRef.current.on("signal", async (fromId, data, fromName) => {
      let peer = peersRef.current[fromId] || createPeer(fromId, stream, fromName);

      if (data.type === "offer") {
        await peer.setRemoteDescription(data.sdp);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socketRef.current.emit("signal", fromId, { type: "answer", sdp: answer });
      }

      if (data.type === "answer") {
        await peer.setRemoteDescription(data.sdp);
      }

      if (data.type === "ice") {
        await peer.addIceCandidate(data.candidate);
      }
    });

    // When a user leaves
    socketRef.current.on("user-left", (id) => {
      peersRef.current[id]?.close();
      delete peersRef.current[id];
      setRemoteStreams(prev => prev.filter(p => p.id !== id));
    });

    // Chat messages from others
    socketRef.current.on("chat-message", (msg, sender) => {
      if (sender === username) return; // ignore own messages
      setMessages(prev => [...prev, { sender, msg }]);
    });
  };

  // ========== CHAT ==========
  const sendMessage = () => {
    if (!chatMsg.trim()) return;

    // Add locally
    setMessages(prev => [...prev, { sender: username, msg: chatMsg }]);

    // Send to others
    socketRef.current.emit("chat-message", chatMsg, username, roomId);

    setChatMsg("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ========== SCREEN SHARE ==========
  const toggleScreenShare = async () => {
    if (!screenSharing) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      Object.values(peersRef.current).forEach(peer => {
        const sender = peer.getSenders().find(s => s.track?.kind === "video");
        sender?.replaceTrack(screenTrack);
      });

      localVideoRef.current.srcObject = screenStream;
      screenStreamRef.current = screenStream;
      setScreenSharing(true);

      screenTrack.onended = stopScreenShare;
    } else stopScreenShare();
  };

  const stopScreenShare = () => {
    const cameraTrack = localStream.getVideoTracks()[0];
    Object.values(peersRef.current).forEach(peer => {
      const sender = peer.getSenders().find(s => s.track?.kind === "video");
      sender?.replaceTrack(cameraTrack);
    });
    localVideoRef.current.srcObject = localStream;
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    setScreenSharing(false);
  };

  // ========== CONTROLS ==========
  const toggleMic = () => {
    const track = localStream.getAudioTracks()[0];
    track.enabled = !micOn;
    setMicOn(prev => !prev);
  };

  const toggleCamera = () => {
    const track = localStream.getVideoTracks()[0];
    track.enabled = !camOn;
    setCamOn(prev => !prev);
  };

  const leaveCall = () => {
    localStream?.getTracks().forEach(t => t.stop());
    socketRef.current?.disconnect();
    navigate("/home");
  };

  // ========== UI ==========
  if (!joined) {
    return (
      <div className="lobby">
        <h2>Join Meeting</h2>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button variant="contained" onClick={joinCall} sx={{ mt: 1 }}>
          Join
        </Button>
      </div>
    );
  }

  return (
    <div className="meeting-container">
      <div className={`main-area ${chatOpen ? "chat-open" : ""}`}>
        <div className="video-grid">
          <div className="video-card">
            <video ref={localVideoRef} autoPlay muted />
            <span className="username">{username}</span>
          </div>

          {remoteStreams.map(user => (
            <div key={user.id} className="video-card">
              <video ref={ref => ref && (ref.srcObject = user.stream)} autoPlay />
              <span className="username">{user.username}</span>
            </div>
          ))}
        </div>

        {chatOpen && (
          <div className="chat-panel">
            <div className="chat-header">
              Chat
              <IconButton size="small" onClick={() => setChatOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>

            <div className="messages">
              {messages.map((m, i) => (
                <div key={i} className={`message ${m.sender === username ? "me" : "other"}`}>
                  <span className="sender">{m.sender}</span>
                  <p>{m.msg}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input">
              <TextField
                fullWidth
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </div>
        )}
      </div>

      <div className="controls">
        <IconButton onClick={toggleMic}>{micOn ? <MicIcon /> : <MicOffIcon />}</IconButton>
        <IconButton onClick={toggleCamera}>{camOn ? <VideocamIcon /> : <VideocamOffIcon />}</IconButton>
        <IconButton onClick={toggleScreenShare}>{screenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}</IconButton>
        <IconButton onClick={() => setChatOpen(true)}><ChatIcon /></IconButton>
        <IconButton onClick={leaveCall} className="end-call"><CallEndIcon /></IconButton>
      </div>
    </div>
  );
};

export default VideoMeet;

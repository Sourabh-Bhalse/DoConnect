 import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const joinMeeting = () => {
    if (!code.trim()) return alert("Please enter a meeting code");
    navigate(`/${code}`);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Home</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="Enter Meeting Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ padding: "0.5rem", width: "200px" }}
        />
        <button onClick={joinMeeting} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
          Join
        </button>
      </div>

      <button
        onClick={() => navigate("/history")}
        style={{ padding: "0.5rem 1rem", background: "#3b6ec0", color: "white", border: "none", borderRadius: "5px" }}
      >
        Meeting History
      </button>
    </div>
  );
};

export default Home;

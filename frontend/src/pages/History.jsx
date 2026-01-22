 import axios from "axios";
import { useEffect, useState } from "react";
import server from "../environment";

const History = () => {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${server.prod}/api/meeting/history`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMeetings(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Meeting History</h2>
      {meetings.length === 0 && <p>No past meetings.</p>}
      <ul>
        {meetings.map((m) => (
          <li key={m._id}>{m.meetingCode}</li>
        ))}
      </ul>
    </div>
  );
};

export default History;

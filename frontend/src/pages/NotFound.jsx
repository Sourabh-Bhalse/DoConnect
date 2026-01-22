import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>404</h1>
      <p style={{ marginBottom: "2rem", color: "#555" }}>
        Oops! The page you are looking for does not exist.
      </p>
      <Button variant="contained" onClick={() => navigate("/")}>
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;

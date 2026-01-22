import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import server from "../environment";

const api = axios.create({
  baseURL: `${server.prod}/api/user`,
});

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser({ token });
  }, []);

  const handleRegister = async (data) => {
    try {
      const res = await api.post("/register", data);
      setMessage(res.data.message);
      return true;
    } catch (err) {
      setError(err.response?.data?.message);
      return false;
    }
  };

  const handleLogin = async (data) => {
    try {
      const res = await api.post("/login", data);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      navigate("/home");
      return true;
    } catch (err) {
      setError(err.response?.data?.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, handleLogin, handleRegister, error, setError, message }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

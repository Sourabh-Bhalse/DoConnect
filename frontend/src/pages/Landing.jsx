import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
 

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landingPageContainer">
      <nav className="navbar">
        <h2 className="logo">
          <img className="logoD" src="/favicon-32x32.png" alt="Logo" />
          Do<span>Connect</span>
        </h2>
        <div className="navList">
          <p onClick={() => navigate("/guest")}>Join as Guest</p>
        <p onClick={() => navigate("/auth")}>Register</p>
          <button className="loginBtn" onClick={() => navigate("/auth")}>
            Login
          </button>
        </div>
      </nav>

      <section className="landingMainContainer">
        <div className="content">
         <div className="heroText">
           <h1>
            <span>Connect</span> with your loved ones
          </h1>
          <p>Bringing people closer, anywhere by DoConnect</p>
           </div>
          <button className="ctaBtn" onClick={() => navigate("/auth")}>
            Get Started
          </button>
        
        </div>

        <div className="imageWrapper">
          {/* <img src="/mobile.png" alt="Mobile App Preview" /> */}
        </div>
      </section>
    </div>
  );
};

export default Landing;

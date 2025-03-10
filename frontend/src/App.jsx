import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./pages/home/home";
import Gym from "./pages/gym"
import SignIn from "./pages/userAuth";
import Profile from "./pages/profile/profile";
import "./index.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="gym/:gym" element={<Gym />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/profile" element={<Profile/>} />
      </Routes>
    </Router>
  );
}; 

export default App;

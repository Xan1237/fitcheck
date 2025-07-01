import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./pages/home/home";
import Gym from "./pages/gym"
import AddGym from "./pages/addGym/addGym";
import ContactUs from "./pages/contactUs/contactUs";
import SignIn from "./pages/userAuth";
import Profile from "./pages/profile/profile";
import PublicProfile from "./pages/publicProfile/PublicProfile"
import Feed from "./pages/feed/index";
import "./index.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/FindGym" element={<Home />} />
        <Route path="gym/:gym" element={<Gym />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/profile/:name" element={<PublicProfile/>}/>
        <Route path="/addGym" element={<AddGym />} />
        <Route path="/contactUs" element={<ContactUs/>} />
        <Route path="/" element={<Feed/>}/>

      </Routes>
    </Router>
  );
}; 

export default App;

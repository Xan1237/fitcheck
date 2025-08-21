import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import BottomNav from "./components/BottomNav";
import Home from "./pages/home/home";
import Gym from "./pages/gym"
import AddGym from "./pages/addGym/addGym";
import ContactUs from "./pages/contactUs/contactUs";
import SignIn from "./pages/userAuth";
import Profile from "./pages/profile/profile";
import PublicProfile from "./pages/publicProfile/PublicProfile"
import People from "./pages/people/index";
import Feed from "./pages/feed/index";
import CreatePost from "./pages/createPost";
import Messages from "./pages/messages/index";
import EditBio from "./pages/editBio";
import PostPage from "./pages/postPage/index";
import { initializeSocket, disconnectSocket } from "./services/websocket";
import "./index.css";

const App = () => {
  useEffect(() => {
    // Only initialize socket if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      initializeSocket();
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

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
        <Route path="/people" element={<People />} />
        <Route path="/createPost" element={<CreatePost />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/editBio" element={<EditBio />} />
        <Route path="/post/:postId" element={<PostPage />} />
      </Routes>
      <BottomNav />
    </Router>
  );
}; 

export default App;

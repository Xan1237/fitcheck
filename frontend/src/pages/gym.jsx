import React, { useState } from 'react';
import Search from '../components/search';
import Map from '../components/map';
import Header from '../components/header';  // Make sure to import Header
import Footer from '../components/footer';  // Ensure Footer is also imported
import Title from '../components/title';  // Ensure Title is imported
import { useParams } from "react-router-dom";
import gymData from "../data/gymData.js";
import Message from "../components/message";
import "./index.scss";
const gym = () => {
  const {gym} = useParams();
  const gymsData = gymData[gym];
  console.log(gymsData.img)
  return (
    <div>
        <Header/>
        <img className = "GymPic" src={gymsData.img} alt="" />
        <div id="messageSection">
          <Message messageContent="This Gym rly sucks "/>
        </div>
    </div>
  );
};

export default gym;

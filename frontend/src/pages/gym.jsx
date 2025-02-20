import React, { useState } from 'react';
import Search from '../components/search';
import Map from '../components/map';
import Header from '../components/header';  // Make sure to import Header
import Footer from '../components/footer';  // Ensure Footer is also imported
import Title from '../components/title';  // Ensure Title is imported
import { useParams } from "react-router-dom";
import gymData from "../data/gymData.js";
const gym = () => {
  const {gym} = useParams();
  const gymsData = gymData[gym];
  console.log(gymsData)
  return (
    <div>
      <h1>{gymsData.name}</h1>
        <Header/>
    </div>
  );
};

export default gym;

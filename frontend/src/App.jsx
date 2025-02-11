import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Search from "./components/search"
function App() {

  return (
    <>
    <div id="topBar">
      <Search/>
    </div>
    </>
  )
}

export default App

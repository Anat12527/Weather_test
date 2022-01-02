import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Cities from "./components/Cities";
import './App.css';

function App() {
  return (
    <>
      <div class="bg-container">
      <Router>
        <Routes>
          <Route path="/uploading" element={<Cities />} />
        </Routes>
      </Router>
      </div>
    </>
    
  );
}

export default App;

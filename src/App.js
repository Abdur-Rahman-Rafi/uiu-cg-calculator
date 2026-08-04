import React, { useState, useEffect } from "react";
import CGPACalculator from "./components/CGPACalculator";
import FeeCalculator from "./components/FeeCalculator";
import "./App.css"; // Ensure global styles are loaded

export default function App() {
  const [activeTab, setActiveTab] = useState("cgpa");
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("uiu-cgpa-theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("uiu-cgpa-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("uiu-cgpa-theme", "light");
    }
  }, [isDarkMode]);

  return (
    <>
      {activeTab === "cgpa" ? (
        <CGPACalculator 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      ) : (
        <FeeCalculator 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      )}
    </>
  );
}

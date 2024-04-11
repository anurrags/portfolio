import React from "react";
import "./App.css";
import { Header, Hero, Overview, Skill } from "./components";

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Overview />
      <Skill />
    </div>
  );
}

export default App;

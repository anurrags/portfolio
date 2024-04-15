import React from "react";
import "./App.css";
import {
  Contact,
  Experience,
  Header,
  Hero,
  Overview,
  Skill,
} from "./components";

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Overview />
      <Experience />
      <Skill />
      <Contact />
    </div>
  );
}

export default App;

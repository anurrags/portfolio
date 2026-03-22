import React from "react";
import "./App.css";
import {
  Contact,
  Experience,
  Header,
  Hero,
  Overview,
  Skill,
  ScrollButton,
  Footer,
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
      <Footer />
      <ScrollButton />
    </div>
  );
}

export default App;

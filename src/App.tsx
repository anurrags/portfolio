import React from "react";
import "./App.css";
import {
  Contact,
  Experience,
  Header,
  Hero,
  Overview,
  Projects,
  Skill,
  ScrollButton,
  Footer,
} from "./components";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Overview />
      <Projects />
      <Experience />
      <Skill />
      <Contact />
      <Footer />
      <ScrollButton />
      <Analytics />
    </div>
  );
}

export default App;

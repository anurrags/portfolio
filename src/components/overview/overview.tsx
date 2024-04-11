import React from "react";
import "./overview.css";
import { Card } from "..";

const desc: string[] = [
  "Ingenious problem solver, adept at unraveling complex challenges efficiently",
  "Creative frontend developer, passionate about crafting immersive user experiences",
  "Proficient backend architect, ensuring robust, scalable server-side solutions",
  "Advocate for clean code, prioritizing readability and maintainability always",
];
const overview = () => {
  return (
    <div className="overview-container">
      <div className="overview-intro">
        <h1>Overview</h1>
        <p>
          Hey there!👋🏻 I'm a passionate software developer, skilled in MERN,
          Typescript, C, C++, Java, SpringBoot.
        </p>
      </div>
      <div className="overview-cards">
        <Card
          title={"Problem Solving"}
          logo={"./svg/problem-solving.svg"}
          desc={desc[0]}
        />
        <Card title={"Frontend"} logo={"./svg/frontend.svg"} desc={desc[1]} />
        <Card title={"Backend"} logo={"./svg/server.svg"} desc={desc[2]} />
        <Card title={"Clean Code"} logo={"./svg/code.svg"} desc={desc[3]} />
      </div>
    </div>
  );
};

export default overview;

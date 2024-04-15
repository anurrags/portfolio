import Carousel from "../carousel";
import "./skill.css";

const Skill = () => {
  return (
    <div id="skill" className="skill-container">
      <div className="skill-text">
        <h1>Skills</h1>
      </div>
      <div className="skill-carousel">
        <Carousel />
      </div>
    </div>
  );
};

export default Skill;

import "./carousel.css";
import { skillDatas } from "../../DB";

const Carousel = () => {
  const newArray = [...skillDatas, ...skillDatas];
  return (
    <div className="carousel-div">
      <div className="carousel-container">
        {newArray.map((item) => (
          <div className="item">
            <img className="carousel-svg" src={item.imgSrc} alt={item.imgAlt} />
            <p className="item-title">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;

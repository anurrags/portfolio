import React, { useEffect, useRef, useState } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import "./timeline.css";
import { experienceDatas } from "../../DB";

interface ElementsInViewport {
  [id: string]: boolean;
}

const Timeline: React.FC = () => {
  const [elementsInViewport, setElementsInViewport] =
    useState<ElementsInViewport>({});
  const elementsRef = useRef<{ [index: number]: HTMLDivElement | null }>({});
  const lastScrollY = useRef(window.scrollY);
  const [isScrollingDown, setIsScrollingDown] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrollingDown(currentScrollY > lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const id = target.dataset.id;
          const { boundingClientRect, rootBounds } = entry;

          if (id !== undefined) {
            if (entry.isIntersecting && isScrollingDown) {
              setElementsInViewport((prev) => ({ ...prev, [id]: true }));
            }
            if (rootBounds && boundingClientRect.top > rootBounds.top) {
              if (!entry.isIntersecting && !isScrollingDown) {
                setElementsInViewport((prev) => ({ ...prev, [id]: false }));
              }
            }
          }
        });
      },
      {
        threshold: isScrollingDown ? 0.5 : 0.1,
      }
    );

    Object.values(elementsRef.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isScrollingDown]);

  return (
    <VerticalTimeline>
      {experienceDatas.map((item, index) => (
        <div
          ref={(el) => (elementsRef.current[index] = el)}
          data-id={index.toString()}
          key={index}
        >
          <VerticalTimelineElement
            className={`vertical-timeline-element--work ${
              elementsInViewport[index] ? "visible fadeInUp" : ""
            }`}
            date={item.date}
            iconStyle={{ background: "rgb(33, 150, 243)", color: "#fff" }}
          >
            <h2 className="vertical-timeline-element-title">{item.company}</h2>
            <h3>{item.techStack}</h3>
            <pre>{item.description}</pre>
          </VerticalTimelineElement>
        </div>
      ))}
    </VerticalTimeline>
  );
};

export default Timeline;

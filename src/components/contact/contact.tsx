import { Suspense } from "react";
import Contactform from "../contact-form";
import "./contact.css";
import { Canvas, useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import {
  Object3D,
  Mesh,
  MeshStandardMaterial,
  DoubleSide,
  AmbientLight,
  PointLight,
} from "three";

// extend({ AmbientLight, PointLight });

const Model = ({ path }: { path: string }) => {
  const obj = useLoader(OBJLoader, path);

  // Traverse and apply material if mesh
  obj.traverse((child: Object3D) => {
    if ((child as any).isMesh) {
      const mesh = child as Mesh;
      mesh.material = new MeshStandardMaterial({
        color: "white", // Use a neutral color to see the model better
        side: DoubleSide,
        flatShading: true,
      });
    }
  });

  // Adjust scale to make the model more visible
  obj.scale.set(10, 10, 10); // Increase scale here

  return <primitive object={obj} />;
};

const contact = () => {
  return (
    <div className="contact-main-div">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="curve-svg curve-svg-contact rotated-curve"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#fff"
          fill-opacity="1"
          d="M0,96L80,122.7C160,149,320,203,480,197.3C640,192,800,128,960,112C1120,96,1280,128,1360,144L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        ></path>
      </svg>
      <h1 className="contact-h1">Contact Me</h1>
      <div className="contact-container">
        <div className="form-container">
          {" "}
          <Contactform />
        </div>

        <div>
          <Canvas
            camera={{ position: [5, 5, 5], fov: 60 }} // Adjust the camera's position and field of view
          >
            {/* Basic ambient light to illuminate the entire scene lightly */}
            <ambientLight intensity={0.5} />
            {/* Point light to give depth and shadows to the model */}
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            {/* Add more lights if necessary to highlight parts of the model */}

            <Suspense fallback={null}>
              <Model path="./3d-models/lowPolyEarth.obj" />
            </Suspense>
          </Canvas>
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="curve-svg curve-svg-contact"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#fff"
          fill-opacity="1"
          d="M0,96L80,122.7C160,149,320,203,480,197.3C640,192,800,128,960,112C1120,96,1280,128,1360,144L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        ></path>
      </svg>
    </div>
  );
};

export default contact;

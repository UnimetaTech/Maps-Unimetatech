import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";

const store = createXRStore();

const ViewMapsVr = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <button
        onClick={() => store.enterVR()}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          border: "none",
          borderRadius: "10px",
          color: "black",
          fontSize: "16px",
          cursor: "pointer",
          zIndex: 1,
          transition: "background-color 0.3s ease",
        }}
      >
        Enter VR
      </button>
      <Canvas shadows camera={{ position: [0, 0, 0.2], fov: 50 }}>
        <XR store={store}>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.4}
            autoRotate={false}
            rotateSpeed={-0.7}
          />

          <ambientLight intensity={1.5} />

          <hemisphereLight color={0xffffff} groundColor={0xffffff} intensity={0.3} />

          <Environment preset="forest" blur={0.5} />

          {children}
        </XR>
      </Canvas>
    </>
  );
};

export default ViewMapsVr;

import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

//
const ViewMaps = ({ children }: { children: React.ReactNode }) => {
  return (
    <Canvas shadows camera={{ position: [0, 0, 0.2], fov: 50 }}>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.2}
        autoRotate={false}
        rotateSpeed={-0.5}
      />

      {/* <Suspense fallback={null}> */}
      {/* <Preload  /> */}
      {children}
      {/* </Suspense> */}
      <Environment preset="lobby" background />
    </Canvas>
  );
};

export default ViewMaps;

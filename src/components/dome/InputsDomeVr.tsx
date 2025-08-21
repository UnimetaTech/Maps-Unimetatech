import * as THREE from "three";
import { toast } from "react-toastify";
import { useZones } from "@/store/Zones";
import { useState } from "react";

export const InputsDomeVr = () => {
  const { currentImg360, imagens360, changedImagen } = useZones();
  const [hovered, setHovered] = useState<number | null>(null);
  const [scale, setScale] = useState(1); 

  if (currentImg360 === null) return <>loading...</>;

  return (
    <>
      {currentImg360.links.map((link, index) => {
        const currentName = imagens360[link.target].name;

        return (
          <mesh
            key={index}
            position={new THREE.Vector3(...link.position)}
            scale={hovered === index ? scale : 1} 
            onPointerOver={() => {
              setHovered(index);
              setScale(1.2); 
            }}
            onPointerOut={() => {
              setHovered(null);
              setScale(0.9); 
            }}
            onClick={() => {
              changedImagen(link.target);

              toast(`Te encuentras en "${currentName}."`, {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
            }}
          >
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshBasicMaterial
              color={"white"}
              depthWrite={false}
            />

            <mesh position={new THREE.Vector3(0, 0, 0)} renderOrder={1}>
              <sphereGeometry args={[0.2, 32, 32]} />
              <meshStandardMaterial
                color="red"
              />
            </mesh>
          </mesh>
        );
      })}
    </>
  );
};



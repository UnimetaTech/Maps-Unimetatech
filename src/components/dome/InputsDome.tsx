import * as THREE from "three";
import { toast } from "react-toastify";
import { Html } from "@react-three/drei";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { useZones } from "@/store/Zones";

export const InputsDome = () => {
  const { currentImg360, imagens360, changedImagen } = useZones();
  if (currentImg360 === null) return <>loading...</>;
  return (
    <>
      {currentImg360.links.map((link, index) => {
        const currentName = imagens360[link.target].name;
        return (
          <mesh key={index} position={new THREE.Vector3(...link.position)}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshBasicMaterial color="white" />
            <Html center>
              <HoverCard>
                <HoverCardTrigger
                  onClick={() => {
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
                    changedImagen(link.target);
                    //setCurrentZone(link.target);
                  }}
                >
                  <div className="rounded-full w-16 h-16 bg-white flex items-center justify-center hover:animate-bounce-expand cursor-pointer">
                    <div className="rounded-full w-6 h-6 bg-red-700 hover:animate-bounce-expand"></div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="backdrop-blur-sm bg-white/45 text-center text-lg font-bold text-black">
                  {currentName}
                </HoverCardContent>
              </HoverCard>
            </Html>
          </mesh>
        );
      })}
    </>
  );
};

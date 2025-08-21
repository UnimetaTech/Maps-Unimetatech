import { useEffect} from "react";
import { Dome, InputsDome, InputsDomeVr } from ".";
import { useZones } from "@/store/Zones";
import { useXR } from "@react-three/xr";

export const Portals = () => {
  const { session } = useXR();


  console.log("COMPONENT PORTALS");

  useEffect(() => {
      console.log("COMPONENT PORTALS PRELOAD AND PRIORITYITEM...");
      useZones.getState().preloadTextures(); 
      useZones.getState().priorityItem();
  }, []);

  return (
    <>
      <Dome />
      {session ? <InputsDomeVr /> : <InputsDome />}
    </>
  );
};
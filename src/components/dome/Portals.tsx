import React, { useEffect } from "react";
import { Dome, InputsDome, InputsDomeVr } from ".";
import { useZones } from "@/store/Zones";
import { useXR } from "@react-three/xr";

export const Portals: React.FC = () => {
  const { session } = useXR();
  const { priorityItem, currentIndex } = useZones();

  useEffect(() => {
    (async () => {
      try {
        await priorityItem(currentIndex); 
      } catch (e) {
        console.warn("priorityItem error", e);
      }
    })();
  }, [priorityItem, currentIndex]);

  return (
    <>
      <Dome />
      {session ? <InputsDomeVr /> : <InputsDome />}
    </>
  );
};

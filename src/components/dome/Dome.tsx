
import React, { useMemo } from "react";
import { useZones } from "@/store/Zones";
import { Model } from "@/assets/Model";


export const Dome: React.FC = () => {
  const { currentImg360 } = useZones();

  const textures = useMemo(() => {
    if (!currentImg360) return [];
    // @ts-ignore
    return currentImg360.url || [];
  }, [currentImg360]);

  return (
    <group>
      <Model textures={textures} />
    </group>
  );
};

export default Dome;

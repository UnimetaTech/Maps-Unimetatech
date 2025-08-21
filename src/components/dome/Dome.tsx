import { useMemo } from "react";
import { Model } from "@/assets/Model";
import { useZones } from "@/store/Zones";

export const Dome = () => {
  const { maps, currentIndex } = useZones();

  const textures = useMemo(() => {
    const textureSet = maps[currentIndex];
    return textureSet?.high?.length 
      ? textureSet.high 
      : textureSet?.low || [];
  }, [maps, currentIndex]);

  return (
    <group>
      <Model textures={textures} />
    </group>
  );
};

import * as THREE from "three";

export type TLink = {
  target: number;
  position: THREE.Vector3;
};

export type TImagen360 = {
  name: string;
  lowRes: string[];  
  highRes: string[]; 
  links: { target: number; position: THREE.Vector3 }[];
};

export type TDomeProps = {
  name: string;
  texture: THREE.Texture;
};

export type TInputsDomeProps = {
  links: TLink[];
  data: TImagen360[];
};

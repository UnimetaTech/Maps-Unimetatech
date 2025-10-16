import { shaderMaterial, useGLTF } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Sphere_1: THREE.Mesh;
    Sphere_2: THREE.Mesh;
    Sphere_3: THREE.Mesh;
    Sphere_4: THREE.Mesh;
    Sphere_5: THREE.Mesh;
    Sphere_6: THREE.Mesh;
    Sphere_7: THREE.Mesh;
    Sphere_8: THREE.Mesh;
    Sphere_9: THREE.Mesh;
    Sphere_10: THREE.Mesh;
    Sphere_11: THREE.Mesh;
    Sphere_12: THREE.Mesh;
    Sphere_13: THREE.Mesh;
    Sphere_14: THREE.Mesh;
    Sphere_15: THREE.Mesh;
    Sphere_16: THREE.Mesh;
    Sphere_17: THREE.Mesh;
    Sphere_18: THREE.Mesh;
    Sphere_19: THREE.Mesh;
    Sphere_20: THREE.Mesh;
    Sphere_21: THREE.Mesh;
    Sphere_22: THREE.Mesh;
    Sphere_23: THREE.Mesh;
    Sphere_24: THREE.Mesh;
    Sphere_25: THREE.Mesh;
    Sphere_26: THREE.Mesh;
    Sphere_27: THREE.Mesh;
    Sphere_28: THREE.Mesh;
    Sphere_29: THREE.Mesh;
    Sphere_30: THREE.Mesh;
    Sphere_31: THREE.Mesh;
    Sphere_32: THREE.Mesh;
    Sphere_33: THREE.Mesh;
    Sphere_34: THREE.Mesh;
    Sphere_35: THREE.Mesh;
    Sphere_36: THREE.Mesh;
    Sphere_37: THREE.Mesh;
    Sphere_38: THREE.Mesh;
    Sphere_39: THREE.Mesh;
    Sphere_40: THREE.Mesh;
    Sphere_41: THREE.Mesh;
    Sphere_42: THREE.Mesh;
    Sphere_43: THREE.Mesh;
    Sphere_44: THREE.Mesh;
    Sphere_45: THREE.Mesh;
    Sphere_46: THREE.Mesh;
    Sphere_47: THREE.Mesh;
    Sphere_48: THREE.Mesh;
    Sphere_49: THREE.Mesh;
    Sphere_50: THREE.Mesh;
    Sphere_51: THREE.Mesh;
    Sphere_52: THREE.Mesh;
    Sphere_53: THREE.Mesh;
    Sphere_54: THREE.Mesh;
    Sphere_55: THREE.Mesh;
    Sphere_56: THREE.Mesh;
    Sphere_57: THREE.Mesh;
    Sphere_58: THREE.Mesh;
    Sphere_59: THREE.Mesh;
    Sphere_60: THREE.Mesh;
    Sphere_61: THREE.Mesh;
    Sphere_62: THREE.Mesh;
    Sphere_63: THREE.Mesh;
    Sphere_64: THREE.Mesh;
    Sphere_65: THREE.Mesh;
    Sphere_66: THREE.Mesh;
    Sphere_67: THREE.Mesh;
    Sphere_68: THREE.Mesh;
    Sphere_69: THREE.Mesh;
    Sphere_70: THREE.Mesh;
    Sphere_71: THREE.Mesh;
    Sphere_72: THREE.Mesh;
    Sphere_73: THREE.Mesh;
    Sphere_74: THREE.Mesh;
    Sphere_75: THREE.Mesh;
    Sphere_76: THREE.Mesh;
    Sphere_77: THREE.Mesh;
    Sphere_78: THREE.Mesh;
    Sphere_79: THREE.Mesh;
    Sphere_80: THREE.Mesh;
    Sphere_81: THREE.Mesh;
    Sphere_82: THREE.Mesh;
    Sphere_83: THREE.Mesh;
    Sphere_84: THREE.Mesh;
    Sphere_85: THREE.Mesh;
    Sphere_86: THREE.Mesh;
    Sphere_87: THREE.Mesh;
    Sphere_88: THREE.Mesh;
    Sphere_89: THREE.Mesh;
    Sphere_90: THREE.Mesh;
    Sphere_91: THREE.Mesh;
    Sphere_92: THREE.Mesh;
    Sphere_93: THREE.Mesh;
    Sphere_94: THREE.Mesh;
    Sphere_95: THREE.Mesh;
    Sphere_96: THREE.Mesh;
    Sphere_97: THREE.Mesh;
    Sphere_98: THREE.Mesh;
    Sphere_99: THREE.Mesh;
    Sphere_100: THREE.Mesh;
    Sphere_101: THREE.Mesh;
    Sphere_102: THREE.Mesh;
    Sphere_103: THREE.Mesh;
    Sphere_104: THREE.Mesh;
    Sphere_105: THREE.Mesh;
    Sphere_106: THREE.Mesh;
    Sphere_107: THREE.Mesh;
    Sphere_108: THREE.Mesh;
    Sphere_109: THREE.Mesh;
    Sphere_110: THREE.Mesh;
    Sphere_111: THREE.Mesh;
    Sphere_112: THREE.Mesh;
    Sphere_113: THREE.Mesh;
    Sphere_114: THREE.Mesh;
    Sphere_115: THREE.Mesh;
    Sphere_116: THREE.Mesh;
    Sphere_117: THREE.Mesh;
    Sphere_118: THREE.Mesh;
    Sphere_119: THREE.Mesh;
    Sphere_120: THREE.Mesh;
    Sphere_121: THREE.Mesh;
    Sphere_122: THREE.Mesh;
    Sphere_123: THREE.Mesh;
    Sphere_124: THREE.Mesh;
    Sphere_125: THREE.Mesh;
    Sphere_126: THREE.Mesh;
    Sphere_127: THREE.Mesh;
    Sphere_128: THREE.Mesh;
  };
  materials: {
    Material_0_0: THREE.MeshStandardMaterial;
    Material_0_1: THREE.MeshStandardMaterial;
    Material_0_2: THREE.MeshStandardMaterial;
    Material_0_3: THREE.MeshStandardMaterial;
    Material_0_4: THREE.MeshStandardMaterial;
    Material_0_5: THREE.MeshStandardMaterial;
    Material_0_6: THREE.MeshStandardMaterial;
    Material_0_7: THREE.MeshStandardMaterial;
    Material_0_8: THREE.MeshStandardMaterial;
    Material_0_9: THREE.MeshStandardMaterial;
    Material_0_10: THREE.MeshStandardMaterial;
    Material_0_11: THREE.MeshStandardMaterial;
    Material_0_12: THREE.MeshStandardMaterial;
    Material_0_13: THREE.MeshStandardMaterial;
    Material_0_14: THREE.MeshStandardMaterial;
    Material_0_15: THREE.MeshStandardMaterial;
    Material_1_0: THREE.MeshStandardMaterial;
    Material_1_1: THREE.MeshStandardMaterial;
    Material_1_2: THREE.MeshStandardMaterial;
    Material_1_3: THREE.MeshStandardMaterial;
    Material_1_4: THREE.MeshStandardMaterial;
    Material_1_5: THREE.MeshStandardMaterial;
    Material_1_6: THREE.MeshStandardMaterial;
    Material_1_7: THREE.MeshStandardMaterial;
    Material_1_8: THREE.MeshStandardMaterial;
    Material_1_9: THREE.MeshStandardMaterial;
    Material_1_10: THREE.MeshStandardMaterial;
    Material_1_11: THREE.MeshStandardMaterial;
    Material_1_12: THREE.MeshStandardMaterial;
    Material_1_13: THREE.MeshStandardMaterial;
    Material_1_14: THREE.MeshStandardMaterial;
    Material_1_15: THREE.MeshStandardMaterial;
    Material_2_0: THREE.MeshStandardMaterial;
    Material_2_1: THREE.MeshStandardMaterial;
    Material_2_2: THREE.MeshStandardMaterial;
    Material_2_3: THREE.MeshStandardMaterial;
    Material_2_4: THREE.MeshStandardMaterial;
    Material_2_5: THREE.MeshStandardMaterial;
    Material_2_6: THREE.MeshStandardMaterial;
    Material_2_7: THREE.MeshStandardMaterial;
    Material_2_8: THREE.MeshStandardMaterial;
    Material_2_9: THREE.MeshStandardMaterial;
    Material_2_10: THREE.MeshStandardMaterial;
    Material_2_11: THREE.MeshStandardMaterial;
    Material_2_12: THREE.MeshStandardMaterial;
    Material_2_13: THREE.MeshStandardMaterial;
    Material_2_14: THREE.MeshStandardMaterial;
    Material_2_15: THREE.MeshStandardMaterial;
    Material_3_0: THREE.MeshStandardMaterial;
    Material_3_1: THREE.MeshStandardMaterial;
    Material_3_2: THREE.MeshStandardMaterial;
    Material_3_3: THREE.MeshStandardMaterial;
    Material_3_4: THREE.MeshStandardMaterial;
    Material_3_5: THREE.MeshStandardMaterial;
    Material_3_6: THREE.MeshStandardMaterial;
    Material_3_7: THREE.MeshStandardMaterial;
    Material_3_8: THREE.MeshStandardMaterial;
    Material_3_9: THREE.MeshStandardMaterial;
    Material_3_10: THREE.MeshStandardMaterial;
    Material_3_11: THREE.MeshStandardMaterial;
    Material_3_12: THREE.MeshStandardMaterial;
    Material_3_13: THREE.MeshStandardMaterial;
    Material_3_14: THREE.MeshStandardMaterial;
    Material_3_15: THREE.MeshStandardMaterial;
    Material_4_0: THREE.MeshStandardMaterial;
    Material_4_1: THREE.MeshStandardMaterial;
    Material_4_2: THREE.MeshStandardMaterial;
    Material_4_3: THREE.MeshStandardMaterial;
    Material_4_4: THREE.MeshStandardMaterial;
    Material_4_5: THREE.MeshStandardMaterial;
    Material_4_6: THREE.MeshStandardMaterial;
    Material_4_7: THREE.MeshStandardMaterial;
    Material_4_8: THREE.MeshStandardMaterial;
    Material_4_9: THREE.MeshStandardMaterial;
    Material_4_10: THREE.MeshStandardMaterial;
    Material_4_11: THREE.MeshStandardMaterial;
    Material_4_12: THREE.MeshStandardMaterial;
    Material_4_13: THREE.MeshStandardMaterial;
    Material_4_14: THREE.MeshStandardMaterial;
    Material_4_15: THREE.MeshStandardMaterial;
    Material_5_0: THREE.MeshStandardMaterial;
    Material_5_1: THREE.MeshStandardMaterial;
    Material_5_2: THREE.MeshStandardMaterial;
    Material_5_3: THREE.MeshStandardMaterial;
    Material_5_4: THREE.MeshStandardMaterial;
    Material_5_5: THREE.MeshStandardMaterial;
    Material_5_6: THREE.MeshStandardMaterial;
    Material_5_7: THREE.MeshStandardMaterial;
    Material_5_8: THREE.MeshStandardMaterial;
    Material_5_9: THREE.MeshStandardMaterial;
    Material_5_10: THREE.MeshStandardMaterial;
    Material_5_11: THREE.MeshStandardMaterial;
    Material_5_12: THREE.MeshStandardMaterial;
    Material_5_13: THREE.MeshStandardMaterial;
    Material_5_14: THREE.MeshStandardMaterial;
    Material_5_15: THREE.MeshStandardMaterial;
    Material_6_0: THREE.MeshStandardMaterial;
    Material_6_1: THREE.MeshStandardMaterial;
    Material_6_2: THREE.MeshStandardMaterial;
    Material_6_3: THREE.MeshStandardMaterial;
    Material_6_4: THREE.MeshStandardMaterial;
    Material_6_5: THREE.MeshStandardMaterial;
    Material_6_6: THREE.MeshStandardMaterial;
    Material_6_7: THREE.MeshStandardMaterial;
    Material_6_8: THREE.MeshStandardMaterial;
    Material_6_9: THREE.MeshStandardMaterial;
    Material_6_10: THREE.MeshStandardMaterial;
    Material_6_11: THREE.MeshStandardMaterial;
    Material_6_12: THREE.MeshStandardMaterial;
    Material_6_13: THREE.MeshStandardMaterial;
    Material_6_14: THREE.MeshStandardMaterial;
    Material_6_15: THREE.MeshStandardMaterial;
    Material_7_0: THREE.MeshStandardMaterial;
    Material_7_1: THREE.MeshStandardMaterial;
    Material_7_2: THREE.MeshStandardMaterial;
    Material_7_3: THREE.MeshStandardMaterial;
    Material_7_4: THREE.MeshStandardMaterial;
    Material_7_5: THREE.MeshStandardMaterial;
    Material_7_6: THREE.MeshStandardMaterial;
    Material_7_7: THREE.MeshStandardMaterial;
    Material_7_8: THREE.MeshStandardMaterial;
    Material_7_9: THREE.MeshStandardMaterial;
    Material_7_10: THREE.MeshStandardMaterial;
    Material_7_11: THREE.MeshStandardMaterial;
    Material_7_12: THREE.MeshStandardMaterial;
    Material_7_13: THREE.MeshStandardMaterial;
    Material_7_14: THREE.MeshStandardMaterial;
    Material_7_15: THREE.MeshStandardMaterial;
  };

};

const TransitionMaterial = shaderMaterial(
  {
    uTextureCurrent: null,
    uTextureNext: null,
    uProgress: 0,
    uStrength: 0 
  },
  `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  varying vec2 vUv;
  uniform sampler2D uTextureCurrent;
  uniform sampler2D uTextureNext;
  uniform float uProgress;
  uniform float uStrength;

  const float PI = 3.141592653589793;

  float Linear_ease(float begin, float change, float duration, float time) {
    return change * time / duration + begin;
  }

  float Exponential_easeInOut(float begin, float change, float duration, float time) {
    if (time == 0.0) return begin;
    else if (time == duration) return begin + change;
    time /= (duration / 2.0);
    if (time < 1.0) return change / 2.0 * pow(2.0, 10.0 * (time - 1.0)) + begin;
    return change / 2.0 * (-pow(2.0, -10.0 * (time - 1.0)) + 2.0) + begin;
  }

  float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
  }

  vec3 crossFade(vec2 uv, float dissolve) {
    return mix(texture(uTextureCurrent, uv).rgb, texture(uTextureNext, uv).rgb, dissolve);
  }

  void main() {
    vec2 texCoord = vUv;
    float progress = uProgress;
    
    vec2 center = vec2(Linear_ease(0.5, 0.0, 1.0, progress), 0.5);
    float dissolve = Exponential_easeInOut(0.0, 1.0, 1.0, progress);
    
    float strength = mix(uStrength, 0.0, progress);

    vec3 color = vec3(0.0);
    float total = 0.0;
    vec2 toCenter = center - texCoord;

    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0) * 0.5;

    for (int t = 0; t < 20; t++) {
      float t_f = float(t);
      float percent = (t_f + offset) / 20.0;
      float weight = percent - percent * percent;
      color += crossFade(texCoord + toCenter * percent * strength, dissolve) * weight;
      total += weight;
    }

    gl_FragColor = vec4(color / total, 1.0);
  }
  `
);

extend({ TransitionMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    transitionMaterial: any;
  }
}

interface TransitionMaterialProps extends THREE.ShaderMaterial {
  uTextureCurrent: THREE.Texture | null;
  uTextureNext: THREE.Texture | null;
  uProgress: number;
  uStrength: number;
}

type ModelProps = {
  textures: THREE.Texture[];
  zoneIndex: number;
  transitionTick?: number;
  transitionSourceIndex?: number;
} & JSX.IntrinsicElements["group"];

export function Model({ textures, zoneIndex, transitionTick, transitionSourceIndex, ...props }: ModelProps) {
  const { nodes, materials } = useGLTF("/Sphere-transformed.glb") as GLTFResult;
  const materialsRef = useRef<Record<string, TransitionMaterialProps>>({});
  const lastTransitionRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    Object.entries(materials).forEach(([name, mat]) => {
      const material = new TransitionMaterial() as TransitionMaterialProps;
      material.transparent = mat.transparent;
      material.side = mat.side;
      material.uTextureCurrent = mat.map ?? null;
      material.uTextureNext = mat.map ?? null;
      material.uProgress = 1.0;
      materialsRef.current[name] = material;
    });
    return () => {
      Object.values(materialsRef.current).forEach((m) => {
        try { m.dispose && m.dispose(); } catch {}
      });
    };
  }, [materials]);

  useEffect(() => {
    const transitionRequested = lastTransitionRef.current !== transitionTick;
    const isForThisZone = typeof transitionSourceIndex === "number" && transitionSourceIndex === zoneIndex;
    const shouldTrigger = transitionRequested && isForThisZone;

    textures.forEach((texture, index) => {
      if (!texture) return;
      texture.flipY = false;
      texture.needsUpdate = true;

      const vertical = Math.floor(index / 16);
      const horizontal = index % 16;
      const name = `Material_${vertical}_${horizontal}`;
      const mat = materialsRef.current[name];
      if (!mat) return;

      mat.uTextureNext = texture;

      if (shouldTrigger) {
        mat.uProgress = 0;
      } else {
        if (mat.uProgress >= 1.0) {
          mat.uTextureCurrent = texture;
        }
      }
      mat.needsUpdate = true;
    });

    lastTransitionRef.current = transitionTick;
  }, [textures, transitionTick, transitionSourceIndex, zoneIndex]);

  useFrame((_, delta) => {
    Object.values(materialsRef.current).forEach((mat) => {
      if (mat.uProgress < 1.0) {
        mat.uProgress = Math.min(mat.uProgress + delta * 0.8, 1.0);
        if (mat.uProgress >= 1.0) {
          mat.uTextureCurrent = mat.uTextureNext;
        }
        mat.needsUpdate = true;
      }
    });
  });

  return (
    <group {...props} rotation={[0, -0.78, 0]} scale={[-94, 94, 94]}>
      {Object.entries(materialsRef.current).map(([name], idx) => {
        const nodeKey = `Sphere_${idx + 1}` as keyof typeof nodes;
        const node = nodes[nodeKey];
        if (!node) return null;
        return (
          <mesh
            key={name}
            geometry={node.geometry}
            material={materialsRef.current[name]}
          />
        );
      })}
    </group>
  );
}

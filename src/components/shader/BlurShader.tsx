import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const TransitionMaterial = shaderMaterial(
  {
    uTextureCurrent: null,
    uTextureNext: null,
    uProgress: 0,
    uStrength: 0.3,
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
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

  float Sinusoidal_easeInOut(float begin, float change, float duration, float time) {
    return -change / 2.0 * (cos(PI * time / duration) - 1.0) + begin;
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
    float strength = Sinusoidal_easeInOut(0.0, uStrength, 0.5, progress);

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
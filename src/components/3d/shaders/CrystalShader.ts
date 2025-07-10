import * as THREE from 'three';

export const createCrystalShader = (): {
  uniforms: any;
  vertexShader: string;
  fragmentShader: string;
} => {
  const uniforms = {
    time: { value: 0 },
    intensity: { value: 1.0 },
    baseTexture: { value: null },
    envMap: { value: null },
    refraction: { value: 0.15 }
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vReflect;
    varying vec3 vRefract;
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;
    
    void main() {
      vUv = uv;
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
      vNormal = worldNormal;
      
      vec3 cameraToVertex = normalize(worldPosition.xyz - cameraPosition);
      vReflect = reflect(cameraToVertex, worldNormal);
      vRefract = refract(cameraToVertex, worldNormal, 0.9);
      vViewDirection = normalize(cameraPosition - worldPosition.xyz);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform float intensity;
    uniform sampler2D baseTexture;
    uniform samplerCube envMap;
    uniform float refraction;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vReflect;
    varying vec3 vRefract;
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;
    
    // Fractal-like pattern for crystal
    float fractalPattern(vec2 p) {
      float value = 0.0;
      float scale = 1.0;
      for(int i = 0; i < 4; i++) {
        value += abs(sin(p.x * scale) * cos(p.y * scale)) / scale;
        p = p * 2.0 + vec2(0.5);
        scale *= 2.0;
      }
      return value;
    }
    
    void main() {
      vec4 baseColor = texture2D(baseTexture, vUv);
      
      // Crystal has fractal-like internal reflections
      float fractal = fractalPattern(vUv * 8.0 + time * 0.1);
      vec2 distortion = vec2(fractal) * refraction;
      
      // Multiple refraction rays for crystal effect
      vec3 refractDir1 = vRefract + vec3(distortion, 0.0);
      vec3 refractDir2 = vRefract + vec3(-distortion.x, distortion.y, 0.0);
      vec3 reflectDir = vReflect + vec3(distortion * 0.5, 0.0);
      
      vec3 envReflect = textureCube(envMap, reflectDir).rgb;
      vec3 envRefract1 = textureCube(envMap, refractDir1).rgb;
      vec3 envRefract2 = textureCube(envMap, refractDir2).rgb;
      
      // Crystal color tinting (slight blue)
      vec3 crystalColor = vec3(0.95, 0.98, 1.0);
      
      // Combine refractions with different weights
      vec3 refractColor = (envRefract1 * 0.6 + envRefract2 * 0.4) * crystalColor;
      vec3 reflectColor = envReflect * crystalColor;
      
      // Fresnel for crystal (more transparent at grazing angles)
      float fresnel = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), 3.0);
      
      // Internal sparkle effect
      float sparkle = sin(fractal * 20.0 + time) * 0.1 + 0.9;
      
      // Prismatic dispersion effect
      float dispersion = sin(vUv.x * 50.0 + time * 2.0) * 0.05;
      vec3 prism = vec3(1.0 + dispersion, 1.0, 1.0 - dispersion);
      
      vec3 finalColor = mix(
        baseColor.rgb * crystalColor * 0.1,
        mix(refractColor, reflectColor, fresnel) * prism * sparkle,
        intensity * 0.8
      );
      
      gl_FragColor = vec4(finalColor, baseColor.a * (0.7 + fresnel * 0.3));
    }
  `;

  return { uniforms, vertexShader, fragmentShader };
};
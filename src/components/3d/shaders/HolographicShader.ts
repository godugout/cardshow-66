
import * as THREE from 'three';
import type { HolographicShaderUniforms } from '@/types/three';

export const createHolographicShader = (): {
  uniforms: HolographicShaderUniforms;
  vertexShader: string;
  fragmentShader: string;
} => {
  const uniforms: HolographicShaderUniforms = {
    time: { value: 0 },
    intensity: { value: 1.0 },
    colorShift: { value: 0.5 },
    baseTexture: { value: null }
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform float intensity;
    uniform float colorShift;
    uniform sampler2D baseTexture;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    
    void main() {
      vec4 baseColor = texture2D(baseTexture, vUv);
      
      // Diagonal rainbow streaks characteristic of holograms
      float diagonal1 = sin((vUv.x + vUv.y) * 20.0 + time) * 0.5 + 0.5;
      float diagonal2 = sin((vUv.x - vUv.y) * 15.0 + time * 1.2) * 0.5 + 0.5;
      
      // Create shifting rainbow colors
      float hue1 = (diagonal1 + time * 0.5 + colorShift) * 6.28;
      float hue2 = (diagonal2 + time * 0.7 + colorShift) * 6.28;
      
      vec3 rainbow1 = hsv2rgb(vec3(hue1 / 6.28, 0.9, 1.0));
      vec3 rainbow2 = hsv2rgb(vec3(hue2 / 6.28, 0.7, 0.8));
      
      // Combine rainbow layers with interference patterns
      vec3 holographic = mix(rainbow1, rainbow2, 0.5);
      
      // Strong fresnel for viewing angle dependency
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.5);
      
      // Add sparkle effect
      float sparkle = sin(vUv.x * 80.0 + time * 3.0) * sin(vUv.y * 80.0 + time * 2.5);
      sparkle = pow(max(sparkle, 0.0), 10.0) * 0.5;
      
      vec3 finalColor = mix(
        baseColor.rgb * 0.3, 
        holographic + vec3(sparkle), 
        intensity * fresnel * 0.8
      );
      
      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `;

  return { uniforms, vertexShader, fragmentShader };
};

// Export as HolographicShader for compatibility
export const HolographicShader = createHolographicShader();

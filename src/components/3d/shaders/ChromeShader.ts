import * as THREE from 'three';

export const createChromeShader = (): {
  uniforms: any;
  vertexShader: string;
  fragmentShader: string;
} => {
  const uniforms = {
    time: { value: 0 },
    intensity: { value: 1.0 },
    baseTexture: { value: null },
    envMap: { value: null },
    distortion: { value: 0.02 }
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vReflect;
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
      vViewDirection = normalize(cameraPosition - worldPosition.xyz);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform float intensity;
    uniform sampler2D baseTexture;
    uniform samplerCube envMap;
    uniform float distortion;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vReflect;
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;
    
    void main() {
      vec4 baseColor = texture2D(baseTexture, vUv);
      
      // Chrome has distinctive vertical streak reflections
      float verticalStreak = sin(vUv.x * 20.0 + time * 0.3) * 0.1;
      vec2 distortedUV = vUv + vec2(0.0, verticalStreak * distortion);
      
      // Environment reflection with vertical bias
      vec3 reflectDir = vReflect;
      reflectDir.y += verticalStreak * 0.5;
      vec3 envColor = textureCube(envMap, reflectDir).rgb;
      
      // Strong fresnel for chrome
      float fresnel = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), 1.5);
      
      // Chrome color tinting
      vec3 chromeColor = vec3(0.8, 0.85, 0.95);
      envColor *= chromeColor;
      
      // Sharp vertical highlights
      float highlight = abs(sin(vUv.x * 40.0 + time * 0.2)) * fresnel;
      envColor += vec3(highlight * 0.3);
      
      vec3 finalColor = mix(baseColor.rgb * 0.2, envColor, intensity * (0.7 + fresnel * 0.3));
      
      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `;

  return { uniforms, vertexShader, fragmentShader };
};
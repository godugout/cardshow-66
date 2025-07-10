import * as THREE from 'three';

export const createGoldShader = (): {
  uniforms: any;
  vertexShader: string;
  fragmentShader: string;
} => {
  const uniforms = {
    time: { value: 0 },
    intensity: { value: 1.0 },
    baseTexture: { value: null },
    envMap: { value: null },
    warmth: { value: 1.2 }
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
    uniform float warmth;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vReflect;
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;
    
    void main() {
      vec4 baseColor = texture2D(baseTexture, vUv);
      
      // Gold has circular/radial reflection patterns
      vec2 center = vec2(0.5, 0.5);
      float distance = length(vUv - center);
      float radialPattern = sin(distance * 15.0 + time * 0.5) * 0.1;
      
      // Circular highlight sweep
      float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
      float sweep = sin(angle * 3.0 + time * 0.8) * 0.5 + 0.5;
      
      // Environment reflection with radial distortion
      vec3 reflectDir = vReflect;
      reflectDir += vec3(radialPattern * 0.3);
      vec3 envColor = textureCube(envMap, reflectDir).rgb;
      
      // Warm gold tinting
      vec3 goldColor = vec3(1.0, 0.84, 0.0) * warmth;
      envColor *= goldColor;
      
      // Add warm glow
      float fresnel = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), 2.0);
      vec3 glow = goldColor * fresnel * 0.3;
      
      // Circular highlight rings
      float rings = sin(distance * 30.0) * 0.1 + 0.9;
      envColor *= rings;
      
      // Warm reflection with circular patterns
      vec3 finalColor = mix(baseColor.rgb * goldColor * 0.3, envColor + glow, intensity * (0.6 + sweep * 0.2));
      
      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `;

  return { uniforms, vertexShader, fragmentShader };
};
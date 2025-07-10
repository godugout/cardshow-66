import * as THREE from 'three';

export const createMatteShader = (): {
  uniforms: any;
  vertexShader: string;
  fragmentShader: string;
} => {
  const uniforms = {
    time: { value: 0 },
    intensity: { value: 1.0 },
    baseTexture: { value: null },
    textureEnhancement: { value: 1.3 }
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDirection;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
      vNormal = worldNormal;
      
      vViewDirection = normalize(cameraPosition - worldPosition.xyz);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform float intensity;
    uniform sampler2D baseTexture;
    uniform float textureEnhancement;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDirection;
    varying vec3 vWorldPosition;
    
    // Subtle paper-like texture
    float paperTexture(vec2 uv) {
      return sin(uv.x * 300.0) * 0.02 + sin(uv.y * 300.0) * 0.02;
    }
    
    void main() {
      vec4 baseColor = texture2D(baseTexture, vUv);
      
      // Enhance texture detail for matte finish
      float paper = paperTexture(vUv);
      
      // Very subtle directional lighting (no reflections)
      float lightFactor = max(dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))), 0.0);
      lightFactor = 0.7 + lightFactor * 0.3; // Soft contrast
      
      // Matte surfaces absorb light rather than reflect
      vec3 mattColor = baseColor.rgb * textureEnhancement;
      
      // Add subtle paper texture
      mattColor += vec3(paper);
      
      // Apply soft lighting
      vec3 finalColor = mattColor * lightFactor;
      
      // No fresnel effects for matte
      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `;

  return { uniforms, vertexShader, fragmentShader };
};
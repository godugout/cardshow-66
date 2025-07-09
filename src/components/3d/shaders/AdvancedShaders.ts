import * as THREE from 'three';

// Anisotropic Reflection Shader for Foil Effects
export const createAnisotropicShader = () => {
  const uniforms = {
    time: { value: 0 },
    baseTexture: { value: null },
    normalMap: { value: null },
    anisotropyDirection: { value: new THREE.Vector2(1, 0) },
    anisotropyStrength: { value: 0.8 },
    metalness: { value: 0.9 },
    roughness: { value: 0.1 },
    envMap: { value: null }
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec3 vTangent;
    varying vec3 vBitangent;

    attribute vec3 tangent;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      
      // Calculate tangent space
      vTangent = normalize(normalMatrix * tangent);
      vBitangent = cross(vNormal, vTangent);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform sampler2D baseTexture;
    uniform sampler2D normalMap;
    uniform vec2 anisotropyDirection;
    uniform float anisotropyStrength;
    uniform float metalness;
    uniform float roughness;
    uniform samplerCube envMap;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec3 vTangent;
    varying vec3 vBitangent;

    vec3 getAnisotropicReflection(vec3 viewDir, vec3 normal, vec3 tangent, vec3 bitangent) {
      // Create anisotropic normal
      vec3 anisotropicNormal = normalize(
        normal + 
        tangent * anisotropyDirection.x * anisotropyStrength +
        bitangent * anisotropyDirection.y * anisotropyStrength
      );
      
      // Calculate reflection direction
      vec3 reflectDir = reflect(-viewDir, anisotropicNormal);
      
      return textureCube(envMap, reflectDir).rgb;
    }

    void main() {
      vec4 baseColor = texture2D(baseTexture, vUv);
      vec3 normalSample = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
      
      // Transform normal to world space
      vec3 normal = normalize(vNormal + 
        vTangent * normalSample.x + 
        vBitangent * normalSample.y + 
        vNormal * normalSample.z);
      
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      
      // Anisotropic reflection
      vec3 anisotropicReflection = getAnisotropicReflection(viewDir, normal, vTangent, vBitangent);
      
      // Fresnel effect
      float fresnel = pow(1.0 - dot(viewDir, normal), 2.0);
      
      // Animate the anisotropic effect
      float animatedStrength = anisotropyStrength * (0.8 + 0.2 * sin(time * 2.0));
      
      // Combine base color with anisotropic reflection
      vec3 finalColor = mix(
        baseColor.rgb,
        anisotropicReflection,
        metalness * fresnel * animatedStrength
      );
      
      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `;

  return { uniforms, vertexShader, fragmentShader };
};

// Subsurface Scattering Shader for Translucent Effects
export const createSubsurfaceShader = () => {
  const uniforms = {
    time: { value: 0 },
    baseTexture: { value: null },
    thicknessMap: { value: null },
    subsurfaceColor: { value: new THREE.Color(1, 0.8, 0.6) },
    thickness: { value: 0.1 },
    power: { value: 2.0 },
    scale: { value: 1.0 },
    distortion: { value: 0.1 },
    ambient: { value: 0.4 }
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform sampler2D baseTexture;
    uniform sampler2D thicknessMap;
    uniform vec3 subsurfaceColor;
    uniform float thickness;
    uniform float power;
    uniform float scale;
    uniform float distortion;
    uniform float ambient;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    void main() {
      vec4 baseColor = texture2D(baseTexture, vUv);
      float thicknessSample = texture2D(thicknessMap, vUv).r;
      
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0)); // Simplified light direction
      
      // Calculate subsurface scattering
      vec3 lightVec = lightDir + normal * distortion;
      float lightReachingEye = pow(clamp(dot(viewDir, -lightVec), 0.0, 1.0), power) * scale;
      float attenuation = (thickness + thicknessSample * (1.0 - thickness));
      
      vec3 subsurfaceContribution = attenuation * lightReachingEye * subsurfaceColor;
      
      // Animate subsurface intensity
      float animatedIntensity = 0.8 + 0.2 * sin(time * 3.0);
      subsurfaceContribution *= animatedIntensity;
      
      // Combine with base color
      vec3 finalColor = baseColor.rgb + subsurfaceContribution * ambient;
      
      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `;

  return { uniforms, vertexShader, fragmentShader };
};

// Interference Pattern Shader for Rainbow Effects
export const createInterferenceShader = () => {
  const uniforms = {
    time: { value: 0 },
    baseTexture: { value: null },
    interferenceIntensity: { value: 1.0 },
    filmThickness: { value: 0.5 },
    indexOfRefraction: { value: 1.33 },
    wavelengthR: { value: 650.0 },
    wavelengthG: { value: 550.0 },
    wavelengthB: { value: 450.0 }
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform sampler2D baseTexture;
    uniform float interferenceIntensity;
    uniform float filmThickness;
    uniform float indexOfRefraction;
    uniform float wavelengthR;
    uniform float wavelengthG;
    uniform float wavelengthB;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    float calculateInterference(float wavelength, float thickness, float cosTheta) {
      float opticalPath = 2.0 * thickness * indexOfRefraction * cosTheta;
      float phase = (2.0 * 3.14159 * opticalPath) / wavelength;
      return cos(phase);
    }

    void main() {
      vec4 baseColor = texture2D(baseTexture, vUv);
      
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 normal = normalize(vNormal);
      float cosTheta = abs(dot(viewDir, normal));
      
      // Animate film thickness
      float animatedThickness = filmThickness * (0.8 + 0.4 * sin(time + vUv.x * 10.0 + vUv.y * 10.0));
      
      // Calculate interference for each color channel
      float interferenceR = calculateInterference(wavelengthR, animatedThickness, cosTheta);
      float interferenceG = calculateInterference(wavelengthG, animatedThickness, cosTheta);
      float interferenceB = calculateInterference(wavelengthB, animatedThickness, cosTheta);
      
      vec3 interferenceColor = vec3(
        0.5 + 0.5 * interferenceR,
        0.5 + 0.5 * interferenceG,
        0.5 + 0.5 * interferenceB
      );
      
      // Fresnel effect for viewing angle dependency
      float fresnel = pow(1.0 - cosTheta, 2.0);
      
      // Combine with base color
      vec3 finalColor = mix(
        baseColor.rgb,
        interferenceColor,
        interferenceIntensity * fresnel
      );
      
      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `;

  return { uniforms, vertexShader, fragmentShader };
};
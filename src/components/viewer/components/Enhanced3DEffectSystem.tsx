import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial, Color, Vector2 } from 'three';
import * as THREE from 'three';
import { createHolographicShader } from '@/components/3d/shaders/HolographicShader';
import { createMetallicShader } from '@/components/3d/shaders/MetallicShader';
import { createEnergyGlowShader } from '@/components/3d/shaders/EnergyGlowShader';

interface Enhanced3DEffectSystemProps {
  effectValues: Record<string, any>;
  materialSettings: {
    metalness: number;
    roughness: number;
    clearcoat: number;
    transmission: number;
    reflectivity: number;
  };
  mousePosition: { x: number; y: number };
  cardTexture?: THREE.Texture;
}

// Create advanced shader for prismatic effects
const createPrismaticShader = () => {
  const uniforms = {
    time: { value: 0 },
    intensity: { value: 0 },
    mousePos: { value: new Vector2(0.5, 0.5) },
    baseTexture: { value: null },
    prismStrength: { value: 1.0 },
    colorShift: { value: 0.5 }
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform float intensity;
    uniform vec2 mousePos;
    uniform sampler2D baseTexture;
    uniform float prismStrength;
    uniform float colorShift;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    
    void main() {
      vec4 baseColor = texture2D(baseTexture, vUv);
      
      // Calculate distance from mouse position
      vec2 mouseDistance = vUv - mousePos;
      float distanceFromMouse = length(mouseDistance);
      
      // Create prismatic effect based on surface normal and viewing angle
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = 1.0 - max(0.0, dot(vNormal, viewDir));
      
      // Rainbow effect based on UV coordinates and time
      float hue = mod(vUv.x * 3.0 + vUv.y * 2.0 + time * 0.5 + colorShift, 1.0);
      vec3 prismColor = hsv2rgb(vec3(hue, 0.8, 1.0));
      
      // Create interference patterns
      float interference = sin(distanceFromMouse * 50.0 + time * 2.0) * 0.5 + 0.5;
      interference *= sin(vUv.x * 30.0 + time) * sin(vUv.y * 20.0 + time * 1.5);
      
      // Combine effects
      vec3 effectColor = mix(baseColor.rgb, prismColor, fresnel * intensity * 0.6);
      effectColor = mix(effectColor, prismColor * 1.5, interference * intensity * 0.3);
      
      // Add metallic shimmer
      float shimmer = pow(fresnel, 3.0) * sin(time * 3.0 + vUv.x * 10.0) * 0.5 + 0.5;
      effectColor += vec3(shimmer * intensity * 0.4);
      
      gl_FragColor = vec4(effectColor, baseColor.a * (0.8 + intensity * 0.2));
    }
  `;

  return { uniforms, vertexShader, fragmentShader };
};

// Create crystal facet shader
const createCrystalShader = () => {
  const uniforms = {
    time: { value: 0 },
    intensity: { value: 0 },
    mousePos: { value: new Vector2(0.5, 0.5) },
    baseTexture: { value: null },
    facetScale: { value: 8.0 },
    refractionStrength: { value: 0.1 }
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewDir;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vViewDir = normalize(cameraPosition - vWorldPosition);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform float intensity;
    uniform vec2 mousePos;
    uniform sampler2D baseTexture;
    uniform float facetScale;
    uniform float refractionStrength;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewDir;
    
    // Hash function for pseudo-random numbers
    float hash21(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    
    void main() {
      // Create faceted surface by dividing UV into cells
      vec2 facetUv = floor(vUv * facetScale) / facetScale;
      vec2 facetCenter = facetUv + 0.5 / facetScale;
      
      // Calculate pseudo-random normal for each facet
      float randomAngle = hash21(facetUv) * 6.28318;
      vec2 facetNormal2D = vec2(cos(randomAngle), sin(randomAngle)) * 0.5;
      vec3 facetNormal = normalize(vNormal + vec3(facetNormal2D * intensity, 0.0));
      
      // Calculate fresnel with modified normal
      float fresnel = 1.0 - max(0.0, dot(facetNormal, vViewDir));
      fresnel = pow(fresnel, 2.0);
      
      // Create refraction effect
      vec2 refractionOffset = facetNormal2D * refractionStrength * intensity;
      vec4 baseColor = texture2D(baseTexture, vUv + refractionOffset);
      
      // Add crystalline highlights
      float highlight = pow(max(0.0, dot(reflect(-vViewDir, facetNormal), vec3(0.0, 0.0, 1.0))), 16.0);
      
      // Distance from mouse for interactive effects
      vec2 mouseDistance = vUv - mousePos;
      float mouseEffect = exp(-length(mouseDistance) * 5.0);
      
      // Combine effects
      vec3 crystalColor = baseColor.rgb + vec3(highlight * intensity);
      crystalColor = mix(crystalColor, vec3(1.0), fresnel * intensity * 0.3);
      crystalColor += vec3(mouseEffect * intensity * 0.5);
      
      gl_FragColor = vec4(crystalColor, baseColor.a);
    }
  `;

  return { uniforms, vertexShader, fragmentShader };
};

export const Enhanced3DEffectSystem: React.FC<Enhanced3DEffectSystemProps> = ({
  effectValues,
  materialSettings,
  mousePosition,
  cardTexture
}) => {
  const meshRef = useRef<Mesh>(null);
  const holographicMaterialRef = useRef<ShaderMaterial>(null);
  const prismaticMaterialRef = useRef<ShaderMaterial>(null);
  const crystalMaterialRef = useRef<ShaderMaterial>(null);
  const metallicMaterialRef = useRef<ShaderMaterial>(null);

  // Create shader materials
  const holographicShader = useMemo(() => createHolographicShader(), []);
  const prismaticShader = useMemo(() => createPrismaticShader(), []);
  const crystalShader = useMemo(() => createCrystalShader(), []);
  const metallicShader = useMemo(() => createMetallicShader(), []);

  // Determine which effect to use based on highest intensity
  const activeEffect = useMemo(() => {
    const effects = [
      { name: 'holographic', intensity: effectValues.holographic?.intensity || 0 },
      { name: 'prizm', intensity: effectValues.prizm?.intensity || 0 },
      { name: 'crystal', intensity: effectValues.crystal?.intensity || 0 },
      { name: 'chrome', intensity: effectValues.chrome?.intensity || 0 },
      { name: 'gold', intensity: effectValues.gold?.intensity || 0 },
      { name: 'foilspray', intensity: effectValues.foilspray?.intensity || 0 }
    ];
    
    const maxEffect = effects.reduce((prev, current) => 
      current.intensity > prev.intensity ? current : prev
    );
    
    return maxEffect.intensity > 0 ? maxEffect.name : null;
  }, [effectValues]);

  // Update shader uniforms
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const mouseVec = new Vector2(mousePosition.x, mousePosition.y);

    if (holographicMaterialRef.current && activeEffect === 'holographic') {
      holographicMaterialRef.current.uniforms.time.value = time;
      holographicMaterialRef.current.uniforms.intensity.value = (effectValues.holographic?.intensity || 0) / 100;
      if (cardTexture) {
        holographicMaterialRef.current.uniforms.baseTexture.value = cardTexture;
      }
    }

    if (prismaticMaterialRef.current && activeEffect === 'prizm') {
      prismaticMaterialRef.current.uniforms.time.value = time;
      prismaticMaterialRef.current.uniforms.intensity.value = (effectValues.prizm?.intensity || 0) / 100;
      prismaticMaterialRef.current.uniforms.mousePos.value = mouseVec;
      if (cardTexture) {
        prismaticMaterialRef.current.uniforms.baseTexture.value = cardTexture;
      }
    }

    if (crystalMaterialRef.current && activeEffect === 'crystal') {
      crystalMaterialRef.current.uniforms.time.value = time;
      crystalMaterialRef.current.uniforms.intensity.value = (effectValues.crystal?.intensity || 0) / 100;
      crystalMaterialRef.current.uniforms.mousePos.value = mouseVec;
      if (cardTexture) {
        crystalMaterialRef.current.uniforms.baseTexture.value = cardTexture;
      }
    }

    if (metallicMaterialRef.current && (activeEffect === 'chrome' || activeEffect === 'gold')) {
      metallicMaterialRef.current.uniforms.time.value = time;
      metallicMaterialRef.current.uniforms.metalness.value = materialSettings.metalness;
      metallicMaterialRef.current.uniforms.roughness.value = materialSettings.roughness;
      if (cardTexture) {
        metallicMaterialRef.current.uniforms.baseTexture.value = cardTexture;
      }
    }
  });

  // Enhanced material properties based on effects
  const enhancedMaterialProps = useMemo(() => {
    const props: any = {
      metalness: materialSettings.metalness,
      roughness: materialSettings.roughness,
      clearcoat: materialSettings.clearcoat,
      transmission: materialSettings.transmission,
      transparent: true,
      opacity: 0.95
    };

    // Chrome effect
    if (effectValues.chrome?.intensity > 0) {
      props.metalness = Math.min(1, materialSettings.metalness + 0.4);
      props.roughness = Math.max(0, materialSettings.roughness - 0.3);
      props.reflectivity = 1.0;
      props.envMapIntensity = 2.0;
    }

    // Gold effect
    if (effectValues.gold?.intensity > 0) {
      props.metalness = Math.min(1, materialSettings.metalness + 0.3);
      props.roughness = Math.max(0.1, materialSettings.roughness - 0.2);
      props.color = new Color(0xFFD700);
      props.emissive = new Color(0x332200);
      props.emissiveIntensity = (effectValues.gold.intensity / 100) * 0.2;
    }

    // Foil spray effect - add transmission for see-through areas
    if (effectValues.foilspray?.intensity > 0) {
      props.transmission = Math.min(1, materialSettings.transmission + 0.3);
      props.thickness = 0.5;
      props.ior = 1.5;
    }

    return props;
  }, [effectValues, materialSettings]);

  // Render the appropriate material based on active effect
  const renderMaterial = () => {
    switch (activeEffect) {
      case 'holographic':
        return (
          <shaderMaterial
            ref={holographicMaterialRef}
            vertexShader={holographicShader.vertexShader}
            fragmentShader={holographicShader.fragmentShader}
            uniforms={holographicShader.uniforms}
            transparent
            side={THREE.DoubleSide}
          />
        );
      
      case 'prizm':
        return (
          <shaderMaterial
            ref={prismaticMaterialRef}
            vertexShader={prismaticShader.vertexShader}
            fragmentShader={prismaticShader.fragmentShader}
            uniforms={prismaticShader.uniforms}
            transparent
            side={THREE.DoubleSide}
          />
        );
      
      case 'crystal':
        return (
          <shaderMaterial
            ref={crystalMaterialRef}
            vertexShader={crystalShader.vertexShader}
            fragmentShader={crystalShader.fragmentShader}
            uniforms={crystalShader.uniforms}
            transparent
            side={THREE.DoubleSide}
          />
        );
      
      case 'chrome':
      case 'gold':
        return (
          <shaderMaterial
            ref={metallicMaterialRef}
            vertexShader={metallicShader.vertexShader}
            fragmentShader={metallicShader.fragmentShader}
            uniforms={metallicShader.uniforms}
            transparent
            side={THREE.DoubleSide}
          />
        );
      
      default:
        return (
          <meshPhysicalMaterial
            {...enhancedMaterialProps}
            map={cardTexture}
            side={THREE.DoubleSide}
          />
        );
    }
  };

  return (
    <mesh ref={meshRef} position={[0, 0, 0.01]}>
      <planeGeometry args={[4, 5.6]} />
      {renderMaterial()}
    </mesh>
  );
};
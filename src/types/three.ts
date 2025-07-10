import * as THREE from 'three';

export interface HolographicShaderUniforms {
  time: { value: number };
  intensity: { value: number };
  colorShift: { value: number };
  baseTexture: { value: THREE.Texture | null };
}

export interface MetallicShaderUniforms {
  time: { value: number };
  metalness: { value: number };
  roughness: { value: number };
  envMap: { value: THREE.CubeTexture | null };
}

export interface ChromeShaderUniforms {
  time: { value: number };
  intensity: { value: number };
  baseTexture: { value: THREE.Texture | null };
  envMap: { value: THREE.CubeTexture | null };
  distortion: { value: number };
}

export interface GoldShaderUniforms {
  time: { value: number };
  intensity: { value: number };
  baseTexture: { value: THREE.Texture | null };
  envMap: { value: THREE.CubeTexture | null };
  warmth: { value: number };
}

export interface CrystalShaderUniforms {
  time: { value: number };
  intensity: { value: number };
  baseTexture: { value: THREE.Texture | null };
  envMap: { value: THREE.CubeTexture | null };
  refraction: { value: number };
}

export interface MatteShaderUniforms {
  time: { value: number };
  intensity: { value: number };
  baseTexture: { value: THREE.Texture | null };
  textureEnhancement: { value: number };
}

// Performance monitoring types
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memory?: {
    used: number;
    limit: number;
  };
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
}

// WebGL capabilities and settings
export interface WebGLCapabilities {
  supported: boolean;
  performanceScore: number;
  version: string;
  maxTextureSize: number;
  maxVertexTextures: number;
  maxFragmentUniforms: number;
  maxVertexUniforms: number;
  maxVaryings: number;
  maxTextureUnits: number;
  maxAnisotropy: number;
  supportsFloatTextures: boolean;
  supportsDepthTexture: boolean;
  extensions: string[];
  webgl2: boolean;
}

export interface OptimalSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  shadows: boolean;
  antialias: boolean;
  pixelRatio: number;
  maxLights?: number;
  textureCompression?: boolean;
}
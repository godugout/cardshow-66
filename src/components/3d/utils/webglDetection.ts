
import type { WebGLCapabilities, OptimalSettings } from '@/types/three';

export const detectWebGLCapabilities = (): WebGLCapabilities => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (!gl) {
    return {
      supported: false,
      version: 'none',
      maxTextureSize: 0,
      maxVertexTextures: 0,
      maxFragmentUniforms: 0,
      maxVertexUniforms: 0,
      maxVaryings: 0,
      maxTextureUnits: 0,
      maxAnisotropy: 0,
      supportsFloatTextures: false,
      supportsDepthTexture: false,
      extensions: [],
      performanceScore: 0,
      webgl2: false
    };
  }

  const extensions = gl.getSupportedExtensions() || [];
  
  // Calculate performance score based on capabilities
  let performanceScore = 50; // Base score
  
  if (gl instanceof WebGL2RenderingContext) {
    performanceScore += 30;
  }
  
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  if (maxTextureSize >= 4096) performanceScore += 20;
  
  const renderer = gl.getParameter(gl.RENDERER);
  if (typeof renderer === 'string') {
    if (renderer.includes('NVIDIA') || renderer.includes('AMD')) {
      performanceScore += 10;
    }
  }

  return {
    supported: true,
    version: gl instanceof WebGL2RenderingContext ? 'WebGL2' : 'WebGL1',
    maxTextureSize,
    maxVertexTextures: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
    maxVaryings: gl.getParameter(gl.MAX_VARYING_VECTORS),
    maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
    maxAnisotropy: extensions.includes('EXT_texture_filter_anisotropic') ? 
      gl.getParameter(gl.getExtension('EXT_texture_filter_anisotropic')!.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0,
    supportsFloatTextures: extensions.includes('OES_texture_float'),
    supportsDepthTexture: extensions.includes('WEBGL_depth_texture'),
    extensions,
    performanceScore,
    webgl2: gl instanceof WebGL2RenderingContext
  };
};

export const getOptimalSettings = (capabilities: WebGLCapabilities): OptimalSettings => {
  const { performanceScore, supported } = capabilities;
  
  if (!supported) {
    return {
      quality: 'low',
      shadows: false,
      antialias: false,
      pixelRatio: 1
    };
  }

  if (performanceScore >= 80) {
    return {
      quality: 'high',
      shadows: true,
      antialias: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2)
    };
  } else if (performanceScore >= 60) {
    return {
      quality: 'medium',
      shadows: true,
      antialias: true,
      pixelRatio: 1
    };
  } else {
    return {
      quality: 'low',
      shadows: false,
      antialias: false,
      pixelRatio: 1
    };
  }
};

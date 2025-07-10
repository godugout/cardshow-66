import { useMemo } from 'react';
import { CRDFrame } from '@/types/crd';

// Default frame definitions
const DEFAULT_FRAMES: Record<string, CRDFrame> = {
  'crd-default': {
    id: 'crd-default',
    name: 'Default Card',
    category: 'art',
    dimensions: {
      width: 400,
      height: 560,
      aspectRatio: 400 / 560
    },
    imagePlaceholder: {
      x: 20,
      y: 20,
      width: 360,
      height: 480,
      shape: 'rounded',
      borderRadius: 8
    },
    elements: [],
    style: {
      border: {
        width: 2,
        style: 'solid',
        color: '#ffffff20',
        radius: 12
      },
      background: {
        type: 'solid',
        color: 'transparent',
        opacity: 1
      }
    }
  },
  'crd-sports': {
    id: 'crd-sports',
    name: 'Sports Card',
    category: 'sports',
    dimensions: {
      width: 400,
      height: 560,
      aspectRatio: 400 / 560
    },
    imagePlaceholder: {
      x: 20,
      y: 60,
      width: 360,
      height: 400,
      shape: 'rounded',
      borderRadius: 6
    },
    elements: [
      {
        id: 'header',
        type: 'decoration',
        position: { x: 0, y: 0, width: 400, height: 50, zIndex: 10 },
        style: {
          gradient: {
            type: 'linear',
            direction: 90,
            stops: [
              { color: '#1a1a1a', position: 0 },
              { color: '#333333', position: 100 }
            ]
          },
          opacity: 0.9
        }
      },
      {
        id: 'footer',
        type: 'decoration',
        position: { x: 0, y: 480, width: 400, height: 80, zIndex: 10 },
        style: {
          gradient: {
            type: 'linear',
            direction: 90,
            stops: [
              { color: '#333333', position: 0 },
              { color: '#1a1a1a', position: 100 }
            ]
          },
          opacity: 0.9
        }
      }
    ],
    style: {
      border: {
        width: 3,
        style: 'solid',
        color: '#ffffff40',
        radius: 12
      },
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          direction: 135,
          stops: [
            { color: '#1a1a1a', position: 0 },
            { color: '#2a2a2a', position: 100 }
          ]
        },
        opacity: 1
      }
    }
  },
  'crd-holographic': {
    id: 'crd-holographic',
    name: 'Holographic Frame',
    category: 'art',
    dimensions: {
      width: 400,
      height: 560,
      aspectRatio: 400 / 560
    },
    imagePlaceholder: {
      x: 25,
      y: 25,
      width: 350,
      height: 470,
      shape: 'rounded',
      borderRadius: 10
    },
    elements: [
      {
        id: 'holo-border',
        type: 'border',
        position: { x: 20, y: 20, width: 360, height: 480, zIndex: 15 },
        style: {
          gradient: {
            type: 'conic',
            stops: [
              { color: '#ff0080', position: 0 },
              { color: '#00ffff', position: 25 },
              { color: '#8000ff', position: 50 },
              { color: '#ff8000', position: 75 },
              { color: '#ff0080', position: 100 }
            ]
          },
          opacity: 0.8,
          filter: 'blur(1px)'
        },
        animation: {
          type: 'rotate',
          duration: 4,
          infinite: true,
          easing: 'linear'
        }
      }
    ],
    style: {
      border: {
        width: 4,
        style: 'gradient',
        color: {
          type: 'linear',
          direction: 45,
          stops: [
            { color: '#ff0080', position: 0 },
            { color: '#00ffff', position: 50 },
            { color: '#8000ff', position: 100 }
          ]
        },
        radius: 16,
        glow: {
          enabled: true,
          color: '#00ffff',
          blur: 8
        }
      },
      background: {
        type: 'gradient',
        gradient: {
          type: 'radial',
          stops: [
            { color: '#1a1a2e', position: 0 },
            { color: '#16213e', position: 100 }
          ]
        },
        opacity: 1
      }
    }
  }
};

export const useCRDFrame = (frameId: string): CRDFrame => {
  return useMemo(() => {
    const frame = DEFAULT_FRAMES[frameId];
    if (!frame) {
      console.warn(`Frame '${frameId}' not found, using default frame`);
      return DEFAULT_FRAMES['crd-default'];
    }
    return frame;
  }, [frameId]);
};
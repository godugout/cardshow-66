
import { CRDFrame } from '@/types/crdFrames';

// Oakland A's Donruss Style Frame (Fixed with CSS-based design)
export const OAKLAND_AS_DONRUSS: CRDFrame = {
  id: 'oakland-as-donruss',
  name: "Oakland A's Donruss Classic",
  description: 'Classic Donruss-style frame with Oakland Athletics branding',
  category: 'sports',
  rarity: 'rare',
  totalDimensions: {
    width: 400,
    height: 560
  },
  placeholderDimensions: {
    x: 30,
    y: 40,
    width: 340,
    height: 280
  },
  elements: [
    {
      id: 'main-border',
      name: 'Main Border',
      type: 'css-border',
      imageUrl: '', // Use CSS instead
      zIndex: 10,
      position: { x: 0, y: 0 },
      dimensions: { width: 400, height: 560 },
      cssStyles: {
        background: 'linear-gradient(145deg, #1f4e3d 0%, #2d5a4a 50%, #1f4e3d 100%)',
        border: '4px solid #FFD700',
        borderRadius: '12px',
        boxShadow: 'inset 0 0 30px rgba(255, 215, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.3)'
      }
    },
    {
      id: 'team-header',
      name: 'Team Header',
      type: 'text',
      imageUrl: '',
      zIndex: 15,
      position: { x: 20, y: 20 },
      dimensions: { width: 360, height: 30 },
      cssStyles: {
        color: '#FFD700',
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        fontFamily: 'serif'
      },
      textContent: "OAKLAND ATHLETICS"
    },
    {
      id: 'player-nameplate',
      name: 'Player Nameplate',
      type: 'css-panel',
      imageUrl: '',
      zIndex: 12,
      position: { x: 30, y: 340 },
      dimensions: { width: 340, height: 60 },
      cssStyles: {
        background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 215, 0, 0.9) 100%)',
        border: '2px solid #FFD700',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }
    },
    {
      id: 'year-badge',
      name: 'Year Badge',
      type: 'text',
      imageUrl: '',
      zIndex: 15,
      position: { x: 320, y: 25 },
      dimensions: { width: 60, height: 20 },
      cssStyles: {
        color: '#1f4e3d',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'center',
        background: 'rgba(255, 215, 0, 0.9)',
        borderRadius: '10px',
        padding: '2px'
      },
      textContent: "2024"
    },
    {
      id: 'stats-panel',
      name: 'Stats Panel',
      type: 'css-panel',
      imageUrl: '',
      zIndex: 12,
      position: { x: 30, y: 420 },
      dimensions: { width: 340, height: 120 },
      cssStyles: {
        background: 'linear-gradient(135deg, rgba(31, 78, 61, 0.95) 0%, rgba(45, 90, 74, 0.98) 100%)',
        border: '2px solid #FFD700',
        borderRadius: '8px',
        boxShadow: 'inset 0 2px 8px rgba(255, 215, 0, 0.2)'
      }
    }
  ]
};

// Modern Holographic Frame (Fixed with CSS-based design)
export const MODERN_HOLOGRAPHIC: CRDFrame = {
  id: 'modern-holographic',
  name: 'Modern Holographic',
  description: 'Futuristic holographic frame with prismatic effects',
  category: 'modern',
  rarity: 'epic',
  totalDimensions: {
    width: 400,
    height: 560
  },
  placeholderDimensions: {
    x: 40,
    y: 50,
    width: 320,
    height: 260
  },
  elements: [
    {
      id: 'holo-border',
      name: 'Holographic Border',
      type: 'css-border',
      imageUrl: '',
      zIndex: 10,
      position: { x: 0, y: 0 },
      dimensions: { width: 400, height: 560 },
      cssStyles: {
        background: 'linear-gradient(45deg, #FF6B4A, #4FFFB0, #4A90FF, #FF6B4A)',
        backgroundSize: '400% 400%',
        animation: 'holo-shift 3s ease-in-out infinite',
        border: '3px solid transparent',
        borderRadius: '16px',
        boxShadow: 'inset 0 0 50px rgba(79, 255, 176, 0.3), 0 0 30px rgba(79, 255, 176, 0.5)'
      }
    },
    {
      id: 'prism-overlay',
      name: 'Prism Effect',
      type: 'css-effect',
      imageUrl: '',
      zIndex: 5,
      position: { x: 0, y: 0 },
      dimensions: { width: 400, height: 560 },
      opacity: 0.6,
      cssStyles: {
        background: 'conic-gradient(from 0deg, transparent, rgba(79, 255, 176, 0.3), transparent, rgba(255, 107, 74, 0.3), transparent)',
        borderRadius: '16px',
        mixBlendMode: 'screen'
      }
    },
    {
      id: 'tech-header',
      name: 'Tech Header',
      type: 'text',
      imageUrl: '',
      zIndex: 15,
      position: { x: 150, y: 20 },
      dimensions: { width: 100, height: 25 },
      cssStyles: {
        color: '#4FFFB0',
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '0 0 10px rgba(79, 255, 176, 0.8)',
        fontFamily: 'monospace',
        letterSpacing: '2px'
      },
      textContent: "HOLOGRAPHIC"
    },
    {
      id: 'info-panel',
      name: 'Info Panel',
      type: 'css-panel',
      imageUrl: '',
      zIndex: 12,
      position: { x: 40, y: 330 },
      dimensions: { width: 320, height: 200 },
      cssStyles: {
        background: 'linear-gradient(135deg, rgba(79, 255, 176, 0.1) 0%, rgba(74, 144, 255, 0.1) 100%)',
        border: '2px solid rgba(79, 255, 176, 0.5)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: 'inset 0 0 20px rgba(79, 255, 176, 0.2)'
      }
    }
  ]
};

// Vintage Ornate Frame
export const VINTAGE_ORNATE: CRDFrame = {
  id: 'vintage-ornate',
  name: 'Vintage Ornate',
  description: 'Elegant vintage frame with ornate decorative elements',
  category: 'vintage',
  rarity: 'uncommon',
  totalDimensions: {
    width: 400,
    height: 560
  },
  placeholderDimensions: {
    x: 50,
    y: 60,
    width: 300,
    height: 240
  },
  elements: [
    {
      id: 'ornate-border',
      name: 'Ornate Border',
      type: 'border',
      imageUrl: '/lovable-uploads/ornate-border.png',
      zIndex: 10,
      position: { x: 0, y: 0 },
      dimensions: { width: 400, height: 560 }
    },
    {
      id: 'vintage-corners',
      name: 'Vintage Corners',
      type: 'decorative',
      imageUrl: '/lovable-uploads/vintage-corners.png',
      zIndex: 12,
      position: { x: 0, y: 0 },
      dimensions: { width: 400, height: 560 }
    },
    {
      id: 'title-banner',
      name: 'Title Banner',
      type: 'label',
      imageUrl: '/lovable-uploads/title-banner.png',
      zIndex: 15,
      position: { x: 50, y: 320 },
      dimensions: { width: 300, height: 40 }
    },
    {
      id: 'description-scroll',
      name: 'Description Scroll',
      type: 'label',
      imageUrl: '/lovable-uploads/description-scroll.png',
      zIndex: 12,
      position: { x: 50, y: 380 },
      dimensions: { width: 300, height: 160 }
    }
  ]
};

export const CRD_FRAMES: CRDFrame[] = [
  OAKLAND_AS_DONRUSS,
  MODERN_HOLOGRAPHIC,
  VINTAGE_ORNATE
];

export const getCRDFrameById = (id: string): CRDFrame | undefined => {
  return CRD_FRAMES.find(frame => frame.id === id);
};

export const getCRDFramesByCategory = (category: string): CRDFrame[] => {
  return CRD_FRAMES.filter(frame => frame.category === category);
};

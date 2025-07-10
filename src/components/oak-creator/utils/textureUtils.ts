import { TextureLoader } from 'three';

export const createOaklandAsBrandingTexture = () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Cannot get canvas context');
    }

    // Background
    ctx.fillStyle = '#0f4c3a';
    ctx.fillRect(0, 0, 256, 360);

    // Oakland A's logo circle
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(128, 120, 40, 0, Math.PI * 2);
    ctx.fill();

    // "A" letter
    ctx.fillStyle = '#0f4c3a';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('A', 128, 140);

    // Text
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('OAKLAND', 128, 200);
    ctx.font = 'bold 14px Arial';
    ctx.fillText('ATHLETICS', 128, 220);
    ctx.font = '12px Arial';
    ctx.fillText('MEMORY CARD', 128, 260);

    // Border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 236, 340);

    const texture = new TextureLoader().load(canvas.toDataURL());
    return texture;
  } catch (error) {
    console.warn('Failed to create Oakland A\'s branding texture:', error);
    return null;
  }
};
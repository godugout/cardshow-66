
import { CardRegion } from './types';
import { calculateRegionConfidence, removeOverlappingRegions } from './confidenceCalculator';
import { detectFaces } from '@/lib/faceDetection';
import { refineCardBounds } from './preciseDetection';

export const detectCardRegions = async (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<CardRegion[]> => {
  console.log('🚀 Starting ULTIMATE card detection (Algorithm #101)...');
  
  // Convert canvas to file for face detection
  const canvasBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
  });
  const imageFile = new File([canvasBlob], 'temp.jpg', { type: 'image/jpeg' });
  
  // Multi-strategy detection combining ALL the best approaches
  const strategies = [
    { name: 'Face-Enhanced Detection', weight: 1.0 },
    { name: 'Edge-Based Detection', weight: 0.9 },
    { name: 'Texture Analysis', weight: 0.8 },
    { name: 'Corner Detection', weight: 0.7 },
    { name: 'Geometric Validation', weight: 0.6 }
  ];
  
  let allRegions: CardRegion[] = [];
  
  // Strategy 1: Face-Enhanced Detection
  console.log('🎯 Strategy 1: Face-Enhanced Detection');
  const faceRegions = await detectWithFaces(canvas, ctx, imageFile);
  allRegions.push(...faceRegions.map(r => ({ ...r, confidence: r.confidence * strategies[0].weight })));
  console.log(`Found ${faceRegions.length} face-enhanced regions`);
  
  // Strategy 2: Multi-Scale Edge Detection
  console.log('🎯 Strategy 2: Multi-Scale Edge Detection');
  const edgeRegions = detectWithEdges(canvas, ctx);
  allRegions.push(...edgeRegions.map(r => ({ ...r, confidence: r.confidence * strategies[1].weight })));
  console.log(`Found ${edgeRegions.length} edge-based regions`);
  
  // Strategy 3: Adaptive Grid with Texture Analysis
  console.log('🎯 Strategy 3: Adaptive Grid with Texture Analysis');
  const textureRegions = detectWithTexture(canvas, ctx);
  allRegions.push(...textureRegions.map(r => ({ ...r, confidence: r.confidence * strategies[2].weight })));
  console.log(`Found ${textureRegions.length} texture-based regions`);
  
  // Strategy 4: Corner-Based Detection
  console.log('🎯 Strategy 4: Corner-Based Detection');
  const cornerRegions = detectWithCorners(canvas, ctx);
  allRegions.push(...cornerRegions.map(r => ({ ...r, confidence: r.confidence * strategies[3].weight })));
  console.log(`Found ${cornerRegions.length} corner-based regions`);
  
  // Strategy 5: Geometric Pattern Matching
  console.log('🎯 Strategy 5: Geometric Pattern Matching');
  const geometricRegions = detectWithGeometry(canvas, ctx);
  allRegions.push(...geometricRegions.map(r => ({ ...r, confidence: r.confidence * strategies[4].weight })));
  console.log(`Found ${geometricRegions.length} geometric regions`);
  
  console.log(`🔍 Total raw regions from all strategies: ${allRegions.length}`);
  
  // Advanced clustering and consensus
  const clusteredRegions = performAdvancedClustering(allRegions);
  console.log(`🧠 Clustered to ${clusteredRegions.length} consensus regions`);
  
  // Apply final confidence boosting and filtering
  const finalRegions = applyFinalFiltering(clusteredRegions, canvas);
  console.log(`✅ Final filtered regions: ${finalRegions.length}`);
  
  // Refine bounds for pixel-perfect accuracy
  const refinedRegions = finalRegions.map(region => refineCardBounds(canvas, ctx, region));
  console.log(`🎯 Final refined regions: ${refinedRegions.length}`);
  
  return refinedRegions.slice(0, 12); // Return top 12 regions
};

async function detectWithFaces(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, imageFile: File): Promise<CardRegion[]> {
  let faces: any[] = [];
  try {
    faces = await detectFaces(imageFile);
  } catch (error) {
    console.warn('Face detection failed:', error);
    return [];
  }
  
  const regions: CardRegion[] = [];
  const targetAspectRatio = 2.5 / 3.5;
  
  for (const face of faces) {
    // Generate multiple card-sized regions around each face
    const scales = [1.8, 2.2, 2.6, 3.0]; // Different card sizes relative to face
    
    for (const scale of scales) {
      const cardWidth = face.width * scale;
      const cardHeight = cardWidth / targetAspectRatio;
      
      // Try different positions relative to face
      const positions = [
        { x: face.x - cardWidth * 0.3, y: face.y - cardHeight * 0.1 }, // Face upper-left
        { x: face.x - cardWidth * 0.1, y: face.y - cardHeight * 0.1 }, // Face upper-center
        { x: face.x - cardWidth * 0.3, y: face.y - cardHeight * 0.3 }, // Face center
      ];
      
      for (const pos of positions) {
        const x = Math.max(0, Math.min(canvas.width - cardWidth, pos.x));
        const y = Math.max(0, Math.min(canvas.height - cardHeight, pos.y));
        
        const confidence = calculateRegionConfidence(canvas, ctx, x, y, cardWidth, cardHeight, true);
        
        if (confidence > 0.3) {
          regions.push({ x, y, width: cardWidth, height: cardHeight, confidence });
        }
      }
    }
  }
  
  return regions;
}

function detectWithEdges(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): CardRegion[] {
  const regions: CardRegion[] = [];
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Multi-scale edge detection
  const scales = [0.08, 0.12, 0.16, 0.20, 0.25, 0.30]; // Various card sizes
  const targetAspectRatio = 2.5 / 3.5;
  
  for (const scale of scales) {
    const cardWidth = canvas.width * scale;
    const cardHeight = cardWidth / targetAspectRatio;
    
    if (cardHeight > canvas.height * 0.8) continue;
    
    const step = Math.max(8, Math.min(cardWidth, cardHeight) * 0.1);
    
    for (let y = 0; y <= canvas.height - cardHeight; y += step) {
      for (let x = 0; x <= canvas.width - cardWidth; x += step) {
        const edgeScore = calculateEdgeScore(data, canvas.width, canvas.height, x, y, cardWidth, cardHeight);
        
        if (edgeScore > 0.4) {
          const confidence = calculateRegionConfidence(canvas, ctx, x, y, cardWidth, cardHeight, false);
          
          if (confidence > 0.4) {
            regions.push({ x, y, width: cardWidth, height: cardHeight, confidence: confidence + edgeScore * 0.3 });
          }
        }
      }
    }
  }
  
  return regions;
}

function detectWithTexture(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): CardRegion[] {
  const regions: CardRegion[] = [];
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Adaptive grid based on image complexity
  const complexity = calculateImageComplexity(data, canvas.width, canvas.height);
  const gridDensity = Math.max(10, 30 - complexity * 20);
  
  const scales = [0.09, 0.13, 0.18, 0.24, 0.28];
  const targetAspectRatio = 2.5 / 3.5;
  
  for (const scale of scales) {
    const cardWidth = canvas.width * scale;
    const cardHeight = cardWidth / targetAspectRatio;
    
    if (cardHeight > canvas.height * 0.75) continue;
    
    const stepX = Math.max(gridDensity, cardWidth * 0.2);
    const stepY = Math.max(gridDensity, cardHeight * 0.2);
    
    for (let y = 0; y <= canvas.height - cardHeight; y += stepY) {
      for (let x = 0; x <= canvas.width - cardWidth; x += stepX) {
        const textureScore = analyzeRegionTexture(data, canvas.width, canvas.height, x, y, cardWidth, cardHeight);
        
        if (textureScore > 0.3) {
          const confidence = calculateRegionConfidence(canvas, ctx, x, y, cardWidth, cardHeight, false);
          
          if (confidence > 0.35) {
            regions.push({ x, y, width: cardWidth, height: cardHeight, confidence: confidence + textureScore * 0.2 });
          }
        }
      }
    }
  }
  
  return regions;
}

function detectWithCorners(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): CardRegion[] {
  const regions: CardRegion[] = [];
  const corners = detectImageCorners(ctx, canvas.width, canvas.height);
  
  // Use detected corners to form rectangular regions
  const targetAspectRatio = 2.5 / 3.5;
  
  for (let i = 0; i < corners.length; i++) {
    for (let j = i + 1; j < corners.length; j++) {
      const corner1 = corners[i];
      const corner2 = corners[j];
      
      // Try to form rectangles from corner pairs
      const width = Math.abs(corner2.x - corner1.x);
      const height = Math.abs(corner2.y - corner1.y);
      
      if (width > 0 && height > 0) {
        const aspectRatio = width / height;
        
        if (Math.abs(aspectRatio - targetAspectRatio) < 0.15) {
          const x = Math.min(corner1.x, corner2.x);
          const y = Math.min(corner1.y, corner2.y);
          
          const confidence = calculateRegionConfidence(canvas, ctx, x, y, width, height, false);
          
          if (confidence > 0.3) {
            regions.push({ x, y, width, height, confidence: confidence + 0.1 });
          }
        }
      }
    }
  }
  
  return regions;
}

function detectWithGeometry(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): CardRegion[] {
  const regions: CardRegion[] = [];
  const targetAspectRatio = 2.5 / 3.5;
  
  // Golden ratio and rule of thirds positioning
  const goldenRatio = 1.618;
  const positions = [
    { x: canvas.width / goldenRatio, y: canvas.height / goldenRatio },
    { x: canvas.width / 3, y: canvas.height / 3 },
    { x: (canvas.width * 2) / 3, y: canvas.height / 3 },
    { x: canvas.width / 3, y: (canvas.height * 2) / 3 },
    { x: (canvas.width * 2) / 3, y: (canvas.height * 2) / 3 },
    { x: canvas.width * 0.15, y: canvas.height * 0.15 },
    { x: canvas.width * 0.85, y: canvas.height * 0.15 },
    { x: canvas.width * 0.15, y: canvas.height * 0.85 },
    { x: canvas.width * 0.85, y: canvas.height * 0.85 }
  ];
  
  const scales = [0.10, 0.15, 0.20, 0.25, 0.30];
  
  for (const pos of positions) {
    for (const scale of scales) {
      const cardWidth = canvas.width * scale;
      const cardHeight = cardWidth / targetAspectRatio;
      
      const x = Math.max(0, Math.min(canvas.width - cardWidth, pos.x - cardWidth / 2));
      const y = Math.max(0, Math.min(canvas.height - cardHeight, pos.y - cardHeight / 2));
      
      const confidence = calculateRegionConfidence(canvas, ctx, x, y, cardWidth, cardHeight, false);
      
      if (confidence > 0.4) {
        regions.push({ x, y, width: cardWidth, height: cardHeight, confidence });
      }
    }
  }
  
  return regions;
}

// Helper functions for advanced detection
function calculateEdgeScore(data: Uint8ClampedArray, width: number, height: number, x: number, y: number, w: number, h: number): number {
  let edgeSum = 0;
  let sampleCount = 0;
  
  const samples = 20;
  const borders = [
    { from: [x, y], to: [x + w, y] }, // Top
    { from: [x + w, y], to: [x + w, y + h] }, // Right
    { from: [x + w, y + h], to: [x, y + h] }, // Bottom
    { from: [x, y + h], to: [x, y] } // Left
  ];
  
  for (const border of borders) {
    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1);
      const px = border.from[0] + (border.to[0] - border.from[0]) * t;
      const py = border.from[1] + (border.to[1] - border.from[1]) * t;
      
      const inside = getPixelBrightness(data, width, height, px - 2, py - 2);
      const outside = getPixelBrightness(data, width, height, px + 2, py + 2);
      
      edgeSum += Math.abs(inside - outside) / 255;
      sampleCount++;
    }
  }
  
  return sampleCount > 0 ? edgeSum / sampleCount : 0;
}

function calculateImageComplexity(data: Uint8ClampedArray, width: number, height: number): number {
  let totalVariance = 0;
  const samples = 1000;
  
  for (let i = 0; i < samples; i++) {
    const x = Math.random() * (width - 10) + 5;
    const y = Math.random() * (height - 10) + 5;
    
    let localVariance = 0;
    const center = getPixelBrightness(data, width, height, x, y);
    
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const neighbor = getPixelBrightness(data, width, height, x + dx, y + dy);
        localVariance += Math.pow(neighbor - center, 2);
      }
    }
    
    totalVariance += localVariance / 25;
  }
  
  return Math.min(1, (totalVariance / samples) / 10000);
}

function analyzeRegionTexture(data: Uint8ClampedArray, width: number, height: number, x: number, y: number, w: number, h: number): number {
  const samples = 30;
  let textureScore = 0;
  
  for (let i = 0; i < samples; i++) {
    const px = x + w * 0.1 + (w * 0.8) * Math.random();
    const py = y + h * 0.1 + (h * 0.8) * Math.random();
    
    const center = getPixelBrightness(data, width, height, px, py);
    let neighbors = 0;
    let neighborSum = 0;
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const neighbor = getPixelBrightness(data, width, height, px + dx, py + dy);
        neighborSum += Math.abs(neighbor - center);
        neighbors++;
      }
    }
    
    textureScore += (neighborSum / neighbors) / 255;
  }
  
  return textureScore / samples;
}

function detectImageCorners(ctx: CanvasRenderingContext2D, width: number, height: number): Array<{x: number, y: number, strength: number}> {
  const corners: Array<{x: number, y: number, strength: number}> = [];
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const step = Math.max(5, Math.min(width, height) / 50);
  
  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      const cornerStrength = calculateCornerStrength(data, width, height, x, y);
      
      if (cornerStrength > 0.5) {
        corners.push({ x, y, strength: cornerStrength });
      }
    }
  }
  
  return corners.sort((a, b) => b.strength - a.strength).slice(0, 20);
}

function calculateCornerStrength(data: Uint8ClampedArray, width: number, height: number, x: number, y: number): number {
  const center = getPixelBrightness(data, width, height, x, y);
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  let gradients: number[] = [];
  
  for (const [dx, dy] of directions) {
    const neighbor = getPixelBrightness(data, width, height, x + dx * 3, y + dy * 3);
    gradients.push(Math.abs(neighbor - center));
  }
  
  const maxGradient = Math.max(...gradients);
  const avgGradient = gradients.reduce((a, b) => a + b, 0) / gradients.length;
  const variance = gradients.reduce((sum, g) => sum + Math.pow(g - avgGradient, 2), 0) / gradients.length;
  
  return (maxGradient / 255) * (1 + Math.sqrt(variance) / 100);
}

function getPixelBrightness(data: Uint8ClampedArray, width: number, height: number, x: number, y: number): number {
  const px = Math.max(0, Math.min(width - 1, Math.floor(x)));
  const py = Math.max(0, Math.min(height - 1, Math.floor(y)));
  const idx = (py * width + px) * 4;
  
  if (idx >= 0 && idx < data.length - 3) {
    return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  }
  return 128;
}

function performAdvancedClustering(regions: CardRegion[]): CardRegion[] {
  const clusters: CardRegion[][] = [];
  const threshold = 0.25; // Clustering threshold
  
  for (const region of regions) {
    let addedToCluster = false;
    
    for (const cluster of clusters) {
      if (isRegionSimilarToCluster(region, cluster, threshold)) {
        cluster.push(region);
        addedToCluster = true;
        break;
      }
    }
    
    if (!addedToCluster) {
      clusters.push([region]);
    }
  }
  
  // Create consensus regions from clusters
  return clusters
    .filter(cluster => cluster.length >= 2) // Require at least 2 agreeing strategies
    .map(cluster => createConsensusRegion(cluster))
    .sort((a, b) => b.confidence - a.confidence);
}

function isRegionSimilarToCluster(region: CardRegion, cluster: CardRegion[], threshold: number): boolean {
  const representative = cluster[0];
  
  const centerX1 = region.x + region.width / 2;
  const centerY1 = region.y + region.height / 2;
  const centerX2 = representative.x + representative.width / 2;
  const centerY2 = representative.y + representative.height / 2;
  
  const distanceX = Math.abs(centerX1 - centerX2) / Math.max(region.width, representative.width);
  const distanceY = Math.abs(centerY1 - centerY2) / Math.max(region.height, representative.height);
  const sizeDiffW = Math.abs(region.width - representative.width) / Math.max(region.width, representative.width);
  const sizeDiffH = Math.abs(region.height - representative.height) / Math.max(region.height, representative.height);
  
  return distanceX < threshold && distanceY < threshold && sizeDiffW < threshold && sizeDiffH < threshold;
}

function createConsensusRegion(cluster: CardRegion[]): CardRegion {
  const avgX = cluster.reduce((sum, r) => sum + r.x, 0) / cluster.length;
  const avgY = cluster.reduce((sum, r) => sum + r.y, 0) / cluster.length;
  const avgWidth = cluster.reduce((sum, r) => sum + r.width, 0) / cluster.length;
  const avgHeight = cluster.reduce((sum, r) => sum + r.height, 0) / cluster.length;
  const maxConfidence = Math.max(...cluster.map(r => r.confidence));
  
  // Boost confidence based on consensus
  const consensusBoost = Math.min(0.3, cluster.length * 0.05);
  
  return {
    x: avgX,
    y: avgY,
    width: avgWidth,
    height: avgHeight,
    confidence: Math.min(1, maxConfidence + consensusBoost)
  };
}

function applyFinalFiltering(regions: CardRegion[], canvas: HTMLCanvasElement): CardRegion[] {
  return regions
    .filter(region => {
      // Size validation
      const minSize = Math.min(canvas.width, canvas.height) * 0.05;
      const maxSize = Math.min(canvas.width, canvas.height) * 0.6;
      const regionSize = Math.min(region.width, region.height);
      
      if (regionSize < minSize || regionSize > maxSize) return false;
      
      // Aspect ratio validation
      const aspectRatio = region.width / region.height;
      const targetRatio = 2.5 / 3.5;
      if (Math.abs(aspectRatio - targetRatio) > 0.3) return false;
      
      // Boundary validation
      if (region.x < 0 || region.y < 0 || 
          region.x + region.width > canvas.width || 
          region.y + region.height > canvas.height) return false;
      
      return region.confidence > 0.3;
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 12);
}

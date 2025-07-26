import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to use latest models
env.allowLocalModels = false;
env.useBrowserCache = true;

interface DetectionResult {
  score: number;
  label: string;
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

interface CardRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

const TARGET_ASPECT_RATIO = 2.5 / 3.5; // Standard trading card ratio
const ASPECT_RATIO_TOLERANCE = 0.3;

export const detectCardsWithAI = async (
  canvas: HTMLCanvasElement, 
  ctx: CanvasRenderingContext2D
): Promise<CardRegion[]> => {
  console.log('🤖 Starting AI-powered object detection...');
  
  try {
    // Initialize the object detection pipeline
    const detector = await pipeline(
      'object-detection',
      'Xenova/detr-resnet-50',
      { device: 'webgpu' }
    );
    
    // Convert canvas to image data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted for AI processing');
    
    // Run object detection
    const detections = await detector(imageDataUrl) as DetectionResult[];
    console.log('AI detection results:', detections);
    
    // Filter and convert detections to card regions
    const cardRegions = detections
      .filter(detection => isCardLikeObject(detection))
      .map(detection => convertToCardRegion(detection, canvas.width, canvas.height))
      .filter(region => isValidCardRegion(region));
    
    console.log(`Found ${cardRegions.length} card-like objects`);
    
    // Sort by confidence and return top results
    return cardRegions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20);
      
  } catch (error) {
    console.error('AI detection failed:', error);
    return [];
  }
};

function isCardLikeObject(detection: DetectionResult): boolean {
  // Check if the detected object could be a card
  const { box, label, score } = detection;
  
  // Calculate aspect ratio
  const width = box.xmax - box.xmin;
  const height = box.ymax - box.ymin;
  const aspectRatio = width / height;
  
  // Cards are typically rectangular
  const aspectRatioDiff = Math.abs(aspectRatio - TARGET_ASPECT_RATIO);
  
  // Accept objects that:
  // 1. Have reasonable confidence (>0.3)
  // 2. Have card-like aspect ratio OR are generic objects that might be cards
  // 3. Are not clearly non-card objects
  const isGoodConfidence = score > 0.3;
  const isGoodAspectRatio = aspectRatioDiff < ASPECT_RATIO_TOLERANCE;
  const couldBeCard = !isNonCardObject(label);
  
  return isGoodConfidence && (isGoodAspectRatio || couldBeCard);
}

function isNonCardObject(label: string): boolean {
  const nonCardLabels = [
    'person', 'car', 'bicycle', 'truck', 'bus', 'train', 'airplane',
    'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter',
    'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant',
    'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie',
    'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
    'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket'
  ];
  
  return nonCardLabels.some(nonCard => 
    label.toLowerCase().includes(nonCard.toLowerCase())
  );
}

function convertToCardRegion(
  detection: DetectionResult, 
  canvasWidth: number, 
  canvasHeight: number
): CardRegion {
  const { box, score } = detection;
  
  // Convert normalized coordinates to pixel coordinates
  const x = Math.round(box.xmin * canvasWidth);
  const y = Math.round(box.ymin * canvasHeight);
  const width = Math.round((box.xmax - box.xmin) * canvasWidth);
  const height = Math.round((box.ymax - box.ymin) * canvasHeight);
  
  return {
    x,
    y,
    width,
    height,
    confidence: score
  };
}

function isValidCardRegion(region: CardRegion): boolean {
  // Ensure the region is reasonable size
  const minSize = 50; // Minimum 50px
  const maxSizeRatio = 0.8; // Maximum 80% of image
  
  return (
    region.width >= minSize &&
    region.height >= minSize &&
    region.width / region.height > 0.3 && // Not too thin
    region.width / region.height < 2.0 && // Not too wide
    region.confidence > 0.2
  );
}

// Fallback using OpenCV-style contour detection for rectangular shapes
export const detectRectangularShapes = async (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): Promise<CardRegion[]> => {
  console.log('🔲 Starting contour-based rectangle detection...');
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Convert to grayscale
  const grayData = new Uint8Array(canvas.width * canvas.height);
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    grayData[i / 4] = gray;
  }
  
  // Simple edge detection using Sobel operator
  const edges = applySobelEdgeDetection(grayData, canvas.width, canvas.height);
  
  // Find contours and rectangular shapes
  const rectangles = findRectangularContours(edges, canvas.width, canvas.height);
  
  console.log(`Found ${rectangles.length} rectangular shapes`);
  return rectangles;
};

function applySobelEdgeDetection(
  grayData: Uint8Array, 
  width: number, 
  height: number
): Uint8Array {
  const edges = new Uint8Array(width * height);
  
  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = grayData[(y + ky) * width + (x + kx)];
          const kernelIndex = (ky + 1) * 3 + (kx + 1);
          gx += pixel * sobelX[kernelIndex];
          gy += pixel * sobelY[kernelIndex];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = Math.min(255, magnitude);
    }
  }
  
  return edges;
}

function findRectangularContours(
  edges: Uint8Array, 
  width: number, 
  height: number
): CardRegion[] {
  const rectangles: CardRegion[] = [];
  const threshold = 100; // Edge threshold
  
  // Simple rectangle detection by finding closed edge loops
  const visited = new Set<number>();
  
  for (let y = 10; y < height - 10; y += 5) {
    for (let x = 10; x < width - 10; x += 5) {
      const index = y * width + x;
      if (visited.has(index) || edges[index] < threshold) continue;
      
      // Try to trace a rectangular boundary
      const rect = traceRectangularBoundary(edges, width, height, x, y, threshold, visited);
      if (rect && isValidCardRegion(rect)) {
        rectangles.push(rect);
      }
    }
  }
  
  return rectangles
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 15);
}

function traceRectangularBoundary(
  edges: Uint8Array,
  width: number,
  height: number,
  startX: number,
  startY: number,
  threshold: number,
  visited: Set<number>
): CardRegion | null {
  
  // Simple approach: look for strong horizontal and vertical edges
  // that form a rectangular pattern
  
  let minX = startX, maxX = startX;
  let minY = startY, maxY = startY;
  let edgePoints = 0;
  
  // Expand outward looking for edges
  for (let r = 1; r < 100; r++) {
    let foundEdge = false;
    
    // Check perimeter at distance r
    for (let angle = 0; angle < 360; angle += 10) {
      const rad = (angle * Math.PI) / 180;
      const x = Math.round(startX + r * Math.cos(rad));
      const y = Math.round(startY + r * Math.sin(rad));
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const index = y * width + x;
      if (edges[index] > threshold) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        edgePoints++;
        foundEdge = true;
        visited.add(index);
      }
    }
    
    if (!foundEdge && r > 20) break;
  }
  
  const rectWidth = maxX - minX;
  const rectHeight = maxY - minY;
  
  if (rectWidth < 30 || rectHeight < 30 || edgePoints < 20) {
    return null;
  }
  
  const aspectRatio = rectWidth / rectHeight;
  const aspectRatioDiff = Math.abs(aspectRatio - TARGET_ASPECT_RATIO);
  const confidence = Math.max(0, 1 - aspectRatioDiff) * Math.min(1, edgePoints / 50);
  
  return {
    x: minX,
    y: minY,
    width: rectWidth,
    height: rectHeight,
    confidence
  };
}
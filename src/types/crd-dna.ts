export type CRDRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light';
export type SlabMaterialType = 'glass' | 'crystal' | 'metal' | 'energy' | 'custom';
export type EffectType = 'neon' | 'clouds' | 'gas' | 'particles' | 'lighting' | 'material' | 'distortion';
export type SpaceType = 'studio' | 'gallery' | 'showroom' | 'arena' | 'custom';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CRDAbility {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active' | 'triggered';
  cooldown?: number;
  energy_cost?: number;
}

export interface AnimationSet {
  id: string;
  name: string;
  duration: number;
  easing: string;
  keyframes: AnimationKeyframe[];
}

export interface AnimationKeyframe {
  time: number; // 0-1
  properties: Record<string, any>;
}

export interface InteractionMode {
  id: string;
  trigger: 'hover' | 'click' | 'scroll' | 'gesture';
  response: 'rotate' | 'scale' | 'glow' | 'effect' | 'animation';
  parameters: Record<string, any>;
}

export interface BaseLayer {
  id: string;
  type: 'image' | 'gradient' | 'texture' | 'procedural';
  aspectRatio: '2.5x3.5'; // Always locked to card ratio
  content: {
    url?: string; // For images
    colors?: string[]; // For gradients
    pattern?: string; // For procedural
  };
  opacity: number;
  blendMode: BlendMode;
}

export interface CropMask {
  shape: 'rectangle' | 'circle' | 'polygon';
  bounds: BoundingBox;
  feather: number;
}

export interface ElementContent {
  text?: string;
  imageUrl?: string;
  iconName?: string;
  badgeType?: string;
}

export interface Element {
  id: string;
  type: 'image' | 'text' | 'icon' | 'badge' | 'logo' | 'signature';
  position: {
    x: number; // Relative to card bounds
    y: number;
    z: number; // Depth layer
  };
  scale: number;
  rotation: number;
  opacity: number;
  content: ElementContent;
  cropMask?: CropMask;
}

export interface EffectAnimation {
  duration: number;
  easing: string;
  loop: boolean;
  pingPong: boolean;
}

export interface FlowPattern {
  direction: Vector3;
  turbulence: number;
  speed: number;
}

export interface EffectParameters {
  // Neon effects
  glowRadius?: number;
  pulseSpeed?: number;
  
  // Particle effects
  particleCount?: number;
  velocity?: Vector3;
  
  // Gas/Cloud effects
  density?: number;
  flow?: FlowPattern;
  
  // Material effects
  roughness?: number;
  metallic?: number;
  emissive?: string;
}

export interface Effect {
  id: string;
  type: EffectType;
  intensity: number;
  color?: string;
  animation?: EffectAnimation;
  boundingArea: 'slab' | 'card' | 'element' | 'custom';
  parameters: EffectParameters;
}

export interface SlabMaterial {
  type: SlabMaterialType;
  baseColor: string;
  roughness: number;
  metallic: number;
  emissive: string;
  refractionIndex?: number;
}

export interface EmbeddedImage {
  texture: string; // URL or texture ID
  position: Vector3; // Center of slab
  scale: Vector2; // Maintain 2.5x3.5 aspect
  depth: number; // How deep in slab
  clarity: number; // Image visibility through material
}

export interface CRD_DNA {
  // Core Identity
  id: string;
  name: string;
  rarity: CRDRarity;
  
  // Visual Properties
  baseLayer: BaseLayer;
  elements: Element[];
  effects: Effect[];
  frameId: string; // Locked combination reference
  
  // 3D Properties
  slabMaterial: SlabMaterial;
  slabDepth: number;
  embeddedImage: EmbeddedImage;
  embeddedDepth: number; // How deep image sits in slab
  translucency: number; // 0-1 opacity of slab material
  
  // Abilities & Interactions
  abilities: CRDAbility[];
  animations: AnimationSet[];
  interactionModes: InteractionMode[];
  
  // Metadata
  createdBy: string;
  mintNumber?: number;
  totalSupply?: number;
  crdTokenValue: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateSlot {
  id: string;
  type: 'image' | 'text' | 'custom';
  position: BoundingBox;
  constraints: SlotConstraints;
}

export interface SlotConstraints {
  maxFileSize?: number;
  allowedFormats?: string[];
  maxCharacters?: number;
  requiredFields?: string[];
}

export interface FrameRestrictions {
  maxElements: number;
  allowedEffects: EffectType[];
  requiredRarity?: CRDRarity;
  crdCost: number;
}

export interface Frame {
  id: string;
  name: string;
  category: 'sports' | 'gaming' | 'art' | 'custom';
  
  // Locked Components (cannot be changed once set)
  lockedBaseLayer: BaseLayer;
  lockedElements: Element[];
  lockedEffects: Effect[];
  
  // Template Properties
  templateSlots: TemplateSlot[];
  restrictions: FrameRestrictions;
  
  // Catalog Properties
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  crdCost: number; // Cost to use this frame
}

export interface DirectionalLight {
  color: string;
  intensity: number;
  position: Vector3;
  target?: Vector3;
}

export interface PointLight {
  color: string;
  intensity: number;
  position: Vector3;
  distance: number;
  decay: number;
}

export interface SpotLight {
  color: string;
  intensity: number;
  position: Vector3;
  target: Vector3;
  angle: number;
  penumbra: number;
}

export interface LightingSetup {
  ambientLight: {
    color: string;
    intensity: number;
  };
  directionalLights: DirectionalLight[];
  pointLights: PointLight[];
  spotLights: SpotLight[];
  environmentMap?: string; // HDR environment
}

export interface BackgroundContent {
  colors?: string[]; // For gradients
  imageUrl?: string; // For images/skyboxes
  procedural?: Record<string, any>; // For procedural backgrounds
}

export interface SpaceBackground {
  type: 'skybox' | 'gradient' | 'image' | 'procedural';
  content: BackgroundContent;
  parallax?: boolean;
  animated?: boolean;
}

export interface AtmosphereSettings {
  fog?: {
    color: string;
    near: number;
    far: number;
    density?: number;
  };
  particles?: {
    count: number;
    size: number;
    color: string;
    velocity: Vector3;
  };
}

export interface SpaceAnimation {
  id: string;
  target: 'camera' | 'lighting' | 'background' | 'atmosphere';
  animation: AnimationSet;
  autoPlay: boolean;
}

export interface CameraControls {
  enableRotation: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  minDistance: number;
  maxDistance: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
}

export interface InteractiveZone {
  id: string;
  position: Vector3;
  size: Vector3;
  trigger: 'enter' | 'exit' | 'click' | 'hover';
  action: 'animation' | 'effect' | 'sound' | 'transition';
  parameters: Record<string, any>;
}

export interface PositioningRules {
  layout: 'single' | 'grid' | 'circular' | 'random' | 'custom';
  spacing?: number;
  alignment?: 'center' | 'left' | 'right' | 'top' | 'bottom';
  maxCards?: number;
}

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  
  // Environmental Properties
  lighting: LightingSetup;
  background: SpaceBackground;
  atmosphere: AtmosphereSettings;
  
  // Interactive Elements
  animations: SpaceAnimation[];
  cameraControls: CameraControls;
  interactiveZones: InteractiveZone[];
  
  // Display Rules
  cardPositioning: PositioningRules;
  effectsMultiplier: number; // Enhance/reduce effects in this space
}
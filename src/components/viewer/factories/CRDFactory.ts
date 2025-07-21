import type { CRD_DNA, BaseLayer, Element, Effect, SlabMaterial, EmbeddedImage } from '@/types/crd-dna';

export class CRDFactory {
  static createBaseCRD(imageUrl: string, name: string = 'Untitled CRD'): CRD_DNA {
    const baseId = `crd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: baseId,
      name,
      rarity: 'Common',
      
      baseLayer: this.createDefaultBaseLayer(imageUrl),
      elements: [],
      effects: [],
      frameId: 'default_frame',
      
      slabMaterial: this.createDefaultSlabMaterial('glass'),
      slabDepth: 0.2,
      embeddedImage: this.createDefaultEmbeddedImage(imageUrl),
      embeddedDepth: 0.1,
      translucency: 0.3,
      
      abilities: [],
      animations: [],
      interactionModes: [],
      
      createdBy: 'system',
      crdTokenValue: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static createDefaultBaseLayer(imageUrl: string): BaseLayer {
    return {
      id: 'base_layer_default',
      type: 'image',
      aspectRatio: '2.5x3.5',
      content: {
        url: imageUrl
      },
      opacity: 1.0,
      blendMode: 'normal'
    };
  }

  static createDefaultEmbeddedImage(imageUrl: string): EmbeddedImage {
    return {
      texture: imageUrl,
      position: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1 },
      depth: 0.1,
      clarity: 0.95
    };
  }

  static createDefaultSlabMaterial(type: 'glass' | 'crystal' | 'metal' | 'energy' = 'glass'): SlabMaterial {
    const materials = {
      glass: {
        type: 'glass' as const,
        baseColor: '#e0f2fe',
        roughness: 0.1,
        metallic: 0.0,
        emissive: '#000000',
        refractionIndex: 1.5
      },
      crystal: {
        type: 'crystal' as const,
        baseColor: '#f3e8ff',
        roughness: 0.05,
        metallic: 0.2,
        emissive: '#8b5cf6',
        refractionIndex: 2.4
      },
      metal: {
        type: 'metal' as const,
        baseColor: '#f8fafc',
        roughness: 0.3,
        metallic: 0.9,
        emissive: '#000000',
        refractionIndex: 1.0
      },
      energy: {
        type: 'energy' as const,
        baseColor: '#06b6d4',
        roughness: 0.0,
        metallic: 0.0,
        emissive: '#06b6d4',
        refractionIndex: 1.3
      }
    };

    return materials[type];
  }

  static addNeonEffect(crd: CRD_DNA, color: string = '#00ffff', intensity: number = 0.8): CRD_DNA {
    const neonEffect: Effect = {
      id: `neon_${Date.now()}`,
      type: 'neon',
      intensity,
      color,
      boundingArea: 'slab',
      parameters: {
        glowRadius: 0.2,
        pulseSpeed: 2.0
      }
    };

    return {
      ...crd,
      effects: [...crd.effects, neonEffect],
      updated_at: new Date().toISOString()
    };
  }

  static addParticleEffect(crd: CRD_DNA, color: string = '#ffffff', intensity: number = 0.6): CRD_DNA {
    const particleEffect: Effect = {
      id: `particles_${Date.now()}`,
      type: 'particles',
      intensity,
      color,
      boundingArea: 'slab',
      parameters: {
        particleCount: 50,
        velocity: { x: 0, y: 0.1, z: 0 }
      }
    };

    return {
      ...crd,
      effects: [...crd.effects, particleEffect],
      updated_at: new Date().toISOString()
    };
  }

  static addLightingEffect(crd: CRD_DNA, color: string = '#ffffff', intensity: number = 1.0): CRD_DNA {
    const lightingEffect: Effect = {
      id: `lighting_${Date.now()}`,
      type: 'lighting',
      intensity,
      color,
      boundingArea: 'slab',
      parameters: {}
    };

    return {
      ...crd,
      effects: [...crd.effects, lightingEffect],
      updated_at: new Date().toISOString()
    };
  }

  static setSlabMaterial(crd: CRD_DNA, materialType: 'glass' | 'crystal' | 'metal' | 'energy'): CRD_DNA {
    return {
      ...crd,
      slabMaterial: this.createDefaultSlabMaterial(materialType),
      updated_at: new Date().toISOString()
    };
  }

  static setTranslucency(crd: CRD_DNA, translucency: number): CRD_DNA {
    return {
      ...crd,
      translucency: Math.max(0.1, Math.min(1.0, translucency)),
      updated_at: new Date().toISOString()
    };
  }

  static setRarity(crd: CRD_DNA, rarity: CRD_DNA['rarity']): CRD_DNA {
    const rarityEffects = {
      Common: [],
      Uncommon: ['neon'],
      Rare: ['neon', 'particles'],
      Epic: ['neon', 'particles', 'lighting'],
      Legendary: ['neon', 'particles', 'lighting'],
      Mythic: ['neon', 'particles', 'lighting']
    };

    let updatedCrd = { ...crd, rarity, updated_at: new Date().toISOString() };

    // Add effects based on rarity
    const effects = rarityEffects[rarity];
    if (effects.includes('neon')) {
      updatedCrd = this.addNeonEffect(updatedCrd, this.getRarityColor(rarity), 0.8);
    }
    if (effects.includes('particles')) {
      updatedCrd = this.addParticleEffect(updatedCrd, this.getRarityColor(rarity), 0.6);
    }
    if (effects.includes('lighting')) {
      updatedCrd = this.addLightingEffect(updatedCrd, this.getRarityColor(rarity), 1.2);
    }

    return updatedCrd;
  }

  static getRarityColor(rarity: CRD_DNA['rarity']): string {
    const colors = {
      Common: '#6b7280',
      Uncommon: '#10b981',
      Rare: '#3b82f6',
      Epic: '#8b5cf6',
      Legendary: '#f59e0b',
      Mythic: '#ef4444'
    };
    return colors[rarity];
  }

  static getOptimalMaterialForRarity(rarity: CRD_DNA['rarity']): 'glass' | 'crystal' | 'metal' | 'energy' {
    const materials = {
      Common: 'glass',
      Uncommon: 'glass',
      Rare: 'crystal',
      Epic: 'crystal',
      Legendary: 'energy',
      Mythic: 'energy'
    } as const;
    
    return materials[rarity];
  }

  static createOptimalTemplate(imageUrl: string, rarity: CRD_DNA['rarity'], name: string): CRD_DNA {
    let crd = this.createBaseCRD(imageUrl, name);
    
    // Set optimal material for rarity
    const optimalMaterial = this.getOptimalMaterialForRarity(rarity);
    crd = this.setSlabMaterial(crd, optimalMaterial);
    
    // Set rarity and associated effects
    crd = this.setRarity(crd, rarity);
    
    // Adjust translucency based on rarity
    const translucencyMap = {
      Common: 0.2,
      Uncommon: 0.25,
      Rare: 0.3,
      Epic: 0.35,
      Legendary: 0.4,
      Mythic: 0.45
    };
    crd = this.setTranslucency(crd, translucencyMap[rarity]);
    
    return crd;
  }
}
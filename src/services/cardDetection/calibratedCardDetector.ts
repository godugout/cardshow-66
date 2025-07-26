/**
 * Calibrated Card Detection System
 * 
 * This is the main orchestrator that combines all detection methods
 * with properly calibrated parameters to reliably find 10-12 cards
 * in grid layouts without performance issues.
 */

import { histogramCardDetector } from './histogramDetector';
import { templateCardMatcher } from './templateMatcher';
import { houghTransformDetector } from './houghTransformDetector';
import { advancedCardDetector } from './advancedCardDetector';

export interface CalibratedDetectedCard {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  confidence: number;
  aspectRatio: number;
  method: string;
  corners: Array<{ x: number; y: number }>;
  edgeStrength?: number;
  colorVariance?: number;
  textureScore?: number;
}

export interface CalibratedDetectionResult {
  cards: CalibratedDetectedCard[];
  processingTime: number;
  methodsUsed: string[];
  totalCandidates: number;
  debugInfo: {
    histogramResults: number;
    templateResults: number;
    houghResults: number;
    advancedResults: number;
    ensembleVoting: number;
    finalFiltered: number;
  };
}

export class CalibratedCardDetector {
  private readonly MAX_PROCESSING_TIME = 15000; // 15 seconds max
  private readonly TARGET_CARD_COUNT = 12;
  private readonly MAX_FINAL_RESULTS = 50; // User requested max

  async detectCards(image: HTMLImageElement): Promise<CalibratedDetectionResult> {
    const startTime = performance.now();
    const methodsUsed: string[] = [];
    let allCandidates: CalibratedDetectedCard[] = [];

    console.log('🎯 Starting calibrated multi-method card detection...');

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Detection timeout')), this.MAX_PROCESSING_TIME);
    });

    try {
      // Run all detection methods in parallel with timeout
      const detectionPromise = this.runAllDetectionMethods(image, methodsUsed, allCandidates);
      await Promise.race([detectionPromise, timeoutPromise]);

      // Apply ensemble voting and filtering
      const finalCards = this.applyEnsembleVoting(allCandidates);

      const processingTime = performance.now() - startTime;

      console.log(`✅ Calibrated detection complete: ${finalCards.length} cards found in ${processingTime.toFixed(0)}ms`);

      return {
        cards: finalCards,
        processingTime,
        methodsUsed,
        totalCandidates: allCandidates.length,
        debugInfo: {
          histogramResults: allCandidates.filter(c => c.method === 'histogram').length,
          templateResults: allCandidates.filter(c => c.method === 'template').length,
          houghResults: allCandidates.filter(c => c.method === 'hough').length,
          advancedResults: allCandidates.filter(c => c.method === 'advanced').length,
          ensembleVoting: allCandidates.length,
          finalFiltered: finalCards.length
        }
      };
    } catch (error) {
      console.error('⚠️ Detection failed or timed out:', error);
      
      // Return whatever candidates we have so far
      const finalCards = this.applyEnsembleVoting(allCandidates);
      
      return {
        cards: finalCards,
        processingTime: performance.now() - startTime,
        methodsUsed,
        totalCandidates: allCandidates.length,
        debugInfo: {
          histogramResults: allCandidates.filter(c => c.method === 'histogram').length,
          templateResults: allCandidates.filter(c => c.method === 'template').length,
          houghResults: allCandidates.filter(c => c.method === 'hough').length,
          advancedResults: allCandidates.filter(c => c.method === 'advanced').length,
          ensembleVoting: allCandidates.length,
          finalFiltered: finalCards.length
        }
      };
    }
  }

  private async runAllDetectionMethods(
    image: HTMLImageElement, 
    methodsUsed: string[], 
    allCandidates: CalibratedDetectedCard[]
  ): Promise<void> {
    // Method 1: Histogram Detection (fast, good for color patterns)
    try {
      const histogramStart = performance.now();
      const histogramResults = await histogramCardDetector.detectCards(image);
      const histogramTime = performance.now() - histogramStart;
      
      console.log(`📊 Histogram: ${histogramResults.length} candidates in ${histogramTime.toFixed(0)}ms`);
      
      histogramResults.forEach(card => {
        allCandidates.push({
          ...card,
          method: 'histogram'
        });
      });
      methodsUsed.push('histogram');
    } catch (error) {
      console.warn('⚠️ Histogram detection failed:', error);
    }

    // Method 2: Template Matching (good for standard layouts)
    try {
      const templateStart = performance.now();
      const templateResults = await templateCardMatcher.detectCards(image);
      const templateTime = performance.now() - templateStart;
      
      console.log(`🎯 Template: ${templateResults.length} candidates in ${templateTime.toFixed(0)}ms`);
      
      templateResults.forEach(card => {
        allCandidates.push({
          ...card,
          method: 'template'
        });
      });
      methodsUsed.push('template');
    } catch (error) {
      console.warn('⚠️ Template matching failed:', error);
    }

    // Method 3: Hough Transform (good for geometric patterns)
    try {
      const houghStart = performance.now();
      const houghResults = await houghTransformDetector.detectCards(image);
      const houghTime = performance.now() - houghStart;
      
      console.log(`📐 Hough: ${houghResults.length} candidates in ${houghTime.toFixed(0)}ms`);
      
      houghResults.forEach(card => {
        allCandidates.push({
          ...card,
          method: 'hough'
        });
      });
      methodsUsed.push('hough');
    } catch (error) {
      console.warn('⚠️ Hough transform failed:', error);
    }

    // Method 4: Advanced Detection (comprehensive but slower)
    try {
      const advancedStart = performance.now();
      const advancedResults = await advancedCardDetector.detectCards(image);
      const advancedTime = performance.now() - advancedStart;
      
      console.log(`🔍 Advanced: ${advancedResults.cards.length} candidates in ${advancedTime.toFixed(0)}ms`);
      
      advancedResults.cards.forEach(card => {
        allCandidates.push({
          ...card,
          method: 'advanced'
        });
      });
      methodsUsed.push('advanced');
    } catch (error) {
      console.warn('⚠️ Advanced detection failed:', error);
    }
  }

  private applyEnsembleVoting(candidates: CalibratedDetectedCard[]): CalibratedDetectedCard[] {
    console.log(`🗳️ Applying ensemble voting to ${candidates.length} candidates...`);

    // Group overlapping candidates
    const groups = this.groupOverlappingCandidates(candidates);
    console.log(`📊 Grouped into ${groups.length} candidate groups`);

    // For each group, select the best candidate using ensemble voting
    const votedCandidates: CalibratedDetectedCard[] = [];

    groups.forEach((group, index) => {
      if (group.length === 1) {
        // Single candidate - keep if confidence is reasonable
        if (group[0].confidence > 0.3) {
          votedCandidates.push(group[0]);
        }
      } else {
        // Multiple candidates - apply ensemble voting
        const bestCandidate = this.selectBestFromGroup(group);
        if (bestCandidate) {
          votedCandidates.push(bestCandidate);
        }
      }
    });

    // Sort by confidence and limit results
    const finalResults = votedCandidates
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.MAX_FINAL_RESULTS);

    console.log(`✅ Ensemble voting complete: ${finalResults.length} final candidates`);
    return finalResults;
  }

  private groupOverlappingCandidates(candidates: CalibratedDetectedCard[]): CalibratedDetectedCard[][] {
    const groups: CalibratedDetectedCard[][] = [];
    const processed = new Set<string>();

    for (const candidate of candidates) {
      if (processed.has(candidate.id)) continue;

      const group = [candidate];
      processed.add(candidate.id);

      // Find all overlapping candidates
      for (const other of candidates) {
        if (processed.has(other.id)) continue;

        const overlap = this.calculateOverlap(candidate.bounds, other.bounds);
        if (overlap > 0.3) { // 30% overlap threshold
          group.push(other);
          processed.add(other.id);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  private selectBestFromGroup(group: CalibratedDetectedCard[]): CalibratedDetectedCard | null {
    if (group.length === 0) return null;

    // Calculate ensemble score for each candidate
    const scoredCandidates = group.map(candidate => {
      let ensembleScore = candidate.confidence * 0.4; // Base confidence weight

      // Bonus for multiple method agreement
      const methodCount = new Set(group.map(c => c.method)).size;
      if (methodCount > 1) {
        ensembleScore += 0.2; // Multi-method bonus
      }

      // Bonus for aspect ratio correctness
      const targetAspectRatio = 2.5 / 3.5;
      const aspectRatioScore = 1 - Math.abs(candidate.aspectRatio - targetAspectRatio) / 0.3;
      ensembleScore += Math.max(0, aspectRatioScore) * 0.2;

      // Bonus for edge strength if available
      if (candidate.edgeStrength !== undefined) {
        ensembleScore += candidate.edgeStrength * 0.1;
      }

      // Bonus for color/texture if available
      if (candidate.colorVariance !== undefined) {
        ensembleScore += Math.min(candidate.colorVariance, 1.0) * 0.1;
      }

      return { ...candidate, ensembleScore };
    });

    // Return the highest scoring candidate
    return scoredCandidates
      .sort((a, b) => b.ensembleScore - a.ensembleScore)[0] || null;
  }

  private calculateOverlap(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): number {
    const x1 = Math.max(rect1.x, rect2.x);
    const y1 = Math.max(rect1.y, rect2.y);
    const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

    if (x2 <= x1 || y2 <= y1) return 0;

    const overlapArea = (x2 - x1) * (y2 - y1);
    const area1 = rect1.width * rect1.height;
    const area2 = rect2.width * rect2.height;
    const unionArea = area1 + area2 - overlapArea;

    return overlapArea / unionArea;
  }
}

export const calibratedCardDetector = new CalibratedCardDetector();

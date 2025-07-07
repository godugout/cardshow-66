import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from './use-mobile';

export type PerformanceMode = 'high' | 'medium' | 'low';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isStable: boolean;
}

interface Mobile3DPerformanceConfig {
  fpsThresholds: {
    low: number;
    medium: number;
  };
  monitoringInterval: number;
  stabilityFrameCount: number;
}

const DEFAULT_CONFIG: Mobile3DPerformanceConfig = {
  fpsThresholds: {
    low: 20,
    medium: 40
  },
  monitoringInterval: 1000, // 1 second
  stabilityFrameCount: 60
};

export const useMobile3DPerformance = (config: Partial<Mobile3DPerformanceConfig> = {}) => {
  const isMobile = useIsMobile();
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>('high');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isStable: true
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameTimesRef = useRef<number[]>([]);
  const rafIdRef = useRef<number>();

  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Performance monitoring
  useEffect(() => {
    if (!isMobile) {
      setPerformanceMode('high');
      return;
    }

    // Initial mobile optimization
    const isLowEndDevice = () => {
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const isSlowConnection = (navigator as any).connection?.effectiveType === 'slow-2g' || 
                               (navigator as any).connection?.effectiveType === '2g';
      
      return hardwareConcurrency <= 2 || deviceMemory <= 2 || isSlowConnection;
    };

    // Set initial performance mode based on device capabilities
    if (isLowEndDevice()) {
      setPerformanceMode('low');
    } else {
      setPerformanceMode('medium');
    }

    const monitorPerformance = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      frameCountRef.current++;

      // Track frame times for stability analysis
      frameTimesRef.current.push(deltaTime);
      if (frameTimesRef.current.length > fullConfig.stabilityFrameCount) {
        frameTimesRef.current.shift();
      }

      // Calculate metrics every monitoring interval
      if (deltaTime >= fullConfig.monitoringInterval) {
        const fps = (frameCountRef.current * 1000) / deltaTime;
        const avgFrameTime = deltaTime / frameCountRef.current;
        
        // Calculate stability (variance in frame times)
        const frameTimes = frameTimesRef.current;
        const avgFrameTimeForStability = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const variance = frameTimes.reduce((sum, time) => sum + Math.pow(time - avgFrameTimeForStability, 2), 0) / frameTimes.length;
        const isStable = variance < 50; // Low variance means stable performance

        setMetrics({
          fps: Math.round(fps),
          frameTime: Math.round(avgFrameTime * 100) / 100,
          isStable
        });

        // Adjust performance mode based on FPS and stability
        if (fps < fullConfig.fpsThresholds.low || !isStable) {
          if (performanceMode !== 'low') {
            setPerformanceMode('low');
          }
        } else if (fps < fullConfig.fpsThresholds.medium) {
          if (performanceMode === 'high') {
            setPerformanceMode('medium');
          }
        } else if (fps > fullConfig.fpsThresholds.medium + 10 && isStable) {
          // Only upgrade if significantly better performance
          if (performanceMode === 'low') {
            setPerformanceMode('medium');
          } else if (performanceMode === 'medium' && !isMobile) {
            setPerformanceMode('high');
          }
        }

        // Reset counters
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      rafIdRef.current = requestAnimationFrame(monitorPerformance);
    };

    rafIdRef.current = requestAnimationFrame(monitorPerformance);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isMobile, performanceMode, fullConfig]);

  // Get performance settings based on current mode
  const getPerformanceSettings = () => {
    switch (performanceMode) {
      case 'low':
        return {
          shadows: false,
          environmentIntensity: 0.2,
          lightIntensity: 0.4,
          pixelRatio: 0.75,
          antialias: false,
          effectsQuality: 0.5,
          maxEffects: 2
        };
      case 'medium':
        return {
          shadows: false,
          environmentIntensity: 0.5,
          lightIntensity: 0.6,
          pixelRatio: 1,
          antialias: true,
          effectsQuality: 0.75,
          maxEffects: 4
        };
      default:
        return {
          shadows: true,
          environmentIntensity: 0.8,
          lightIntensity: 0.8,
          pixelRatio: Math.min(2, window.devicePixelRatio),
          antialias: true,
          effectsQuality: 1,
          maxEffects: 8
        };
    }
  };

  return {
    performanceMode,
    metrics,
    isMobile,
    settings: getPerformanceSettings(),
    isOptimizing: performanceMode !== 'high'
  };
};
// Performance Monitoring and Optimization Utilities
import { toast } from 'sonner';

export interface PerformanceMetrics {
  pageLoad: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage?: number;
  connectionType?: string;
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals monitoring
    this.measureCoreWebVitals();
    
    // Memory usage monitoring
    this.measureMemoryUsage();
    
    // Connection quality detection
    this.detectConnectionQuality();
  }

  private measureCoreWebVitals() {
    // First Contentful Paint
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      }
    });
    this.observer.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.metrics.cumulativeLayoutShift = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
      }
    }).observe({ entryTypes: ['first-input'] });
  }

  private measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  private detectConnectionQuality() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.connectionType = connection.effectiveType;
    }
  }

  public getMetrics(): PerformanceMetrics {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const pageLoadTime = navigationTiming ? navigationTiming.loadEventEnd - navigationTiming.fetchStart : 0;
    
    return {
      pageLoad: pageLoadTime,
      timeToInteractive: this.calculateTimeToInteractive(),
      firstContentfulPaint: this.metrics.firstContentfulPaint || 0,
      largestContentfulPaint: this.metrics.largestContentfulPaint || 0,
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift || 0,
      firstInputDelay: this.metrics.firstInputDelay || 0,
      memoryUsage: this.metrics.memoryUsage,
      connectionType: this.metrics.connectionType
    };
  }

  private calculateTimeToInteractive(): number {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationTiming) {
      return navigationTiming.domInteractive - navigationTiming.fetchStart;
    }
    return 0;
  }

  public validatePerformanceTargets(): boolean {
    const metrics = this.getMetrics();
    const targets = {
      largestContentfulPaint: 2500, // 2.5s
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.1
    };

    const results = {
      lcp: metrics.largestContentfulPaint <= targets.largestContentfulPaint,
      fid: metrics.firstInputDelay <= targets.firstInputDelay,
      cls: metrics.cumulativeLayoutShift <= targets.cumulativeLayoutShift
    };

    if (!results.lcp || !results.fid || !results.cls) {
      console.warn('Performance targets not met:', metrics);
      return false;
    }

    return true;
  }

  public generatePerformanceReport(): string {
    const metrics = this.getMetrics();
    return `
📊 CARDSHOW PERFORMANCE REPORT
==============================
🚀 Page Load: ${metrics.pageLoad}ms
⚡ Time to Interactive: ${metrics.timeToInteractive}ms
🎨 First Contentful Paint: ${metrics.firstContentfulPaint}ms
📱 Largest Contentful Paint: ${metrics.largestContentfulPaint}ms
📐 Cumulative Layout Shift: ${metrics.cumulativeLayoutShift}
🖱️ First Input Delay: ${metrics.firstInputDelay}ms
💾 Memory Usage: ${metrics.memoryUsage}MB
🌐 Connection: ${metrics.connectionType}

TARGET VALIDATION:
LCP: ${metrics.largestContentfulPaint <= 2500 ? '✅' : '❌'} (Target: <2.5s)
FID: ${metrics.firstInputDelay <= 100 ? '✅' : '❌'} (Target: <100ms)  
CLS: ${metrics.cumulativeLayoutShift <= 0.1 ? '✅' : '❌'} (Target: <0.1)
`;
  }
}

// Mobile performance optimization
export const optimizeForMobile = () => {
  if (typeof window === 'undefined') return;

  // Detect low-end devices
  const isLowEndDevice = () => {
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory <= 4; // 4GB or less
    }
    return /Android.*Chrome\/[.0-9]*/.test(navigator.userAgent);
  };

  // Optimize 3D quality for mobile
  const optimize3DQuality = () => {
    if (isLowEndDevice()) {
      return {
        antialias: false,
        shadows: false,
        particleCount: 50,
        quality: 'low'
      };
    }
    return {
      antialias: true,
      shadows: true,
      particleCount: 200,
      quality: 'high'
    };
  };

  return {
    isLowEndDevice: isLowEndDevice(),
    settings3D: optimize3DQuality()
  };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return;

  const resources = performance.getEntriesByType('resource');
  const jsResources = resources.filter(r => r.name.includes('.js'));
  const cssResources = resources.filter(r => r.name.includes('.css'));

  const totalJSSize = jsResources.reduce((total, resource) => {
    return total + ((resource as any).transferSize || 0);
  }, 0);

  const totalCSSSize = cssResources.reduce((total, resource) => {
    return total + ((resource as any).transferSize || 0);
  }, 0);

  console.log(`📦 Bundle Analysis:
JS Total: ${(totalJSSize / 1024).toFixed(2)}KB
CSS Total: ${(totalCSSSize / 1024).toFixed(2)}KB
Target: <500KB initial load`);

  return {
    jsSize: totalJSSize,
    cssSize: totalCSSSize,
    withinTarget: (totalJSSize + totalCSSSize) < 512000 // 500KB
  };
};

// Global performance instance
export const performanceMonitor = new PerformanceMonitor();
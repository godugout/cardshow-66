// Enhanced Subdomain Routing System with Middleware-like Detection
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface SubdomainConfig {
  subdomain: 'www' | 'crdmkr' | '3dstudio';
  domain: string;
  basePath: string;
  title: string;
  description: string;
  theme: 'main' | 'crdmkr' | 'studio3d';
  primaryColor: 'orange' | 'blue' | 'green' | 'yellow';
  name: string;
  features: string[];
}

// Subdomain Configuration (Production-Ready)
export const SUBDOMAIN_CONFIG: Record<string, SubdomainConfig> = {
  'www': {
    subdomain: 'www',
    domain: 'www.cardshow.app',
    basePath: '/',
    title: 'Cardshow - Digital Collectibles Platform',
    description: 'Create, collect, and trade 3D digital cards with immersive experiences',
    theme: 'main',
    primaryColor: 'blue',
    name: 'Main Platform',
    features: ['marketplace', 'collections', 'social', 'trading']
  },
  'crdmkr': {
    subdomain: 'crdmkr',
    domain: 'crdmkr.cardshow.app',
    basePath: '/crdmkr',
    title: 'CRDMKR - Professional Frame Builder',
    description: 'Import PSD files and create professional card frame templates',
    theme: 'crdmkr',
    primaryColor: 'orange',
    name: 'CRDMKR',
    features: ['psd-import', 'layer-editing', 'frame-templates', 'preview']
  },
  '3dstudio': {
    subdomain: '3dstudio',
    domain: '3dstudio.cardshow.app',
    basePath: '/3dstudio',
    title: '3D Studio - Advanced Card Visualization',
    description: 'Create stunning 3D effects and export high-quality card renders',
    theme: 'studio3d',
    primaryColor: 'green',
    name: '3D Studio',
    features: ['3d-rendering', 'effects', 'materials', 'export']
  }
};

// Subdomain Detection and Routing Hook
export function useSubdomainRouting() {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect current subdomain from hostname and route
  const currentSubdomain = useMemo(() => {
    const hostname = window.location.hostname;
    const path = location.pathname;
    
    // Production domain detection
    if (hostname.includes('crdmkr.cardshow.app') || path.startsWith('/crdmkr')) {
      return SUBDOMAIN_CONFIG.crdmkr;
    }
    
    if (hostname.includes('3dstudio.cardshow.app') || path.startsWith('/3dstudio')) {
      return SUBDOMAIN_CONFIG['3dstudio'];
    }
    
    // Default to main platform
    return SUBDOMAIN_CONFIG.www;
  }, [location.pathname]);

  // Check if current route belongs to specific subdomain
  const isCurrentSubdomain = (targetSubdomain: string): boolean => {
    return currentSubdomain.subdomain === targetSubdomain;
  };

  // Navigate between subdomains (production-ready)
  const navigateToSubdomain = (targetSubdomain: string, path: string = '/') => {
    const config = SUBDOMAIN_CONFIG[targetSubdomain];
    if (!config) return;

    // In development, use client-side routing
    if (import.meta.env.DEV) {
      const fullPath = path.startsWith(config.basePath) ? path : `${config.basePath}${path}`;
      navigate(fullPath);
      return;
    }

    // In production, navigate to actual subdomain
    const protocol = window.location.protocol;
    const targetUrl = `${protocol}//${config.domain}${path}`;
    window.location.href = targetUrl;
  };

  // Session persistence across subdomains
  const persistSessionAcrossSubdomains = (sessionData: any) => {
    // Store session in localStorage with domain-wide accessibility
    localStorage.setItem('cardshow_session', JSON.stringify(sessionData));
    
    // Set cookie for cross-subdomain access (production)
    if (!import.meta.env.DEV) {
      document.cookie = `cardshow_session=${JSON.stringify(sessionData)}; domain=.cardshow.app; path=/; secure; samesite=strict`;
    }
  };

  // Retrieve session from any subdomain
  const getSessionFromSubdomain = () => {
    try {
      const localSession = localStorage.getItem('cardshow_session');
      if (localSession) {
        return JSON.parse(localSession);
      }
      
      // Fallback to cookie (production)
      const cookieMatch = document.cookie.match(/cardshow_session=([^;]+)/);
      if (cookieMatch) {
        return JSON.parse(decodeURIComponent(cookieMatch[1]));
      }
    } catch (error) {
      console.error('Error retrieving cross-subdomain session:', error);
    }
    
    return null;
  };

  return {
    currentSubdomain,
    isCurrentSubdomain,
    navigateToSubdomain,
    persistSessionAcrossSubdomains,
    getSessionFromSubdomain,
    // Configuration access
    subdomainConfig: SUBDOMAIN_CONFIG
  };
}
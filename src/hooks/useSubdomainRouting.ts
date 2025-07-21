// Subdomain routing simulation for unified Cardshow platform
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useEffect } from 'react';

export interface SubdomainConfig {
  name: string;
  path: string;
  title: string;
  description: string;
  theme: 'main' | 'crdmkr' | 'studio3d';
  primaryColor: 'green' | 'orange' | 'blue' | 'yellow';
}

export const SUBDOMAIN_CONFIGS: Record<string, SubdomainConfig> = {
  main: {
    name: 'www.cardshow.app',
    path: '/',
    title: 'Cardshow - Digital Collectibles Platform',
    description: 'Create, collect, and trade premium digital cards',
    theme: 'main',
    primaryColor: 'green'
  },
  crdmkr: {
    name: 'crdmkr.cardshow.app', 
    path: '/crdmkr',
    title: 'CRDMKR - Professional Frame Builder',
    description: 'PSD-powered frame creation for professional card designers',
    theme: 'crdmkr',
    primaryColor: 'orange'
  },
  studio3d: {
    name: '3dstudio.cardshow.app',
    path: '/studio',
    title: '3D Studio - Immersive Card Rendering',
    description: 'Advanced 3D visualization and effects for your cards',
    theme: 'studio3d', 
    primaryColor: 'blue'
  },
  marketplace: {
    name: 'www.cardshow.app/marketplace',
    path: '/marketplace',
    title: 'Cardshow Marketplace',
    description: 'Buy, sell, and discover unique digital collectibles',
    theme: 'main',
    primaryColor: 'blue'
  }
};

export function useSubdomainRouting() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine current subdomain context based on route
  const currentSubdomain = useMemo(() => {
    const path = location.pathname;
    
    if (path.startsWith('/crdmkr') || path.includes('psd')) {
      return SUBDOMAIN_CONFIGS.crdmkr;
    }
    if (path.startsWith('/studio')) {
      return SUBDOMAIN_CONFIGS.studio3d;
    }
    if (path.startsWith('/marketplace')) {
      return SUBDOMAIN_CONFIGS.marketplace;
    }
    
    return SUBDOMAIN_CONFIGS.main;
  }, [location.pathname]);

  // Update document title and meta tags based on subdomain
  useEffect(() => {
    document.title = currentSubdomain.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', currentSubdomain.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = currentSubdomain.description;
      document.head.appendChild(meta);
    }
    
    // Add subdomain-specific body class for styling
    document.body.className = document.body.className
      .replace(/subdomain-\w+/g, '')
      .trim();
    document.body.classList.add(`subdomain-${currentSubdomain.theme}`);
    
  }, [currentSubdomain]);

  const navigateToSubdomain = (subdomainKey: string, path: string = '') => {
    const config = SUBDOMAIN_CONFIGS[subdomainKey];
    if (config) {
      navigate(config.path + path);
    }
  };

  const isCurrentSubdomain = (subdomainKey: string) => {
    return currentSubdomain === SUBDOMAIN_CONFIGS[subdomainKey];
  };

  return {
    currentSubdomain,
    allSubdomains: SUBDOMAIN_CONFIGS,
    navigateToSubdomain,
    isCurrentSubdomain,
    getSubdomainConfig: (key: string) => SUBDOMAIN_CONFIGS[key]
  };
}
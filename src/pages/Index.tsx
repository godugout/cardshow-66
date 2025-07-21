
import React from 'react';
import { Link } from 'react-router-dom';
import { PlatformHeader } from '@/components/ui/design-system/organisms/PlatformHeader';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard, CRDCardContent, CRDCardHeader, CRDCardTitle, CRDCardDescription } from '@/components/ui/design-system/atoms/CRDCard';
import { Plus, Palette, Users, Trophy, Sparkles, ArrowRight, Star, Box, ShoppingBag, Zap, TrendingUp } from 'lucide-react';
import { FeaturedCardsGrid } from '@/components/home/FeaturedCardsGrid';

const Index = () => {
  const subdomainFeatures = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: 'CRDMKR Frame Builder',
      description: 'Professional PSD-powered frame creation with layer-based editing and real-time preview',
      href: '/crdmkr/frame-builder',
      badge: 'Professional',
      subdomain: 'crdmkr.cardshow.app',
      color: 'crd-orange',
      gradient: 'from-crd-orange/20 to-crd-orange/5'
    },
    {
      icon: <Box className="w-8 h-8" />,
      title: '3D Studio Renderer',
      description: 'Immersive 3D card visualization with advanced effects and materials',
      href: '/studio',
      badge: 'Cutting Edge',
      subdomain: '3dstudio.cardshow.app',
      color: 'crd-blue',
      gradient: 'from-crd-blue/20 to-crd-blue/5'
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: 'Marketplace Hub',
      description: 'Buy, sell, and discover unique digital collectibles with secure transactions',
      href: '/marketplace',
      badge: 'Revenue Share',
      subdomain: 'www.cardshow.app/marketplace',
      color: 'crd-blue',
      gradient: 'from-crd-blue/20 to-crd-blue/5'
    }
  ];

  const platformFeatures = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Creator Community',
      description: 'Connect with professional creators and card designers worldwide',
      href: '/community',
      metrics: '2,000+ Creators'
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Collections Gallery',
      description: 'Showcase your cards in beautiful, organized galleries',
      href: '/collections',
      metrics: '10,000+ Cards'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'CRD Tokens',
      description: 'Earn and spend platform tokens for premium features',
      href: '/credits',
      metrics: '70/30 Split'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Analytics Dashboard',
      description: 'Track performance, earnings, and community engagement',
      href: '/creator-dashboard',
      metrics: 'Real-time Data'
    }
  ];

  const platformStats = [
    { label: 'Digital Cards Created', value: '10,000+', color: 'text-crd-green' },
    { label: 'Professional Creators', value: '500+', color: 'text-crd-orange' },
    { label: 'Frame Templates', value: '100+', color: 'text-crd-blue' },
    { label: 'Community Members', value: '2,000+', color: 'text-crd-yellow' },
  ];

  return (
    <div className="min-h-screen bg-crd-black">
      <PlatformHeader 
        title="Cardshow"
        subtitle="Next-generation 3D digital collectibles platform"
        showSearch={true}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-crd-green/10 via-transparent to-crd-blue/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-crd-orange/5 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-2 px-4 py-2 bg-crd-surface/50 rounded-full border border-crd-border backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-crd-green" />
                <span className="text-sm font-medium text-crd-text-dim">Welcome to the Future of Digital Cards</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-crd-text mb-8 leading-tight font-display">
              Create{' '}
              <span className="text-transparent bg-gradient-to-r from-crd-green via-crd-blue to-crd-orange bg-clip-text">
                Boldly
              </span>
              <br />
              Collect{' '}
              <span className="text-transparent bg-gradient-to-r from-crd-orange via-crd-yellow to-crd-green bg-clip-text">
                Passionately
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-crd-text-dim mb-12 max-w-4xl mx-auto leading-relaxed">
              Professional PSD import tools, immersive 3D visualization, and creator-first marketplace 
              powered by CRD Tokens. Build the future of digital collectibles.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/crdmkr/frame-builder">
                <CRDButton variant="orange" size="lg" icon={<Palette className="w-5 h-5" />}>
                  Start with CRDMKR
                </CRDButton>
              </Link>
              
              <Link to="/studio">
                <CRDButton variant="blue" size="lg" icon={<Box className="w-5 h-5" />}>
                  3D Studio
                </CRDButton>
              </Link>
              
              <Link to="/marketplace">
                <CRDButton variant="secondary" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                  Explore Marketplace
                </CRDButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 border-y border-crd-border bg-crd-surface/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {platformStats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className={`text-3xl md:text-4xl font-bold font-display ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-crd-text-dim font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subdomain Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-crd-text mb-4 font-display">
              Specialized Creator Tools
            </h2>
            <p className="text-xl text-crd-text-dim max-w-3xl mx-auto">
              Professional-grade tools across dedicated subdomains for every aspect of digital card creation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {subdomainFeatures.map((feature, index) => (
              <Link key={index} to={feature.href} className="group">
                <CRDCard variant="default" hover="lift" className="h-full">
                  <CRDCardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-crd-surface-light rounded-lg text-crd-text group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <span className="text-xs font-mono text-crd-text-muted bg-crd-surface px-2 py-1 rounded">
                        {feature.badge}
                      </span>
                    </div>
                    <CRDCardTitle className="group-hover:text-crd-green transition-colors">
                      {feature.title}
                    </CRDCardTitle>
                    <CRDCardDescription>
                      {feature.description}
                    </CRDCardDescription>
                  </CRDCardHeader>
                  <CRDCardContent>
                    <div className="text-xs font-mono text-crd-text-muted mb-4">
                      {feature.subdomain}
                    </div>
                    <div className="flex items-center text-crd-green group-hover:translate-x-1 transition-transform">
                      <span className="text-sm font-medium">Access Tool</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CRDCardContent>
                </CRDCard>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

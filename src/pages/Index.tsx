
import React from 'react';
import { Link } from 'react-router-dom';
import { UniversalPageLayout, UniversalCard, UniversalButton, UniversalBadge } from '@/components/ui/design-system';
import { Plus, Palette, Users, Trophy, Sparkles, ArrowRight, Star } from 'lucide-react';
import { FeaturedCardsGrid } from '@/components/home/FeaturedCardsGrid';

const Index = () => {
  const features = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: 'Create Cards',
      description: 'Design stunning trading cards with our advanced creation tools',
      href: '/create/enhanced',
      badge: 'New',
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Studio',
      description: 'Professional workspace for advanced card design and editing',
      href: '/studio',
      badge: 'Pro',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community',
      description: 'Connect with other creators and share your masterpieces',
      href: '/community',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Dashboard',
      description: 'Track your creations, stats, and community engagement',
      href: '/creator-dashboard',
    },
  ];

  const stats = [
    { label: 'Cards Created', value: '10,000+' },
    { label: 'Active Creators', value: '500+' },
    { label: 'Templates', value: '100+' },
    { label: 'Community Members', value: '2,000+' },
  ];

  return (
    <UniversalPageLayout
      background="gradient"
      className="overflow-hidden"
    >
      {/* Hero Section */}
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4ade80]/10 via-transparent to-[#4ade80]/10 blur-3xl" />
        
        <div className="relative text-center py-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <UniversalBadge variant="outline" size="lg" icon={<Sparkles className="w-4 h-4" />}>
                Welcome to CardShow
              </UniversalBadge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Create{' '}
              <span className="text-transparent bg-gradient-to-r from-[#4ade80] to-[#22c55e] bg-clip-text">
                Amazing
              </span>
              <br />
              Trading Cards
            </h1>
            
            <p className="text-xl text-[#94a3b8] mb-10 max-w-2xl mx-auto leading-relaxed">
              Design, customize, and share professional-quality trading cards with our 
              powerful creation tools and vibrant community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/create/enhanced">
                <UniversalButton size="lg" className="min-w-[200px]">
                  <Plus className="w-5 h-5" />
                  Start Creating
                </UniversalButton>
              </Link>
              
              <Link to="/collections">
                <UniversalButton variant="outline" size="lg" className="min-w-[200px]">
                  Explore Gallery
                  <ArrowRight className="w-5 h-5" />
                </UniversalButton>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 border-y border-[#334155]/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-[#4ade80]">
                {stat.value}
              </div>
              <div className="text-[#94a3b8] font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Cards Section */}
      <FeaturedCardsGrid />

      {/* Features Section */}
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto">
            Professional tools and features to bring your card designs to life
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link key={index} to={feature.href} className="group">
              <UniversalCard 
                hover="glow" 
                className="h-full p-6 group-hover:border-[#4ade80]/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#4ade80]/10 rounded-lg flex items-center justify-center text-[#4ade80] group-hover:bg-[#4ade80]/20 transition-colors">
                    {feature.icon}
                  </div>
                  {feature.badge && (
                    <UniversalBadge variant="success" size="sm">
                      {feature.badge}
                    </UniversalBadge>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#4ade80] transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-[#94a3b8] leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="mt-4 flex items-center text-[#4ade80] group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-medium">Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </UniversalCard>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <UniversalCard className="text-center p-12 bg-gradient-to-r from-[#131316] to-[#1a1f2e] border-[#4ade80]/20">
          <Star className="w-16 h-16 text-[#4ade80] mx-auto mb-6" />
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your First Card?
          </h2>
          
          <p className="text-xl text-[#94a3b8] mb-8 max-w-2xl mx-auto">
            Join thousands of creators and start designing professional trading cards today.
          </p>
          
          <Link to="/create/enhanced">
            <UniversalButton size="lg">
              <Plus className="w-5 h-5" />
              Start Creating Now
            </UniversalButton>
          </Link>
        </UniversalCard>
      </div>
    </UniversalPageLayout>
  );
};

export default Index;

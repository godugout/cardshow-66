import React from 'react';
import { Link } from 'react-router-dom';
import { UniversalPageLayout, CRDCard, CRDButton } from '@/components/ui/design-system';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  TestTube2,
  Target,
  Layers,
  Palette,
  Wand2
} from 'lucide-react';

export const CreateTestingPage = () => {
  return (
    <UniversalPageLayout background="gradient">
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TestTube2 className="w-8 h-8 text-crd-green" />
              <h1 className="text-4xl font-bold text-white">A/B Test Creation Flows</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-4">
              Compare two different creation experiences with improved cropping
            </p>
            <Badge variant="outline" className="bg-background/50">
              Testing Phase
            </Badge>
          </div>

          {/* Ultra-Streamlined Flow */}
          <div className="mb-12">
            <CRDCard className="p-8 hover:border-crd-orange/50 transition-colors bg-gradient-to-r from-crd-orange/5 to-crd-green/5">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-r from-crd-orange to-crd-green rounded-full flex items-center justify-center mx-auto">
                  <Wand2 className="w-12 h-12 text-white" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Ultra-Streamlined Flow</h2>
                  <p className="text-muted-foreground mb-4">3 Swipes + 9 Taps = Perfect Card</p>
                  <Badge variant="outline" className="bg-gradient-to-r from-crd-orange to-crd-green text-white border-crd-orange">
                    AI-Powered • Zero Effort
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-crd-orange/20 rounded-full flex items-center justify-center">
                      <span className="text-crd-orange font-bold">1</span>
                    </div>
                    <span>Upload Image</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-crd-green/20 rounded-full flex items-center justify-center">
                      <span className="text-crd-green font-bold">2</span>
                    </div>
                    <span>AI Magic</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-crd-blue/20 rounded-full flex items-center justify-center">
                      <span className="text-crd-blue font-bold">3</span>
                    </div>
                    <span>Choose & Done</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-crd-orange" />
                    <span>Google AI creates 3 perfect card variations instantly</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-crd-green" />
                    <span>Auto-titles, descriptions, rarity & frame selection</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Target className="w-4 h-4 text-crd-blue" />
                    <span>Optimized for maximum collector appeal</span>
                  </div>
                </div>

                <Link to="/create/ultra" className="block">
                  <CRDButton variant="gradient" size="lg" className="w-full">
                    Experience AI Magic
                    <Wand2 className="w-4 h-4 ml-2" />
                  </CRDButton>
                </Link>
              </div>
            </CRDCard>
          </div>

          {/* Flow Comparison */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            {/* Version A */}
            <CRDCard className="p-8 hover:border-crd-green/50 transition-colors">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-crd-green/10 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-10 h-10 text-crd-green" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Version A</h2>
                  <p className="text-muted-foreground mb-4">Simple & Clean Experience</p>
                  <Badge variant="outline" className="bg-crd-green/10 border-crd-green text-crd-green">
                    Simplified
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-crd-green" />
                    <span>Simple slider-based cropping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-crd-green" />
                    <span>Quick 4-step process</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-crd-green rounded-full" />
                    <span>Beginner-friendly interface</span>
                  </div>
                </div>

                <Link to="/create/version-a" className="block">
                  <CRDButton variant="primary" size="lg" className="w-full">
                    Test Version A
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CRDButton>
                </Link>
              </div>
            </CRDCard>

            {/* Version B */}
            <CRDCard className="p-8 hover:border-crd-blue/50 transition-colors">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-crd-blue/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-crd-blue" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Version B</h2>
                  <p className="text-muted-foreground mb-4">Professional Studio Experience</p>
                  <Badge variant="outline" className="bg-crd-blue/10 border-crd-blue text-crd-blue">
                    Professional
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-crd-blue" />
                    <span>Multi-area cropping system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-crd-blue" />
                    <span>Advanced filters & enhancements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-crd-blue rounded-full" />
                    <span>Pro tools & detailed controls</span>
                  </div>
                </div>

                <Link to="/create/version-b" className="block">
                  <CRDButton variant="gradient" size="lg" className="w-full">
                    Test Version B
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CRDButton>
                </Link>
              </div>
            </CRDCard>
          </div>

          {/* Key Differences */}
          <CRDCard className="p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Key Testing Differences</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
                <h4 className="font-semibold text-white mb-2">Cropping Approach</h4>
                <p className="text-sm text-muted-foreground">
                  A: Position sliders vs B: Interactive multi-area canvas
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Palette className="w-6 h-6 text-purple-500" />
                </div>
                <h4 className="font-semibold text-white mb-2">Enhancement Tools</h4>
                <p className="text-sm text-muted-foreground">
                  A: Basic adjustments vs B: Professional filters & controls
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="font-semibold text-white mb-2">User Experience</h4>
                <p className="text-sm text-muted-foreground">
                  A: Quick & simple vs B: Comprehensive & feature-rich
                </p>
              </div>
            </div>
          </CRDCard>

          {/* Test Instructions */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Try both versions and compare the creation experience. Which one feels better for different user types?
            </p>
            <Link to="/cards">
              <CRDButton variant="outline">
                View Created Cards
              </CRDButton>
            </Link>
          </div>
        </div>
      </div>
    </UniversalPageLayout>
  );
};

export default CreateTestingPage;
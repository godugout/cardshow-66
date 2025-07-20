
import React, { useState } from 'react';
import { UniversalCard } from './atoms/UniversalCard';
import { UniversalButton } from './atoms/UniversalButton';
import { ComponentUsageExamples } from './ComponentSpecs';
import { InteractiveExamples } from './InteractiveExamples';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { designTokens } from './tokens';
import { colors } from './colors';
import { 
  Palette, 
  Layout, 
  Type, 
  Zap, 
  Grid, 
  Mouse,
  Eye,
  Code2,
  Smartphone,
  Monitor
} from 'lucide-react';

export const CRDDesignGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                CRD Design System
              </h1>
              <p className="text-muted-foreground">
                Complete design system based on the actual implemented interface
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Version 2.0 • Updated from screenshots
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-card border border-border">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Components
            </TabsTrigger>
            <TabsTrigger value="interactive" className="flex items-center gap-2">
              <Mouse className="w-4 h-4" />
              Interactive
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="responsive" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Responsive
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Code
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <UniversalCard className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Welcome to the CRD Design System
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  A comprehensive design system extracted from the actual Cardshow interface, 
                  providing consistent, accessible, and beautiful components for the digital trading card platform.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <UniversalCard variant="elevated" className="p-6 text-center">
                  <Palette className="w-12 h-12 text-[#4ade80] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cohesive Colors</h3>
                  <p className="text-muted-foreground text-sm">
                    Carefully crafted color palette extracted from the live interface
                  </p>
                </UniversalCard>

                <UniversalCard variant="elevated" className="p-6 text-center">
                  <Layout className="w-12 h-12 text-[#4A90FF] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Flexible Components</h3>
                  <p className="text-muted-foreground text-sm">
                    Reusable components that match the actual implementation
                  </p>
                </UniversalCard>

                <UniversalCard variant="elevated" className="p-6 text-center">
                  <Zap className="w-12 h-12 text-[#FF6B4A] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Performance First</h3>
                  <p className="text-muted-foreground text-sm">
                    Optimized for speed and accessibility across all devices
                  </p>
                </UniversalCard>
              </div>

              <div className="bg-gradient-to-r from-[#4ade80]/10 via-[#4A90FF]/10 to-[#FF6B4A]/10 rounded-lg p-6 border border-[#4ade80]/20">
                <h3 className="text-lg font-semibold text-foreground mb-3">Design Principles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-[#4ade80]">Consistency:</strong> All components follow the same patterns and behaviors
                  </div>
                  <div>
                    <strong className="text-[#4A90FF]">Accessibility:</strong> WCAG 2.1 AA compliant with proper contrast and focus states
                  </div>
                  <div>
                    <strong className="text-[#FF6B4A]">Performance:</strong> Lightweight and optimized for fast loading
                  </div>
                  <div>
                    <strong className="text-[#9757D7]">Scalability:</strong> Works across mobile, tablet, and desktop
                  </div>
                </div>
              </div>
            </UniversalCard>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <UniversalCard className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Color System</h2>
              <p className="text-muted-foreground mb-8">
                Our color palette is extracted directly from the implemented interface, ensuring perfect consistency.
              </p>

              {/* Brand Colors */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Brand Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(colors.brand).map(([name, color]) => (
                    <div key={name} className="text-center">
                      <div 
                        className="w-full aspect-square rounded-lg mb-3 border border-border flex items-center justify-center text-white font-medium shadow-lg"
                        style={{ backgroundColor: color }}
                      >
                        {color}
                      </div>
                      <div className="text-sm text-foreground font-medium capitalize">{name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interface Colors */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Interface Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(colors.interface).map(([name, color]) => (
                    <div key={name} className="text-center">
                      <div 
                        className="w-full aspect-square rounded-lg mb-3 border border-border flex items-center justify-center text-white font-medium text-xs"
                        style={{ backgroundColor: color }}
                      >
                        {color}
                      </div>
                      <div className="text-sm text-foreground font-medium">{name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Colors */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Status & Marketplace Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {Object.entries(colors.status).map(([name, color]) => (
                    <div key={name} className="text-center">
                      <div 
                        className="w-full aspect-square rounded-lg mb-3 border border-border flex items-center justify-center text-white font-medium text-xs"
                        style={{ backgroundColor: color }}
                      >
                        {color}
                      </div>
                      <div className="text-sm text-foreground font-medium capitalize">{name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </UniversalCard>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <UniversalCard className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Typography System</h2>
              
              <div className="space-y-8">
                {/* Font Scale */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Font Scale</h3>
                  <div className="space-y-4">
                    {Object.entries(designTokens.typography.fontSize).map(([name, size]) => (
                      <div key={name} className="flex items-center gap-4 p-3 bg-card/50 rounded-lg">
                        <div className="w-12 text-sm text-muted-foreground font-mono">{name}</div>
                        <div className="w-16 text-sm text-muted-foreground font-mono">{size}</div>
                        <div 
                          className="text-foreground"
                          style={{ fontSize: size }}
                        >
                          The quick brown fox jumps over the lazy dog
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Font Weights */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Font Weights</h3>
                  <div className="space-y-2">
                    {Object.entries(designTokens.typography.fontWeight).map(([name, weight]) => (
                      <div key={name} className="flex items-center gap-4 p-3 bg-card/50 rounded-lg">
                        <div className="w-20 text-sm text-muted-foreground font-mono">{name}</div>
                        <div className="w-12 text-sm text-muted-foreground font-mono">{weight}</div>
                        <div 
                          className="text-foreground text-lg"
                          style={{ fontWeight: weight }}
                        >
                          Sample Text
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </UniversalCard>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components">
            <ComponentUsageExamples />
          </TabsContent>

          {/* Interactive Tab */}
          <TabsContent value="interactive">
            <InteractiveExamples />
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-6">
            <UniversalCard className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Layout System</h2>
              
              <div className="space-y-8">
                {/* Spacing Scale */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Spacing Scale</h3>
                  <div className="space-y-2">
                    {Object.entries(designTokens.spacing).slice(0, 12).map(([name, size]) => (
                      <div key={name} className="flex items-center gap-4">
                        <div className="w-12 text-sm text-muted-foreground font-mono">{name}</div>
                        <div className="w-20 text-sm text-muted-foreground font-mono">{size}</div>
                        <div 
                          className="bg-[#4ade80] h-4"
                          style={{ width: size }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grid Systems */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Grid Systems</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Card Grids</h4>
                      <div className="space-y-4">
                        {Object.entries(designTokens.layout.grid.cards).map(([breakpoint, grid]) => (
                          <div key={breakpoint} className="p-4 bg-card/50 rounded-lg">
                            <div className="flex items-center gap-4 mb-3">
                              <span className="font-mono text-sm text-muted-foreground w-16">{breakpoint}:</span>
                              <span className="font-mono text-sm text-foreground">{grid}</span>
                            </div>
                            <div 
                              className="grid gap-2"
                              style={{ gridTemplateColumns: grid }}
                            >
                              {Array.from({ length: parseInt(grid.split('(')[1] || '4') }, (_, i) => (
                                <div key={i} className="aspect-[3/4] bg-[#4ade80]/20 rounded border border-[#4ade80]/30" />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </UniversalCard>
          </TabsContent>

          {/* Responsive Tab */}
          <TabsContent value="responsive" className="space-y-6">
            <UniversalCard className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Responsive Design</h2>
              
              <div className="space-y-8">
                {/* Breakpoints */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Breakpoints</h3>
                  <div className="space-y-3">
                    {Object.entries(designTokens.layout.container).map(([name, width]) => (
                      <div key={name} className="flex items-center gap-4 p-3 bg-card/50 rounded-lg">
                        <div className="w-8 text-sm text-muted-foreground font-mono">{name}</div>
                        <div className="w-20 text-sm text-muted-foreground font-mono">{width}</div>
                        <div className="flex-1">
                          <div 
                            className="h-4 bg-gradient-to-r from-[#4ade80] to-[#4A90FF] rounded"
                            style={{ width: `${Math.min(parseInt(width) / 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Examples */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Device Layouts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Smartphone className="w-8 h-8 text-[#4ade80] mx-auto mb-2" />
                      <h4 className="font-medium text-foreground mb-2">Mobile</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>2-column card grid</div>
                        <div>Stacked navigation</div>
                        <div>16px padding</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Monitor className="w-8 h-8 text-[#4A90FF] mx-auto mb-2" />
                      <h4 className="font-medium text-foreground mb-2">Tablet</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>3-column card grid</div>
                        <div>Horizontal navigation</div>
                        <div>20px padding</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Monitor className="w-8 h-8 text-[#FF6B4A] mx-auto mb-2" />
                      <h4 className="font-medium text-foreground mb-2">Desktop</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>4-5 column card grid</div>
                        <div>Full navigation</div>
                        <div>24px padding</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </UniversalCard>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-6">
            <UniversalCard className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Implementation Guide</h2>
              
              <div className="space-y-8">
                {/* CSS Variables */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">CSS Custom Properties</h3>
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-300">
{`:root {
  /* Brand Colors */
  --crd-orange: #FF6B4A;
  --crd-green: #4ade80;
  --crd-blue: #4A90FF;
  
  /* Interface */
  --background: #0a0a0b;
  --card: #131316;
  --border: #334155;
  --text-primary: #ffffff;
  --text-muted: #64748b;
}`}
                    </pre>
                  </div>
                </div>

                {/* Tailwind Classes */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Tailwind Utilities</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Common Patterns</h4>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <pre className="text-sm text-slate-300">
{`// Card hover effect
hover:transform hover:translateY(-4px) hover:scale-[1.03] 
transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)

// Button styles
bg-[#4ade80] text-black font-semibold rounded-lg px-4 py-2
hover:shadow-[0_8px_16px_rgba(74,222,128,0.3)]`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Component Usage */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Component Usage</h3>
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-300">
{`import { UniversalButton, UniversalCard } from '@/components/ui/design-system';

// Button variants
<UniversalButton variant="primary">Primary Action</UniversalButton>
<UniversalButton variant="secondary">Secondary</UniversalButton>
<UniversalButton variant="outline">Outline</UniversalButton>

// Card with hover effects
<UniversalCard variant="elevated" hover="lift">
  <div className="p-6">Content</div>
</UniversalCard>`}
                    </pre>
                  </div>
                </div>
              </div>
            </UniversalCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CRDDesignGuide;

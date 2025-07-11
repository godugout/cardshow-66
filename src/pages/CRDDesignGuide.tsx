import React, { useState } from 'react';
import { UniversalCard } from '@/components/ui/design-system/atoms/UniversalCard';
import { UniversalButton } from '@/components/ui/design-system/atoms/UniversalButton';
import { UniversalInput } from '@/components/ui/design-system/atoms/UniversalInput';
import { UniversalBadge } from '@/components/ui/design-system/atoms/UniversalBadge';
import { CRDButton } from '@/components/ui/design-system';
import { CRDCard, CRDCardHeader, CRDCardTitle, CRDCardContent } from '@/components/ui/design-system';
import { Typography, Heading } from '@/components/ui/design-system';
import { Copy, Check, Palette, Type, Layout, Zap } from 'lucide-react';

const ColorSwatch = ({ color, name, value }: { color: string; name: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/10 cursor-pointer transition-all"
      onClick={copyToClipboard}
    >
      <div 
        className="w-12 h-12 rounded-lg border border-border/50 flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground">{name}</div>
        <div className="text-sm text-muted-foreground font-mono">{value}</div>
      </div>
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  );
};

const CodeBlock = ({ children, title }: { children: string; title?: string }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {title && (
        <div className="text-sm font-medium text-muted-foreground mb-2">{title}</div>
      )}
      <div className="relative bg-card border border-border rounded-lg p-4 overflow-x-auto">
        <button
          onClick={copyCode}
          className="absolute top-2 right-2 p-2 rounded-md hover:bg-accent/20 transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <pre className="text-sm text-foreground font-mono leading-relaxed pr-10">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
};

const CRDDesignGuide = () => {
  const [activeTab, setActiveTab] = useState('colors');

  const brandColors = [
    { name: 'CRD Orange', value: 'hsl(12, 100%, 65%)', color: 'hsl(12, 100%, 65%)' },
    { name: 'CRD Green', value: 'hsl(156, 100%, 65%)', color: 'hsl(156, 100%, 65%)' },
    { name: 'CRD Blue', value: 'hsl(220, 100%, 65%)', color: 'hsl(220, 100%, 65%)' },
  ];

  const themeColors = [
    { name: 'Background', value: 'hsl(220, 5%, 10%)', color: 'hsl(220, 5%, 10%)' },
    { name: 'Foreground', value: 'hsl(0, 0%, 99%)', color: 'hsl(0, 0%, 99%)' },
    { name: 'Card', value: 'hsl(220, 6%, 13%)', color: 'hsl(220, 6%, 13%)' },
    { name: 'Border', value: 'hsl(220, 12%, 16%)', color: 'hsl(220, 12%, 16%)' },
    { name: 'Muted', value: 'hsl(220, 8%, 15%)', color: 'hsl(220, 8%, 15%)' },
    { name: 'Accent', value: 'hsl(156, 100%, 65%)', color: 'hsl(156, 100%, 65%)' },
  ];

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'components', label: 'Components', icon: Layout },
    { id: 'usage', label: 'Usage', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-crd-orange via-crd-green to-crd-blue flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Cardshow Design System</h1>
              <p className="text-muted-foreground text-lg">Complete visual design system and component library</p>
            </div>
          </div>
          
          {/* Gradient Banner */}
          <div className="w-full h-2 rounded-full crd-gradient"></div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'colors' && (
              <div className="space-y-8">
                <div>
                  <Heading level={2}>Color System</Heading>
                  <Typography variant="body" className="text-muted-foreground mb-6">
                    The Cardshow design system uses a carefully crafted dark theme with vibrant accent colors.
                  </Typography>
                </div>

                {/* Brand Colors */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Brand Colors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {brandColors.map((color) => (
                        <ColorSwatch key={color.name} {...color} />
                      ))}
                    </div>
                  </div>
                </UniversalCard>

                {/* Theme Colors */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Theme Colors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {themeColors.map((color) => (
                        <ColorSwatch key={color.name} {...color} />
                      ))}
                    </div>
                  </div>
                </UniversalCard>

                {/* Gradient Usage */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Gradients</h3>
                    <div className="space-y-4">
                      <div className="h-16 rounded-lg crd-gradient flex items-center justify-center">
                        <span className="text-white font-semibold">CRD Gradient</span>
                      </div>
                      <CodeBlock title="CSS Class">
                        {`.crd-gradient {
  background: linear-gradient(135deg, hsl(var(--crd-orange)) 0%, hsl(var(--crd-green)) 50%, hsl(var(--crd-blue)) 100%);
}`}
                      </CodeBlock>
                    </div>
                  </div>
                </UniversalCard>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-8">
                <div>
                  <Heading level={2}>Typography</Heading>
                  <Typography variant="body" className="text-muted-foreground mb-6">
                    Typography scale and usage guidelines for consistent text hierarchy.
                  </Typography>
                </div>

                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Typography Scale</h3>
                    <div className="space-y-6">
                      <div>
                        <Heading level={1}>Heading 1 - Main Page Title</Heading>
                        <code className="text-sm text-muted-foreground">text-4xl font-bold</code>
                      </div>
                      <div>
                        <Heading level={2}>Heading 2 - Section Title</Heading>
                        <code className="text-sm text-muted-foreground">text-3xl font-bold</code>
                      </div>
                      <div>
                        <Heading level={3}>Heading 3 - Subsection</Heading>
                        <code className="text-sm text-muted-foreground">text-2xl font-bold</code>
                      </div>
                      <div>
                        <Typography variant="body">Body text - Regular paragraph content with proper line height for readability.</Typography>
                        <code className="text-sm text-muted-foreground">text-base</code>
                      </div>
                      <div>
                        <Typography variant="caption">Caption text - Smaller secondary information</Typography>
                        <code className="text-sm text-muted-foreground">text-sm text-muted-foreground</code>
                      </div>
                    </div>
                  </div>
                </UniversalCard>
              </div>
            )}

            {activeTab === 'components' && (
              <div className="space-y-8">
                <div>
                  <Heading level={2}>Components</Heading>
                  <Typography variant="body" className="text-muted-foreground mb-6">
                    Core UI components with consistent styling and behavior.
                  </Typography>
                </div>

                {/* Buttons */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Buttons</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Universal Buttons</h4>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <UniversalButton variant="primary">Primary</UniversalButton>
                          <UniversalButton variant="secondary">Secondary</UniversalButton>
                          <UniversalButton variant="outline">Outline</UniversalButton>
                          <UniversalButton variant="ghost">Ghost</UniversalButton>
                          <UniversalButton variant="destructive">Destructive</UniversalButton>
                        </div>
                        <CodeBlock>
{`<UniversalButton variant="primary">Primary</UniversalButton>
<UniversalButton variant="secondary">Secondary</UniversalButton>
<UniversalButton variant="outline">Outline</UniversalButton>`}
                        </CodeBlock>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">CRD Buttons</h4>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <CRDButton variant="primary">Primary</CRDButton>
                          <CRDButton variant="secondary">Secondary</CRDButton>
                          <CRDButton variant="outline">Outline</CRDButton>
                          <CRDButton variant="gradient">Gradient</CRDButton>
                        </div>
                        <CodeBlock>
{`<CRDButton variant="primary">Primary</CRDButton>
<CRDButton variant="gradient">Gradient</CRDButton>`}
                        </CodeBlock>
                      </div>
                    </div>
                  </div>
                </UniversalCard>

                {/* Cards */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Cards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <UniversalCard variant="default" padding="default">
                        <h4 className="font-medium mb-2">Default Card</h4>
                        <p className="text-muted-foreground text-sm">Standard card with default styling and padding.</p>
                      </UniversalCard>
                      
                      <UniversalCard variant="elevated" padding="default" hover="lift">
                        <h4 className="font-medium mb-2">Elevated Card</h4>
                        <p className="text-muted-foreground text-sm">Enhanced shadow with hover lift effect.</p>
                      </UniversalCard>

                      <UniversalCard variant="accent" padding="default" hover="glow">
                        <h4 className="font-medium mb-2">Accent Card</h4>
                        <p className="text-muted-foreground text-sm">Accent border with glow hover effect.</p>
                      </UniversalCard>

                      <CRDCard variant="glow" padding="md">
                        <CRDCardHeader>
                          <CRDCardTitle>CRD Card</CRDCardTitle>
                        </CRDCardHeader>
                        <CRDCardContent>
                          <p className="text-muted-foreground text-sm">Enhanced CRD card with glow effect.</p>
                        </CRDCardContent>
                      </CRDCard>
                    </div>
                    <CodeBlock>
{`<UniversalCard variant="elevated" hover="lift">
  <h4>Card Title</h4>
  <p>Card content...</p>
</UniversalCard>`}
                    </CodeBlock>
                  </div>
                </UniversalCard>

                {/* Form Elements */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Form Elements</h3>
                    <div className="space-y-4 mb-6">
                      <UniversalInput placeholder="Default input" />
                      <UniversalInput variant="ghost" placeholder="Ghost input" />
                      <UniversalInput error placeholder="Error state input" />
                      <div className="flex gap-2">
                        <UniversalBadge variant="default">Default</UniversalBadge>
                        <UniversalBadge variant="secondary">Secondary</UniversalBadge>
                        <UniversalBadge variant="success">Success</UniversalBadge>
                        <UniversalBadge variant="warning">Warning</UniversalBadge>
                        <UniversalBadge variant="error">Error</UniversalBadge>
                      </div>
                    </div>
                    <CodeBlock>
{`<UniversalInput placeholder="Enter text" />
<UniversalBadge variant="success">Success</UniversalBadge>`}
                    </CodeBlock>
                  </div>
                </UniversalCard>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-8">
                <div>
                  <Heading level={2}>Usage Guidelines</Heading>
                  <Typography variant="body" className="text-muted-foreground mb-6">
                    Best practices and implementation guidelines for the Cardshow design system.
                  </Typography>
                </div>

                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Installation</h3>
                    <CodeBlock>
{`// Import design system components
import { 
  UniversalButton, 
  UniversalCard, 
  CRDButton,
  CRDCard 
} from '@/components/ui/design-system';`}
                    </CodeBlock>
                  </div>
                </UniversalCard>

                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Color Usage</h3>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Always use semantic color tokens instead of hardcoded values:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-green-400 font-medium mb-2">✓ Good</h4>
                          <CodeBlock>
{`className="bg-background text-foreground"
className="border-border"
className="text-muted-foreground"`}
                          </CodeBlock>
                        </div>
                        <div>
                          <h4 className="text-red-400 font-medium mb-2">✗ Avoid</h4>
                          <CodeBlock>
{`className="bg-slate-900 text-white"
className="border-gray-700"
style={{ color: '#777E90' }}`}
                          </CodeBlock>
                        </div>
                      </div>
                    </div>
                  </div>
                </UniversalCard>

                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Component Guidelines</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Button Hierarchy</h4>
                        <ul className="text-muted-foreground space-y-1 text-sm">
                          <li>• Use <code>primary</code> for main actions (max 1 per section)</li>
                          <li>• Use <code>secondary</code> for secondary actions</li>
                          <li>• Use <code>outline</code> for tertiary actions</li>
                          <li>• Use <code>ghost</code> for subtle actions</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Card Usage</h4>
                        <ul className="text-muted-foreground space-y-1 text-sm">
                          <li>• Use <code>default</code> for standard content containers</li>
                          <li>• Use <code>elevated</code> for highlighted content</li>
                          <li>• Use <code>accent</code> for special features or promotions</li>
                          <li>• Add <code>hover</code> effects for interactive cards</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </UniversalCard>

                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Responsive Design</h3>
                    <p className="text-muted-foreground mb-4">All components are mobile-first and responsive:</p>
                    <CodeBlock>
{`// Responsive grid example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <UniversalCard>Card 1</UniversalCard>
  <UniversalCard>Card 2</UniversalCard>
  <UniversalCard>Card 3</UniversalCard>
</div>`}
                    </CodeBlock>
                  </div>
                </UniversalCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRDDesignGuide;
import React, { useState, useEffect } from 'react';
import { UniversalCard } from '@/components/ui/design-system/atoms/UniversalCard';
import { UniversalButton } from '@/components/ui/design-system/atoms/UniversalButton';
import { UniversalInput } from '@/components/ui/design-system/atoms/UniversalInput';
import { UniversalBadge } from '@/components/ui/design-system/atoms/UniversalBadge';
import { CRDButton } from '@/components/ui/design-system';
import { CRDCard, CRDCardHeader, CRDCardTitle, CRDCardContent } from '@/components/ui/design-system';
import { Typography, Heading } from '@/components/ui/design-system';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Copy, Check, Palette, Type, Layout, Zap, Settings, Play, Pause, 
  Star, Heart, Share, Download, Upload, Search, Filter, ArrowUpDown, 
  ChevronDown, ChevronRight, Grid, List, CreditCard, Eye, EyeOff,
  Sun, Moon, Monitor, Loader, AlertCircle, CheckCircle, XCircle,
  Info, Sparkles, Layers, Box, Component, Paintbrush, Rocket,
  MousePointer, Keyboard, Smartphone, Tablet, Computer, Globe
} from 'lucide-react';

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

// Interactive Demo Components
const InteractiveButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsLiked(!isLiked);
    }, 1000);
  };

  return (
    <UniversalButton 
      variant="primary" 
      loading={isLoading}
      icon={isLiked ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
      onClick={handleClick}
    >
      {isLiked ? 'Liked' : 'Like'}
    </UniversalButton>
  );
};

const DropdownDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Option 1');
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-44 justify-between bg-card border-border text-foreground hover:bg-accent/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected}
        <ChevronDown className="w-4 h-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          {['Option 1', 'Option 2', 'Option 3'].map((option) => (
            <button
              key={option}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent/20 transition-colors"
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProgressDemo = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 10;
      });
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

const InteractiveCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  return (
    <UniversalCard 
      variant="elevated" 
      hover="lift"
      className="cursor-pointer transition-all duration-300"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">Interactive Card</h4>
            <p className="text-sm text-muted-foreground">Click to expand</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className="p-1 rounded-md hover:bg-accent/20 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </button>
        </div>
        
        <div 
          className="space-y-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <UniversalBadge variant="success">Active</UniversalBadge>
            <UniversalBadge variant="outline">Premium</UniversalBadge>
          </div>
          
          {isExpanded && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <Separator />
              <p className="text-sm text-muted-foreground">
                This is additional content that appears when the card is expanded. 
                It demonstrates smooth animations and state management.
              </p>
              <div className="flex space-x-2">
                <UniversalButton size="sm" variant="outline">Edit</UniversalButton>
                <UniversalButton size="sm" variant="ghost">Share</UniversalButton>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last updated: 2 hours ago</span>
            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </div>
    </UniversalCard>
  );
};

const CRDDesignGuide = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const brandColors = [
    { name: 'CRD Orange', value: 'hsl(12, 100%, 65%)', color: 'hsl(12, 100%, 65%)', description: 'Primary brand color for CTAs and highlights' },
    { name: 'CRD Green', value: 'hsl(156, 100%, 65%)', color: 'hsl(156, 100%, 65%)', description: 'Success states and positive actions' },
    { name: 'CRD Blue', value: 'hsl(220, 100%, 65%)', color: 'hsl(220, 100%, 65%)', description: 'Links, info states, and secondary CTAs' },
  ];

  const extendedColors = [
    { name: 'Background', value: 'hsl(220, 5%, 10%)', color: 'hsl(220, 5%, 10%)', description: 'Main app background' },
    { name: 'Foreground', value: 'hsl(0, 0%, 99%)', color: 'hsl(0, 0%, 99%)', description: 'Primary text color' },
    { name: 'Card', value: 'hsl(220, 6%, 13%)', color: 'hsl(220, 6%, 13%)', description: 'Card and panel backgrounds' },
    { name: 'Border', value: 'hsl(220, 12%, 16%)', color: 'hsl(220, 12%, 16%)', description: 'Subtle borders and dividers' },
    { name: 'Muted', value: 'hsl(220, 8%, 15%)', color: 'hsl(220, 8%, 15%)', description: 'Muted backgrounds' },
    { name: 'Muted Foreground', value: 'hsl(220, 5%, 65%)', color: 'hsl(220, 5%, 65%)', description: 'Secondary text' },
    { name: 'Accent', value: 'hsl(156, 100%, 65%)', color: 'hsl(156, 100%, 65%)', description: 'Accent highlights' },
    { name: 'Destructive', value: 'hsl(0, 84%, 60%)', color: 'hsl(0, 84%, 60%)', description: 'Error and danger states' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'colors', label: 'Colors & Themes', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'components', label: 'Components', icon: Component },
    { id: 'patterns', label: 'Patterns', icon: Layout },
    { id: 'interactions', label: 'Interactions', icon: MousePointer },
    { id: 'responsive', label: 'Responsive', icon: Smartphone },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'tokens', label: 'Design Tokens', icon: Settings },
    { id: 'examples', label: 'Real Examples', icon: Rocket },
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
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <Heading level={2}>Cardshow Design System Overview</Heading>
                  <Typography variant="body" className="text-muted-foreground mb-6">
                    A comprehensive design system built for the future of digital collectibles and interactive experiences.
                  </Typography>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <UniversalCard variant="accent" hover="glow" className="text-center">
                    <div className="p-6">
                      <div className="text-3xl font-bold text-accent mb-2">50+</div>
                      <div className="text-sm text-muted-foreground">Components</div>
                    </div>
                  </UniversalCard>
                  <UniversalCard variant="accent" hover="glow" className="text-center">
                    <div className="p-6">
                      <div className="text-3xl font-bold text-accent mb-2">12</div>
                      <div className="text-sm text-muted-foreground">Color Tokens</div>
                    </div>
                  </UniversalCard>
                  <UniversalCard variant="accent" hover="glow" className="text-center">
                    <div className="p-6">
                      <div className="text-3xl font-bold text-accent mb-2">5</div>
                      <div className="text-sm text-muted-foreground">Typography Scales</div>
                    </div>
                  </UniversalCard>
                  <UniversalCard variant="accent" hover="glow" className="text-center">
                    <div className="p-6">
                      <div className="text-3xl font-bold text-accent mb-2">100%</div>
                      <div className="text-sm text-muted-foreground">Responsive</div>
                    </div>
                  </UniversalCard>
                </div>

                {/* Key Features */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Sparkles className="w-5 h-5 text-accent" />
                          <span className="font-medium">Interactive Components</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">
                          Rich, interactive components with smooth animations and state management.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Palette className="w-5 h-5 text-accent" />
                          <span className="font-medium">Dark-First Design</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">
                          Beautiful dark theme optimized for the gaming and collectibles community.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Component className="w-5 h-5 text-accent" />
                          <span className="font-medium">Modular Architecture</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">
                          Composable components that work together seamlessly.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Rocket className="w-5 h-5 text-accent" />
                          <span className="font-medium">Performance Optimized</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">
                          Built for speed with lazy loading and efficient rendering.
                        </p>
                      </div>
                    </div>
                  </div>
                </UniversalCard>

                {/* Interactive Demo */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Interactive Demo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium">Interactive Button</h4>
                        <InteractiveButton />
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium">Dropdown Menu</h4>
                        <DropdownDemo />
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium">Progress Animation</h4>
                        <ProgressDemo />
                      </div>
                    </div>
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Interactive Card</h4>
                      <InteractiveCard />
                    </div>
                  </div>
                </UniversalCard>
              </div>
            )}

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
                      {extendedColors.map((color) => (
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

            {activeTab === 'patterns' && (
              <div className="space-y-8">
                <div>
                  <Heading level={2}>UI Patterns & Layouts</Heading>
                  <Typography variant="body" className="text-muted-foreground mb-6">
                    Common layout patterns and UI compositions for building Cardshow features.
                  </Typography>
                </div>

                {/* Card Grid Pattern */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Card Grid Layout</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <UniversalCard key={i} variant="elevated" hover="lift" className="aspect-[3/4]">
                          <div className="p-4 h-full flex flex-col">
                            <div className="bg-muted rounded-lg flex-1 mb-3 flex items-center justify-center">
                              <CreditCard className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Card {i}</h4>
                              <div className="flex justify-between items-center">
                                <UniversalBadge size="sm" variant="outline">Rare</UniversalBadge>
                                <span className="text-sm font-medium text-accent">$25</span>
                              </div>
                            </div>
                          </div>
                        </UniversalCard>
                      ))}
                    </div>
                    <CodeBlock>
{`<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {cards.map((card) => (
    <UniversalCard key={card.id} variant="elevated" hover="lift">
      <CardContent card={card} />
    </UniversalCard>
  ))}
</div>`}
                    </CodeBlock>
                  </div>
                </UniversalCard>

                {/* Dashboard Layout */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Dashboard Layout</h3>
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <h4 className="font-semibold">Creator Dashboard</h4>
                          <p className="text-sm text-muted-foreground">Manage your cards and analytics</p>
                        </div>
                        <UniversalButton variant="primary" icon={<Upload className="w-4 h-4" />}>
                          Upload Card
                        </UniversalButton>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Total Cards', value: '24', icon: CreditCard },
                          { label: 'Total Views', value: '1.2K', icon: Eye },
                          { label: 'Revenue', value: '$486', icon: Star },
                          { label: 'Followers', value: '128', icon: Heart },
                        ].map((stat) => (
                          <div key={stat.label} className="p-4 bg-card border border-border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <stat.icon className="w-5 h-5 text-accent" />
                              <div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </UniversalCard>

                {/* Navigation Pattern */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Navigation Patterns</h3>
                    <div className="space-y-4">
                      {/* Tab Navigation */}
                      <div className="border border-border rounded-lg p-4">
                        <h4 className="font-medium mb-3">Tab Navigation</h4>
                        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                          {['Overview', 'Analytics', 'Settings'].map((tab, i) => (
                            <button
                              key={tab}
                              className={`px-3 py-2 text-sm rounded-md transition-all ${
                                i === 0 ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Breadcrumb */}
                      <div className="border border-border rounded-lg p-4">
                        <h4 className="font-medium mb-3">Breadcrumb Navigation</h4>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-accent">Home</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <span className="text-accent">Collections</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">My Cards</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </UniversalCard>
              </div>
            )}

            {activeTab === 'interactions' && (
              <div className="space-y-8">
                <div>
                  <Heading level={2}>Interactions & Animations</Heading>
                  <Typography variant="body" className="text-muted-foreground mb-6">
                    Interactive patterns, animations, and micro-interactions that enhance user experience.
                  </Typography>
                </div>

                {/* Loading States */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Loading States</h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="font-medium">Button Loading States</h4>
                        <div className="flex flex-wrap gap-3">
                          <UniversalButton variant="primary" loading>Loading...</UniversalButton>
                          <UniversalButton variant="secondary" loading>Processing</UniversalButton>
                          <UniversalButton variant="outline" loading>Saving</UniversalButton>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Progress Indicators</h4>
                        <div className="space-y-4">
                          <ProgressDemo />
                          <div className="flex items-center space-x-3">
                            <Loader className="w-5 h-5 animate-spin text-accent" />
                            <span className="text-sm">Processing your request...</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Skeleton Loading</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-muted animate-pulse rounded-lg" />
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </UniversalCard>

                {/* Status & Feedback */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Status & Feedback</h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="font-medium">Status Badges</h4>
                        <div className="flex flex-wrap gap-2">
                          <UniversalBadge variant="success" icon={<CheckCircle className="w-3 h-3" />}>Success</UniversalBadge>
                          <UniversalBadge variant="warning" icon={<AlertCircle className="w-3 h-3" />}>Warning</UniversalBadge>
                          <UniversalBadge variant="error" icon={<XCircle className="w-3 h-3" />}>Error</UniversalBadge>
                          <UniversalBadge variant="info" icon={<Info className="w-3 h-3" />}>Info</UniversalBadge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Alert Messages</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm">Card uploaded successfully!</span>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm">Image quality could be improved</span>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm">Upload failed. Please try again.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </UniversalCard>

                {/* Hover Effects */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Hover & Focus Effects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <UniversalCard variant="default" hover="lift" className="text-center p-4 cursor-pointer">
                        <div className="text-accent mb-2">Lift Effect</div>
                        <div className="text-sm text-muted-foreground">Hover to lift</div>
                      </UniversalCard>
                      <UniversalCard variant="default" hover="glow" className="text-center p-4 cursor-pointer">
                        <div className="text-accent mb-2">Glow Effect</div>
                        <div className="text-sm text-muted-foreground">Hover to glow</div>
                      </UniversalCard>
                      <UniversalCard variant="default" hover="scale" className="text-center p-4 cursor-pointer">
                        <div className="text-accent mb-2">Scale Effect</div>
                        <div className="text-sm text-muted-foreground">Hover to scale</div>
                      </UniversalCard>
                    </div>
                  </div>
                </UniversalCard>
              </div>
            )}

            {activeTab === 'responsive' && (
              <div className="space-y-8">
                <div>
                  <Heading level={2}>Responsive Design</Heading>
                  <Typography variant="body" className="text-muted-foreground mb-6">
                    Mobile-first responsive design patterns and breakpoint guidelines.
                  </Typography>
                </div>

                {/* Breakpoints */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Breakpoints</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Mobile', range: '320px - 639px', icon: Smartphone, description: 'Single column layouts, full-width cards' },
                        { name: 'Tablet', range: '640px - 1023px', icon: Tablet, description: '2-3 column grids, condensed navigation' },
                        { name: 'Desktop', range: '1024px+', icon: Computer, description: '4+ column grids, full feature set' },
                      ].map((bp) => (
                        <div key={bp.name} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                          <bp.icon className="w-8 h-8 text-accent" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <span className="font-medium">{bp.name}</span>
                              <code className="text-sm bg-muted px-2 py-1 rounded">{bp.range}</code>
                            </div>
                            <p className="text-sm text-muted-foreground">{bp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </UniversalCard>

                {/* Responsive Patterns */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Responsive Grid Examples</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Card Grid (1 → 2 → 4 columns)</h4>
                        <CodeBlock>
{`<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {cards.map((card) => (
    <Card key={card.id} />
  ))}
</div>`}
                        </CodeBlock>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Dashboard Layout (Stack → Side-by-side)</h4>
                        <CodeBlock>
{`<div className="flex flex-col lg:flex-row gap-6">
  <div className="flex-1">
    <MainContent />
  </div>
  <div className="lg:w-80">
    <Sidebar />
  </div>
</div>`}
                        </CodeBlock>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Stats Grid (2 → 4 columns)</h4>
                        <CodeBlock>
{`<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map((stat) => (
    <StatCard key={stat.name} {...stat} />
  ))}
</div>`}
                        </CodeBlock>
                      </div>
                    </div>
                  </div>
                </UniversalCard>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-8">
                <div>
                  <Heading level={2}>Accessibility Guidelines</Heading>
                  <Typography variant="body" className="text-muted-foreground mb-6">
                    WCAG 2.1 AA compliance guidelines and inclusive design principles.
                  </Typography>
                </div>

                {/* Color Contrast */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Color Contrast</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="text-green-400 font-medium">✓ Accessible Combinations</h4>
                          <div className="space-y-2">
                            <div className="p-3 bg-background text-foreground border border-border rounded">
                              <span>White text on dark background</span>
                              <div className="text-xs text-muted-foreground mt-1">Contrast ratio: 15.8:1</div>
                            </div>
                            <div className="p-3 bg-accent text-black rounded">
                              <span>Black text on accent background</span>
                              <div className="text-xs opacity-70 mt-1">Contrast ratio: 12.6:1</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-red-400 font-medium">✗ Poor Contrast</h4>
                          <div className="space-y-2">
                            <div className="p-3 bg-muted text-muted-foreground border border-border rounded opacity-50">
                              <span>Low contrast text</span>
                              <div className="text-xs mt-1">Contrast ratio: 2.1:1</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </UniversalCard>

                {/* Focus Management */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Focus Management</h3>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Keyboard Navigation</h4>
                        <div className="space-y-2">
                          <UniversalButton variant="primary" className="focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">
                            Focusable Button
                          </UniversalButton>
                          <p className="text-sm text-muted-foreground">Try tabbing to this button to see the focus ring</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Skip Links</h4>
                        <CodeBlock>
{`<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent text-black px-4 py-2 rounded">
  Skip to main content
</a>`}
                        </CodeBlock>
                      </div>
                    </div>
                  </div>
                </UniversalCard>

                {/* ARIA Labels */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">ARIA Labels & Semantics</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Button Examples</h4>
                        <div className="space-y-2">
                          <UniversalButton 
                            variant="outline" 
                            icon={<Heart className="w-4 h-4" />}
                            aria-label="Add to favorites"
                          >
                            <span className="sr-only">Add to favorites</span>
                          </UniversalButton>
                          <p className="text-sm text-muted-foreground">Icon-only button with proper aria-label</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Form Labels</h4>
                        <div className="space-y-2">
                          <label htmlFor="card-title" className="text-sm font-medium">Card Title</label>
                          <UniversalInput 
                            id="card-title"
                            placeholder="Enter card title"
                            aria-describedby="title-help"
                          />
                          <p id="title-help" className="text-xs text-muted-foreground">
                            Choose a descriptive title for your card
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </UniversalCard>
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className="space-y-8">
                <div>
                  <Heading level={2}>Design Tokens</Heading>
                  <Typography variant="body" className="text-muted-foreground mb-6">
                    Standardized design values for consistent theming and customization.
                  </Typography>
                </div>

                {/* CSS Variables */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">CSS Custom Properties</h3>
                    <CodeBlock title="CSS Variables">
{`:root {
  /* Brand Colors */
  --crd-orange: 12 100% 65%;
  --crd-green: 156 100% 65%;
  --crd-blue: 220 100% 65%;
  
  /* Theme Colors */
  --background: 220 5% 10%;
  --foreground: 0 0% 99%;
  --card: 220 6% 13%;
  --border: 220 12% 16%;
  --muted: 220 8% 15%;
  --muted-foreground: 220 5% 65%;
  --accent: 156 100% 65%;
  --primary: 12 100% 65%;
  --secondary: 220 12% 16%;
  --destructive: 0 84% 60%;
  
  /* Spacing */
  --radius: 0.5rem;
}`}
                    </CodeBlock>
                  </div>
                </UniversalCard>

                {/* Spacing Scale */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Spacing Scale</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'xs', value: '4px', class: 'p-1' },
                        { name: 'sm', value: '8px', class: 'p-2' },
                        { name: 'md', value: '16px', class: 'p-4' },
                        { name: 'lg', value: '24px', class: 'p-6' },
                        { name: 'xl', value: '32px', class: 'p-8' },
                        { name: '2xl', value: '48px', class: 'p-12' },
                      ].map((space) => (
                        <div key={space.name} className="flex items-center space-x-4">
                          <div className="w-16 text-sm font-mono">{space.name}</div>
                          <div className="w-16 text-sm font-mono text-muted-foreground">{space.value}</div>
                          <div className="flex-1">
                            <div className="bg-accent/20 border border-accent/30 inline-block">
                              <div className={`bg-accent ${space.class}`}></div>
                            </div>
                          </div>
                          <code className="text-sm bg-muted px-2 py-1 rounded">{space.class}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </UniversalCard>

                {/* Typography Tokens */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Typography Tokens</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'text-xs', size: '12px', weight: '400' },
                        { name: 'text-sm', size: '14px', weight: '400' },
                        { name: 'text-base', size: '16px', weight: '400' },
                        { name: 'text-lg', size: '18px', weight: '500' },
                        { name: 'text-xl', size: '20px', weight: '600' },
                        { name: 'text-2xl', size: '24px', weight: '700' },
                        { name: 'text-3xl', size: '30px', weight: '800' },
                        { name: 'text-4xl', size: '36px', weight: '900' },
                      ].map((type) => (
                        <div key={type.name} className="flex items-center space-x-4">
                          <div className="w-20 text-sm font-mono">{type.name}</div>
                          <div className="w-16 text-sm font-mono text-muted-foreground">{type.size}</div>
                          <div className="w-16 text-sm font-mono text-muted-foreground">{type.weight}</div>
                          <div className={`flex-1 ${type.name}`} style={{ fontWeight: type.weight }}>
                            The quick brown fox jumps
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </UniversalCard>
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="space-y-8">
                <div>
                  <Heading level={2}>Real-World Examples</Heading>
                  <Typography variant="body" className="text-muted-foreground mb-6">
                    Complete interface examples showing how all components work together.
                  </Typography>
                </div>

                {/* Card Marketplace Example */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Card Marketplace Interface</h3>
                    <div className="space-y-6">
                      {/* Search & Filters */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <UniversalInput 
                            placeholder="Search cards..." 
                            icon={<Search className="w-4 h-4" />}
                          />
                        </div>
                        <div className="flex gap-2">
                          <DropdownDemo />
                          <UniversalButton variant="outline" icon={<Filter className="w-4 h-4" />}>
                            Filters
                          </UniversalButton>
                          <UniversalButton variant="ghost" icon={viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}>
                            {viewMode === 'grid' ? 'List' : 'Grid'}
                          </UniversalButton>
                        </div>
                      </div>

                      {/* Card Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { title: 'Lightning Bolt', price: '$45', rarity: 'Rare', likes: 23 },
                          { title: 'Dragon Fire', price: '$120', rarity: 'Epic', likes: 67 },
                          { title: 'Crystal Shard', price: '$32', rarity: 'Common', likes: 12 },
                          { title: 'Phoenix Wing', price: '$89', rarity: 'Legendary', likes: 145 },
                        ].map((card, i) => (
                          <UniversalCard key={i} variant="elevated" hover="lift" className="cursor-pointer">
                            <div className="aspect-[3/4] bg-muted rounded-t-lg flex items-center justify-center relative">
                              <CreditCard className="w-12 h-12 text-muted-foreground" />
                              <div className="absolute top-2 right-2">
                                <UniversalBadge variant={card.rarity === 'Legendary' ? 'warning' : card.rarity === 'Epic' ? 'info' : card.rarity === 'Rare' ? 'success' : 'secondary'} size="sm">
                                  {card.rarity}
                                </UniversalBadge>
                              </div>
                            </div>
                            <div className="p-4 space-y-3">
                              <div>
                                <h4 className="font-medium">{card.title}</h4>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="font-bold text-accent">{card.price}</span>
                                  <div className="flex items-center space-x-1 text-muted-foreground">
                                    <Heart className="w-3 h-3" />
                                    <span className="text-xs">{card.likes}</span>
                                  </div>
                                </div>
                              </div>
                              <UniversalButton variant="primary" size="sm" className="w-full">
                                Buy Now
                              </UniversalButton>
                            </div>
                          </UniversalCard>
                        ))}
                      </div>
                    </div>
                  </div>
                </UniversalCard>

                {/* Creator Dashboard Example */}
                <UniversalCard>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Creator Dashboard</h3>
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-2xl font-bold">Welcome back, Creator!</h4>
                          <p className="text-muted-foreground">Here's what's happening with your cards</p>
                        </div>
                        <UniversalButton variant="primary" icon={<Upload className="w-4 h-4" />}>
                          Upload New Card
                        </UniversalButton>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Total Revenue', value: '$2,456', change: '+12%', icon: Star },
                          { label: 'Cards Sold', value: '148', change: '+8%', icon: CreditCard },
                          { label: 'Total Views', value: '12.4K', change: '+23%', icon: Eye },
                          { label: 'New Followers', value: '+64', change: '+15%', icon: Heart },
                        ].map((stat, i) => (
                          <UniversalCard key={i} variant="default" className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-accent/20 rounded-lg">
                                <stat.icon className="w-5 h-5 text-accent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xl font-bold">{stat.value}</span>
                                  <span className="text-xs text-green-500">{stat.change}</span>
                                </div>
                              </div>
                            </div>
                          </UniversalCard>
                        ))}
                      </div>

                      {/* Recent Activity */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <UniversalCard variant="default">
                          <div className="p-4">
                            <h4 className="font-semibold mb-4">Recent Sales</h4>
                            <div className="space-y-3">
                              {[
                                { card: 'Lightning Bolt', buyer: 'user123', amount: '$45', time: '2 hours ago' },
                                { card: 'Dragon Fire', buyer: 'collector_pro', amount: '$120', time: '5 hours ago' },
                                { card: 'Crystal Shard', buyer: 'newbie_trader', amount: '$32', time: '1 day ago' },
                              ].map((sale, i) => (
                                <div key={i} className="flex items-center justify-between py-2">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{sale.card}</div>
                                    <div className="text-xs text-muted-foreground">to {sale.buyer}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium text-accent text-sm">{sale.amount}</div>
                                    <div className="text-xs text-muted-foreground">{sale.time}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </UniversalCard>

                        <UniversalCard variant="default">
                          <div className="p-4">
                            <h4 className="font-semibold mb-4">Top Performing Cards</h4>
                            <div className="space-y-3">
                              {[
                                { card: 'Phoenix Wing', views: '2.4K', likes: 145, revenue: '$890' },
                                { card: 'Thunder Strike', views: '1.8K', likes: 98, revenue: '$650' },
                                { card: 'Ice Crystal', views: '1.2K', likes: 76, revenue: '$420' },
                              ].map((card, i) => (
                                <div key={i} className="flex items-center space-x-3 py-2">
                                  <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold">{i + 1}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{card.card}</div>
                                    <div className="text-xs text-muted-foreground">{card.views} views • {card.likes} likes</div>
                                  </div>
                                  <div className="text-sm font-medium text-accent">{card.revenue}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </UniversalCard>
                      </div>
                    </div>
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
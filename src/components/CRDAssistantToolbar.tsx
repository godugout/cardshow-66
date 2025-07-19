import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Copy, Check, Code, Palette, Megaphone, Briefcase, Settings, X, Minimize2, Maximize2 } from 'lucide-react';

const CRDAssistantToolbar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeMode, setActiveMode] = useState('dev');
  const [copiedId, setCopiedId] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [projectContext, setProjectContext] = useState({
    name: 'Cardshow',
    stack: 'React 18, Next.js, Tailwind CSS, TypeScript, Three.js, Supabase',
    designRules: 'CRD Black (#1a1a1a), Green (#00C851), Orange (#FF6D00), Blue (#2D9CDB), DM Sans font',
    currentFocus: '',
    avoidFiles: '',
  });
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);

  // Load saved context on mount
  useEffect(() => {
    const saved = localStorage.getItem('crd-assistant-context');
    if (saved) {
      setProjectContext(JSON.parse(saved));
    }
  }, []);

  // Save context whenever it changes
  useEffect(() => {
    localStorage.setItem('crd-assistant-context', JSON.stringify(projectContext));
  }, [projectContext]);

  const modes = {
    dev: { icon: Code, label: 'Dev', color: 'text-crd-orange' },
    design: { icon: Palette, label: 'Design', color: 'text-crd-green' },
    marketing: { icon: Megaphone, label: 'Marketing', color: 'text-crd-blue' },
    business: { icon: Briefcase, label: 'Business', color: 'text-purple-500' },
  };

  const templates = {
    dev: [
      {
        id: 'component',
        name: 'New Component',
        template: `Create a new React component for ${projectContext.name} with the following requirements:

**Component Name**: [COMPONENT_NAME]
**Purpose**: [DESCRIBE_PURPOSE]

**Technical Requirements**:
- Stack: ${projectContext.stack}
- Use TypeScript with proper types
- Mobile-first responsive design
- Include loading and error states
- Add keyboard navigation support

**Design System**:
${projectContext.designRules}

**Specific Features**:
[LIST_FEATURES]

Current focus: ${projectContext.currentFocus}`,
      },
      {
        id: 'debug',
        name: 'Debug Error',
        template: `Help me debug this error in ${projectContext.name}:

**Error Message**:
[PASTE_ERROR]

**Context**:
- Component/File: [FILE_NAME]
- What I was trying to do: [DESCRIPTION]
- Stack: ${projectContext.stack}

**Code snippet**:
\`\`\`tsx
[PASTE_RELEVANT_CODE]
\`\`\`

Please provide a solution that maintains our design system and doesn't break existing functionality.`,
      },
      {
        id: 'refactor',
        name: 'Refactor Code',
        template: `Refactor this code from ${projectContext.name} to improve performance and maintainability:

\`\`\`tsx
[PASTE_CODE]
\`\`\`

**Goals**:
- Improve TypeScript types
- Add proper error handling
- Optimize for mobile performance
- Maintain our design system: ${projectContext.designRules}
- Ensure compatibility with: ${projectContext.stack}

Keep the same functionality but make it cleaner and more efficient.`,
      },
      {
        id: 'mobile',
        name: 'Mobile Responsive',
        template: `Make this ${projectContext.name} component fully mobile responsive:

\`\`\`tsx
[PASTE_COMPONENT]
\`\`\`

**Requirements**:
- Mobile-first approach
- Touch-friendly interactions
- Proper spacing for thumbs
- Optimized for iPhone and Android
- Maintain design system: ${projectContext.designRules}

Include any necessary Tailwind classes and ensure smooth transitions.`,
      },
    ],
    design: [
      {
        id: 'figma-to-react',
        name: 'Figma to React',
        template: `Convert this Figma design to a React component for ${projectContext.name}:

**Figma Details**:
- Layer/Frame: [FIGMA_LAYER_NAME]
- Link: [FIGMA_LINK]

**Design Specs**:
[PASTE_DESIGN_DETAILS]

**Requirements**:
- Use our stack: ${projectContext.stack}
- Follow design system: ${projectContext.designRules}
- Make it responsive
- Add hover/active states
- Include animations where appropriate

Generate complete TSX with all styles.`,
      },
      {
        id: 'animation',
        name: 'Card Animation',
        template: `Create a smooth animation for ${projectContext.name} cards:

**Animation Type**: [flip/glow/entrance/hover/custom]
**Duration**: [TIME_IN_MS]
**Trigger**: [hover/click/scroll/auto]

**Card Context**:
- Where used: [LOCATION]
- Card type: [trading/profile/collection]

Use Three.js for 3D effects if needed. Keep performance smooth on mobile.
Design system: ${projectContext.designRules}`,
      },
    ],
    marketing: [
      {
        id: 'landing-copy',
        name: 'Landing Page Copy',
        template: `Write compelling landing page copy for ${projectContext.name}:

**Section**: [hero/features/cta/testimonials]
**Target Audience**: [creators/collectors/brands]
**Key Value Props**: [LIST_3_MAIN_BENEFITS]

**Brand Voice**: 
- Modern, creative, approachable
- Not too technical
- Excitement about digital collecting

Include multiple variations and CTAs.`,
      },
      {
        id: 'social',
        name: 'Social Media Post',
        template: `Create social media content for ${projectContext.name}:

**Platform**: [Twitter/LinkedIn/Instagram]
**Purpose**: [launch/feature/engagement/education]
**Include**: [SPECIFIC_FEATURE_OR_NEWS]

**Hashtags to consider**: #DigitalCards #Web3 #CreatorEconomy

Provide 3 variations with different angles.`,
      },
    ],
    business: [
      {
        id: 'investor-update',
        name: 'Investor Update',
        template: `Draft an investor update for ${projectContext.name}:

**Period**: [MONTH_YEAR]
**Key Metrics**: 
- Users: [NUMBER]
- Revenue: [NUMBER]
- Growth: [PERCENTAGE]

**Highlights**: [LIST_3_WINS]
**Challenges**: [LIST_2_CHALLENGES]
**Asks**: [WHAT_YOU_NEED]

Keep it concise but comprehensive.`,
      },
    ],
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTemplateClick = (template) => {
    setPrompt(template.template);
    setIsExpanded(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(0, 0);
    }, 100);
  };

  const getCurrentTemplates = () => templates[activeMode] || [];

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-background text-foreground p-3 rounded-full shadow-lg hover:bg-card transition-colors border border-border"
          title="Open CRD Assistant"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 font-sans">
      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 max-w-2xl bg-card rounded-lg shadow-xl p-6 border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-foreground font-semibold">Project Context</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm">Project Name</label>
              <input
                type="text"
                value={projectContext.name}
                onChange={(e) => setProjectContext({ ...projectContext, name: e.target.value })}
                className="w-full bg-background text-foreground px-3 py-2 rounded mt-1 border border-border"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-sm">Tech Stack</label>
              <input
                type="text"
                value={projectContext.stack}
                onChange={(e) => setProjectContext({ ...projectContext, stack: e.target.value })}
                className="w-full bg-background text-foreground px-3 py-2 rounded mt-1 border border-border"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-sm">Design Rules</label>
              <textarea
                value={projectContext.designRules}
                onChange={(e) => setProjectContext({ ...projectContext, designRules: e.target.value })}
                className="w-full bg-background text-foreground px-3 py-2 rounded mt-1 h-20 resize-none border border-border"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-sm">Current Focus</label>
              <input
                type="text"
                value={projectContext.currentFocus}
                onChange={(e) => setProjectContext({ ...projectContext, currentFocus: e.target.value })}
                className="w-full bg-background text-foreground px-3 py-2 rounded mt-1 border border-border"
                placeholder="e.g., 3D card viewer, mobile UX"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border-t border-border shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <div className="flex items-center gap-4">
            <span className="text-foreground font-semibold text-sm">CRD Assistant</span>
            <div className="flex gap-1">
              {Object.entries(modes).map(([key, mode]) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveMode(key)}
                    className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors ${
                      activeMode === key
                        ? `bg-muted ${mode.color}`
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-muted-foreground hover:text-foreground p-1"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-muted-foreground hover:text-foreground p-1"
              title="Minimize"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Template Buttons */}
        <div className="px-4 py-3 flex gap-2 flex-wrap">
          {getCurrentTemplates().map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md text-sm transition-colors"
            >
              {template.name}
            </button>
          ))}
        </div>

        {/* Expanded Prompt Area */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-border">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type or paste your prompt here..."
                className="w-full bg-background text-foreground placeholder-muted-foreground px-4 py-3 rounded-lg resize-none h-40 font-mono text-sm border border-border"
              />
              <button
                onClick={() => copyToClipboard(prompt, 'prompt')}
                className="absolute top-2 right-2 p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                title="Copy to clipboard"
              >
                {copiedId === 'prompt' ? (
                  <Check className="w-4 h-4 text-crd-green" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Press Cmd+Enter to copy • {prompt.length} characters
              </span>
              <button
                onClick={() => setPrompt('')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRDAssistantToolbar;
import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Copy, Check, Code, Palette, Megaphone, Briefcase, Settings, X, Minimize2, Maximize2, Monitor, Play, SkipForward, RotateCcw, CheckCircle } from 'lucide-react';

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
    animationTrigger: 'double-click',
    requirePrecision: true,
    visualExpectations: 'corona glow, reflective monolith, obsidian depth, floating moon',
    stateBehavior: 'persistent',
  });
  const [showDebugMode, setShowDebugMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [debugState, setDebugState] = useState({
    scale: '1.0x',
    tilt: '0°',
    zoom: '100%',
    centered: false,
    triggerFlags: [],
    cooldown: false,
    readiness: 'idle',
    phase: 'none',
    lovablePrompt: ''
  });
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

  // Lovable prompt monitoring
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hostname.includes('lovable')) return;

    let throttleTimeout = null;
    
    const handlePromptInput = (e) => {
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        const value = e.target.value;
        setDebugState(prev => ({ ...prev, lovablePrompt: value }));
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('prompt:changed', { detail: value }));
        
        // Check for key phrases
        const keyPhrases = ['fix animation', 'alignment system', 'kubrick', 'monolith', 'glitch', 'jitter'];
        const hasKeyPhrase = keyPhrases.some(phrase => value.toLowerCase().includes(phrase));
        
        if (hasKeyPhrase) {
          console.log('[CRD-PROMPT-DETECTED]', value.substring(0, 100) + '...');
        }
        
        throttleTimeout = null;
      }, 100);
    };

    const observer = new MutationObserver(() => {
      const promptInput = document.querySelector('textarea[placeholder*="prompt" i], textarea[class*="prompt" i], #prompt-input, [data-testid="prompt-input"]');
      if (promptInput && !promptInput.hasAttribute('data-crd-monitored')) {
        promptInput.addEventListener('keyup', handlePromptInput);
        promptInput.setAttribute('data-crd-monitored', 'true');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, []);

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
        id: 'fix-glitch',
        name: 'Fix Glitching Animations',
        template: `Fix the jitter in [component]. Use useMemo or static constants for any visuals using Math.random. Make sure visual randomness does not change on re-render.`,
      },
      {
        id: 'clean-refactor',
        name: 'Clean Refactor',
        template: `Fully remove [old system name] and replace with [new system]. Confirm every reference, import, and hook is cleaned. Do not leave lingering props or state.`,
      },
      {
        id: 'animation-trigger',
        name: 'Animation Trigger System',
        template: `Create an animation trigger system that activates when the card reaches:
- 400% zoom
- 45°+ tilt
- both edges of the card span beyond 100% screen width

Trigger: ${projectContext.animationTrigger}
Precision Required: ${projectContext.requirePrecision ? 'Yes' : 'No'}
Visual Effects: ${projectContext.visualExpectations}
State Behavior: ${projectContext.stateBehavior}

If held for 2s, trigger full Kubrick sequence. Otherwise, show progressive UI indicator of how close the user is to ideal alignment.`,
      },
      {
        id: 'cinematic-sequence',
        name: 'Cinematic Sequence',
        template: `Once triggered, animate the following:
1. Obsidian transformation
2. Sun glow peeking over top edge from behind
3. Moon descending from above
4. Light beam through all elements
5. Environmental stars reflected in monolith

Visual Expectations: ${projectContext.visualExpectations}
State Behavior: ${projectContext.stateBehavior}`,
      },
      {
        id: 'debug-checklist',
        name: 'Debug Checklist',
        template: `Generate a debug checklist for ${projectContext.name} animation issues:

**Checklist Items:**
□ Verify imports are correct
□ Confirm state cleared properly
□ Check animation mounted only once
□ Confirm visual effects load order
□ Test trigger thresholds: ${projectContext.animationTrigger}
□ Validate precision requirements: ${projectContext.requirePrecision ? 'Required' : 'Optional'}
□ Check visual effects: ${projectContext.visualExpectations}
□ Verify state behavior: ${projectContext.stateBehavior}

**Debugging Steps:**
1. Add console.log to track state changes
2. Check Three.js render order
3. Verify animation cleanup
4. Test on different devices`,
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground text-sm">Animation Trigger Type</label>
                <select
                  value={projectContext.animationTrigger}
                  onChange={(e) => setProjectContext({ ...projectContext, animationTrigger: e.target.value })}
                  className="w-full bg-background text-foreground px-3 py-2 rounded mt-1 border border-border"
                >
                  <option value="double-click">Double-click</option>
                  <option value="precise-viewing">Precise viewing alignment</option>
                  <option value="gesture-based">Gesture-based (drag-up, zoom)</option>
                  <option value="auto-trigger">Auto-trigger on stable viewing</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground text-sm">State Behavior</label>
                <select
                  value={projectContext.stateBehavior}
                  onChange={(e) => setProjectContext({ ...projectContext, stateBehavior: e.target.value })}
                  className="w-full bg-background text-foreground px-3 py-2 rounded mt-1 border border-border"
                >
                  <option value="persistent">Persistent (resets on route)</option>
                  <option value="freezes">Freezes on trigger</option>
                  <option value="interactable">Always interactable</option>
                  <option value="manual-cancel">Allow manual cancel</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-muted-foreground text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={projectContext.requirePrecision}
                  onChange={(e) => setProjectContext({ ...projectContext, requirePrecision: e.target.checked })}
                  className="rounded"
                />
                Require Precision Positioning
              </label>
            </div>
            <div>
              <label className="text-muted-foreground text-sm">Visual Expectations</label>
              <input
                type="text"
                value={projectContext.visualExpectations}
                onChange={(e) => setProjectContext({ ...projectContext, visualExpectations: e.target.value })}
                className="w-full bg-background text-foreground px-3 py-2 rounded mt-1 border border-border"
                placeholder="e.g., corona glow, reflective monolith, obsidian depth"
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
              onClick={() => setShowDebugMode(!showDebugMode)}
              className={`text-muted-foreground hover:text-foreground p-1 ${showDebugMode ? 'text-crd-orange' : ''}`}
              title="Debug Mode"
            >
              <Monitor className="w-5 h-5" />
            </button>
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

      {/* Debug Overlay - "Monolith Dev Mode" */}
      {showDebugMode && (
        <div className="fixed bottom-4 left-4 bg-card border border-border rounded-lg shadow-xl p-4 w-80 z-40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
              <Monitor className="w-4 h-4 text-crd-orange" />
              Monolith Dev Mode
            </h3>
            <button
              onClick={() => setShowDebugMode(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time Transform Viewer */}
          <div className="space-y-3">
            <div className="bg-background p-3 rounded border border-border">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">TRANSFORM STATUS</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Scale: <span className="text-crd-orange">{debugState.scale}</span></div>
                <div>Tilt: <span className="text-crd-blue">{debugState.tilt}</span></div>
                <div>Zoom: <span className="text-crd-green">{debugState.zoom}</span></div>
                <div>Centered: <span className={debugState.centered ? 'text-crd-green' : 'text-muted-foreground'}>{debugState.centered ? 'YES' : 'NO'}</span></div>
              </div>
            </div>

            {/* State Log */}
            <div className="bg-background p-3 rounded border border-border">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">STATE LOG</h4>
              <div className="text-xs space-y-1">
                <div>Readiness: <span className="text-crd-orange">{debugState.readiness}</span></div>
                <div>Cooldown: <span className={debugState.cooldown ? 'text-crd-blue' : 'text-muted-foreground'}>{debugState.cooldown ? 'ACTIVE' : 'NONE'}</span></div>
                <div>Flags: <span className="text-crd-green">{debugState.triggerFlags.join(', ') || 'none'}</span></div>
              </div>
            </div>

            {/* Phase Preview */}
            <div className="bg-background p-3 rounded border border-border">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">PHASE PREVIEW</h4>
              <div className="text-xs">
                Current: <span className="text-crd-orange">{debugState.phase}</span>
              </div>
              <div className="flex gap-1 mt-2">
                {['sun rising', 'moon descending', 'alignment complete'].map((phase, index) => (
                  <div
                    key={phase}
                    className={`px-2 py-1 rounded text-xs ${
                      debugState.phase === phase ? 'bg-crd-orange text-black' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {phase}
                  </div>
                ))}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setDebugState(prev => ({ ...prev, phase: 'sun rising' }))}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded text-xs transition-colors"
                title="Test Phase"
              >
                <Play className="w-3 h-3" />
                Test
              </button>
              <button
                onClick={() => setDebugState(prev => ({ ...prev, phase: 'alignment complete' }))}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded text-xs transition-colors"
                title="Skip Phase"
              >
                <SkipForward className="w-3 h-3" />
                Skip
              </button>
              <button
                onClick={() => setDebugState(prev => ({ ...prev, phase: 'none', readiness: 'idle', triggerFlags: [], cooldown: false }))}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded text-xs transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
              <button
                onClick={() => setDebugState(prev => ({ ...prev, phase: 'alignment complete', readiness: 'complete' }))}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-crd-green text-black hover:bg-crd-green/80 rounded text-xs transition-colors"
                title="Force Complete"
              >
                <CheckCircle className="w-3 h-3" />
                Complete
              </button>
            </div>

            {/* Lovable Prompt Watcher */}
            {debugState.lovablePrompt && (
              <div className="bg-background p-3 rounded border border-border">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">LOVABLE PROMPT STREAM</h4>
                <div className="text-xs text-foreground font-mono bg-muted p-2 rounded max-h-20 overflow-y-auto">
                  {debugState.lovablePrompt.substring(0, 150)}
                  {debugState.lovablePrompt.length > 150 && '...'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CRDAssistantToolbar;

import React from 'react';
import { designTokens } from './tokens';

// Component specifications extracted from actual interface
export const ComponentSpecs = {
  // Trading Card Components
  TradingCard: {
    aspectRatio: '3/4',
    borderRadius: '12px',
    minWidth: '180px',
    maxWidth: '240px',
    hover: {
      transform: 'translateY(-4px) scale(1.03)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      shadow: '0 12px 24px rgba(0, 0, 0, 0.4)',
    },
    rarity: {
      common: { border: '1px solid #334155' },
      uncommon: { border: '2px solid #4ade80', glow: '0 0 20px rgba(74, 222, 128, 0.4)' },
      rare: { border: '2px solid #4A90FF', glow: '0 0 20px rgba(74, 144, 255, 0.4)' },
      epic: { border: '2px solid #9757D7', glow: '0 0 20px rgba(151, 87, 215, 0.4)' },
      legendary: { border: '2px solid #FF6B4A', glow: '0 0 20px rgba(255, 107, 74, 0.4)' },
    }
  },

  // Navigation Components
  Navigation: {
    height: '64px',
    background: 'rgba(10, 10, 11, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid #334155',
    padding: '0 24px',
    zIndex: 1000,
    items: {
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      active: {
        color: '#4ade80',
        background: 'rgba(74, 222, 128, 0.1)',
        indicator: {
          height: '2px',
          background: '#4ade80',
          shadow: '0 0 8px rgba(74, 222, 128, 0.5)',
        }
      }
    }
  },

  // Profile Components
  Profile: {
    hero: {
      background: 'linear-gradient(135deg, #131316 0%, #1a1f2e 100%)',
      padding: '60px 40px 40px',
      borderRadius: '0 0 24px 24px',
      gap: '40px',
    },
    avatar: {
      sizes: {
        sm: '32px',
        md: '48px', 
        lg: '80px',
        xl: '120px',
      },
      border: '4px solid #4ade80',
      shadow: '0 0 30px rgba(74, 222, 128, 0.4)',
    },
    stats: {
      grid: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '20px',
      card: {
        background: '#131316',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #334155',
        hover: {
          borderColor: '#4ade80',
          transform: 'translateY(-2px)',
        }
      }
    }
  },

  // Button Components
  Buttons: {
    primary: {
      background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
      color: 'black',
      fontWeight: '600',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      hover: {
        transform: 'translateY(-2px)',
        shadow: '0 8px 16px rgba(74, 222, 128, 0.3)',
      }
    },
    secondary: {
      background: 'transparent',
      border: '1px solid #334155',
      color: '#ffffff',
      fontWeight: '500',
      borderRadius: '8px',
      hover: {
        borderColor: '#4ade80',
        background: 'rgba(74, 222, 128, 0.1)',
      }
    },
    sizes: {
      sm: { height: '32px', padding: '8px 16px', fontSize: '12px' },
      md: { height: '40px', padding: '12px 24px', fontSize: '14px' },
      lg: { height: '48px', padding: '16px 32px', fontSize: '16px' },
    }
  },

  // Marketplace Components
  Marketplace: {
    priceTag: {
      background: '#4ade80',
      color: 'black',
      padding: '4px 12px',
      borderRadius: '20px',
      fontWeight: '600',
      fontSize: '14px',
    },
    bidTag: {
      background: '#f59e0b',
      color: 'black',
      padding: '4px 12px',
      borderRadius: '20px',
      fontWeight: '600',
      fontSize: '14px',
    },
    statusTags: {
      sold: {
        background: 'rgba(0, 0, 0, 0.7)',
        color: '#64748b',
        padding: '4px 12px',
        borderRadius: '20px',
        fontWeight: '500',
      },
      verified: {
        background: '#4ade80',
        color: 'black',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
      }
    }
  },

  // Grid Systems
  Grids: {
    cards: {
      mobile: 'repeat(2, 1fr)',
      tablet: 'repeat(3, 1fr)',
      desktop: 'repeat(4, 1fr)',
      wide: 'repeat(5, 1fr)',
      gap: {
        mobile: '16px',
        desktop: '20px',
      },
      padding: {
        mobile: '16px',
        desktop: '20px',
      }
    }
  },

  // Form Components
  Forms: {
    input: {
      background: '#131316',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '16px 20px',
      fontSize: '16px',
      color: '#ffffff',
      placeholder: '#64748b',
      focus: {
        borderColor: '#4ade80',
        shadow: '0 0 0 3px rgba(74, 222, 128, 0.1)',
      }
    },
    search: {
      background: '#131316',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }
  }
} as const;

// Usage examples component
export const ComponentUsageExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">Component Specifications</h2>
        <p className="text-muted-foreground mb-6">
          These specifications are extracted from the actual implemented interface and should be used 
          as the reference for all component development.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3 text-foreground">Trading Cards</h3>
        <div className="bg-card p-4 rounded-lg border border-border">
          <pre className="text-sm text-muted-foreground overflow-x-auto">
            {JSON.stringify(ComponentSpecs.TradingCard, null, 2)}
          </pre>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3 text-foreground">Navigation</h3>  
        <div className="bg-card p-4 rounded-lg border border-border">
          <pre className="text-sm text-muted-foreground overflow-x-auto">
            {JSON.stringify(ComponentSpecs.Navigation, null, 2)}
          </pre>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3 text-foreground">Profile Components</h3>
        <div className="bg-card p-4 rounded-lg border border-border">
          <pre className="text-sm text-muted-foreground overflow-x-auto">
            {JSON.stringify(ComponentSpecs.Profile, null, 2)}
          </pre>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3 text-foreground">Marketplace Elements</h3>
        <div className="bg-card p-4 rounded-lg border border-border">
          <pre className="text-sm text-muted-foreground overflow-x-auto">
            {JSON.stringify(ComponentSpecs.Marketplace, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default ComponentSpecs;

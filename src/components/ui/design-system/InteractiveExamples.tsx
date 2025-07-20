
import React, { useState } from 'react';
import { UniversalButton } from './atoms/UniversalButton';
import { UniversalCard } from './atoms/UniversalCard';
import { UniversalInput } from './atoms/UniversalInput';
import { Search, Heart, Share2, Eye, User, ShoppingCart } from 'lucide-react';

export const InteractiveExamples: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="space-y-12 p-6">
      <section>
        <h2 className="text-2xl font-bold mb-6 text-foreground">Interactive Examples</h2>
        <p className="text-muted-foreground mb-8">
          Live examples of components matching the actual implemented interface.
        </p>
      </section>

      {/* Button Examples */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Button Variants</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <UniversalButton variant="primary">Primary Action</UniversalButton>
          <UniversalButton variant="secondary">Secondary</UniversalButton>
          <UniversalButton variant="outline">Outline</UniversalButton>
          <UniversalButton variant="ghost">Ghost</UniversalButton>
          <UniversalButton variant="gradient">Gradient</UniversalButton>
        </div>
        <div className="flex flex-wrap gap-4">
          <UniversalButton variant="primary" size="sm">Small</UniversalButton>
          <UniversalButton variant="primary" size="default">Default</UniversalButton>
          <UniversalButton variant="primary" size="lg">Large</UniversalButton>
        </div>
      </section>

      {/* Card Examples */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Card Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UniversalCard variant="default" hover="lift">
            <div className="p-4">
              <h4 className="font-semibold text-foreground mb-2">Default Card</h4>
              <p className="text-muted-foreground text-sm">Standard card with lift hover effect.</p>
            </div>
          </UniversalCard>
          
          <UniversalCard variant="elevated" hover="glow">
            <div className="p-4">
              <h4 className="font-semibold text-foreground mb-2">Elevated Card</h4>
              <p className="text-muted-foreground text-sm">Elevated card with glow effect.</p>
            </div>
          </UniversalCard>
          
          <UniversalCard variant="accent" hover="scale">
            <div className="p-4">
              <h4 className="font-semibold text-foreground mb-2">Accent Card</h4>
              <p className="text-muted-foreground text-sm">Accent card with scale effect.</p>
            </div>
          </UniversalCard>
        </div>
      </section>

      {/* Trading Card Example */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Trading Card Layout</h3>
        <div className="max-w-sm">
          <UniversalCard className="aspect-[3/4] overflow-hidden group cursor-pointer" hover="lift">
            <div className="relative h-full">
              {/* Card Image */}
              <div className="h-2/3 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                <div className="text-white/60 text-center">
                  <div className="text-4xl mb-2">🎨</div>
                  <div className="text-sm">Card Artwork</div>
                </div>
              </div>
              
              {/* Card Info */}
              <div className="h-1/3 p-4 bg-card flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Epic Card Title</h4>
                  <p className="text-xs text-muted-foreground">By @creator</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#4ade80] text-black text-xs font-semibold rounded-full">
                      25 C
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <button 
                      onClick={() => setLiked(!liked)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-red-400 text-red-400' : ''}`} />
                    </button>
                    <span className="text-xs">142</span>
                  </div>
                </div>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <UniversalButton variant="primary" size="sm" icon={<Eye className="w-4 h-4" />}>
                  View
                </UniversalButton>
                <UniversalButton variant="secondary" size="sm" icon={<Share2 className="w-4 h-4" />}>
                  Share
                </UniversalButton>
              </div>
            </div>
          </UniversalCard>
        </div>
      </section>

      {/* Form Examples */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Form Components</h3>
        <div className="max-w-md space-y-4">
          <UniversalInput
            placeholder="Search cards..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          
          <UniversalInput
            placeholder="Enter username"
            icon={<User className="w-4 h-4" />}
          />
          
          <UniversalInput
            type="number"
            placeholder="Price in credits"
            icon={<ShoppingCart className="w-4 h-4" />}
          />
        </div>
      </section>

      {/* Profile Section Example */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Profile Section</h3>
        <UniversalCard className="overflow-hidden">
          {/* Profile Header */}
          <div className="h-32 bg-gradient-to-r from-slate-700 to-slate-800"></div>
          
          {/* Profile Content */}
          <div className="p-6 -mt-16 relative">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full border-4 border-[#4ade80] bg-slate-600 flex items-center justify-center text-2xl">
                👤
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 mt-8">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-foreground">Creator Name</h2>
                  <span className="px-2 py-1 bg-[#4ade80] text-black text-xs font-semibold rounded-full">
                    ✓ Verified
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">Digital artist and card creator</p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">1.2K</div>
                    <div className="text-xs text-muted-foreground">Cards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">45K</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">892</div>
                    <div className="text-xs text-muted-foreground">Sales</div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-8">
                <UniversalButton variant="primary" size="sm">Follow</UniversalButton>
                <UniversalButton variant="outline" size="sm">Message</UniversalButton>
              </div>
            </div>
          </div>
        </UniversalCard>
      </section>

      {/* Status Tags */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Status Tags & Badges</h3>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 bg-[#4ade80] text-black text-sm font-semibold rounded-full">
            25 Credits
          </span>
          <span className="px-3 py-1 bg-[#f59e0b] text-black text-sm font-semibold rounded-full">
            Current Bid: 45 C
          </span>
          <span className="px-3 py-1 bg-[#ef4444] text-white text-sm font-semibold rounded-full">
            Auction Ends: 2h 15m
          </span>
          <span className="px-3 py-1 bg-slate-600 text-slate-300 text-sm font-medium rounded-full">
            Sold
          </span>
          <span className="px-2 py-1 bg-[#4ade80] text-black text-xs font-semibold rounded-full">
            ✓ Verified
          </span>
          <span className="px-2 py-1 bg-[#9757D7] text-white text-xs font-semibold rounded-full">
            Premium
          </span>
        </div>
      </section>

      {/* Color Palette */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Color Palette</h3>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {[
            { name: 'CRD Green', color: '#4ade80', text: 'black' },
            { name: 'CRD Blue', color: '#4A90FF', text: 'white' },
            { name: 'CRD Orange', color: '#FF6B4A', text: 'white' },
            { name: 'Purple', color: '#9757D7', text: 'white' },
            { name: 'Warning', color: '#f59e0b', text: 'black' },
            { name: 'Error', color: '#ef4444', text: 'white' },
            { name: 'Background', color: '#0a0a0b', text: 'white' },
            { name: 'Card BG', color: '#131316', text: 'white' },
            { name: 'Panel BG', color: '#1a1f2e', text: 'white' },
            { name: 'Border', color: '#334155', text: 'white' },
            { name: 'Text Primary', color: '#ffffff', text: 'black' },
            { name: 'Text Muted', color: '#64748b', text: 'white' },
          ].map((color) => (
            <div key={color.name} className="text-center">
              <div 
                className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center text-xs font-medium"
                style={{ backgroundColor: color.color, color: color.text }}
              >
                {color.color}
              </div>
              <div className="text-xs text-muted-foreground">{color.name}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default InteractiveExamples;

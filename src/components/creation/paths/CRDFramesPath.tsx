import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, DollarSign, TestTube } from 'lucide-react';
import { UniversalButton, UniversalCard, UniversalBadge } from '@/components/ui/design-system';

interface CRDFramesPathProps {
  onBack: () => void;
}

export const CRDFramesPath: React.FC<CRDFramesPathProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'import' | 'elements' | 'monetize' | 'test'>('import');

  const tabs = [
    { id: 'import', label: 'PSD Import', icon: <Upload className="w-4 h-4" /> },
    { id: 'elements', label: 'Element Library', icon: <FileText className="w-4 h-4" /> },
    { id: 'monetize', label: 'Monetization', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'test', label: 'Test Mode', icon: <TestTube className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <UniversalButton 
              variant="outline" 
              size="sm"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Paths
            </UniversalButton>
            <div>
              <h1 className="text-2xl font-bold text-white">CRD Frames Studio</h1>
              <p className="text-muted-foreground">Professional template creation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <UniversalBadge variant="outline">
              10-30 minutes
            </UniversalBadge>
            <UniversalBadge variant="success">
              Pro
            </UniversalBadge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8">
          {tabs.map((tab) => (
            <UniversalButton
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.icon}
              {tab.label}
            </UniversalButton>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'import' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <UniversalCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">
                Import PSD File
              </h2>
              
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Drop your PSD file here
                </h3>
                <p className="text-muted-foreground">
                  Convert Photoshop files to CRD templates
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="font-medium text-white">Requirements</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Layer names should be descriptive</li>
                  <li>• Use smart objects for customizable elements</li>
                  <li>• Maximum file size: 100MB</li>
                  <li>• Recommended resolution: 300 DPI</li>
                </ul>
              </div>
            </UniversalCard>

            <UniversalCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">
                Layer Analysis
              </h2>
              
              <div className="space-y-4">
                <div className="text-center py-12 text-muted-foreground">
                  Upload a PSD file to see layer analysis
                </div>
              </div>
            </UniversalCard>
          </div>
        )}

        {activeTab === 'elements' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <UniversalCard className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Element Library
                </h2>
                
                <div className="space-y-3">
                  {['Backgrounds', 'Frames', 'Decorations', 'Text Styles', 'Effects'].map((category) => (
                    <button
                      key={category}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/20 text-muted-foreground hover:text-white transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </UniversalCard>
            </div>

            <div className="lg:col-span-2">
              <UniversalCard className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Drag & Drop Components
                </h2>
                
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-muted/20 rounded-lg p-3 cursor-pointer hover:bg-muted/30 transition-colors flex items-center justify-center"
                    >
                      <span className="text-xs text-white">Element {i + 1}</span>
                    </div>
                  ))}
                </div>
              </UniversalCard>
            </div>
          </div>
        )}

        {activeTab === 'monetize' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <UniversalCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">
                Template Pricing
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Template Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Revenue Share
                  </label>
                  <div className="text-sm text-muted-foreground">
                    Platform fee: 30% • Your earnings: 70%
                  </div>
                </div>
              </div>
            </UniversalCard>

            <UniversalCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">
                Distribution Options
              </h2>
              
              <div className="space-y-4">
                {[
                  'Public Marketplace',
                  'Private Access Only',
                  'Limited Edition Release',
                  'Free Community Template'
                ].map((option) => (
                  <label key={option} className="flex items-center gap-3">
                    <input type="radio" name="distribution" className="w-4 h-4" />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </UniversalCard>
          </div>
        )}

        {activeTab === 'test' && (
          <UniversalCard className="p-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              Template Testing
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-white mb-4">Preview Mode</h3>
                <div className="aspect-[3/4] bg-muted/20 rounded-lg p-8">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <span className="text-white">Template Preview</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-white mb-4">Test Scenarios</h3>
                  <div className="space-y-3">
                    {[
                      'Different image ratios',
                      'Long text content',
                      'Missing elements',
                      'Color variations'
                    ].map((scenario) => (
                      <UniversalButton key={scenario} variant="outline" size="sm" className="w-full justify-start">
                        Test: {scenario}
                      </UniversalButton>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-4">Quality Check</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolution Quality</span>
                      <span className="text-green-400">✓ Passed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Layer Mapping</span>
                      <span className="text-green-400">✓ Passed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Compatibility</span>
                      <span className="text-yellow-400">⚠ Warning</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UniversalCard>
        )}
      </div>
    </div>
  );
};
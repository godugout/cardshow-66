import React from 'react';
import { EnhancedCardDetectionTester } from '@/components/debug/EnhancedCardDetectionTester';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CRDMKRCardFinder = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-crd-darkest via-[#0a0a0b] to-[#131316]">
      {/* Header */}
      <div className="border-b border-crd-border/20 bg-crd-surface/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/crdmkr')}
                className="text-crd-muted hover:text-crd-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to CRD Maker
              </Button>
              <div className="h-6 w-px bg-crd-border/40" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-crd-orange/20 to-crd-yellow/20">
                  <Search className="w-5 h-5 text-crd-orange" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-crd-foreground">
                    Card Finder
                  </h1>
                  <p className="text-sm text-crd-muted">
                    AI-powered card detection & extraction
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-crd-green/20 border border-crd-green/30">
                <Zap className="w-4 h-4 text-crd-green" />
                <span className="text-sm font-medium text-crd-green">
                  AI Enhanced
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <EnhancedCardDetectionTester />
        </div>
      </div>
    </div>
  );
};

export default CRDMKRCardFinder;
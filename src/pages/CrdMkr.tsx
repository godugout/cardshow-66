import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Plus, Sparkles, ArrowRight, User, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CrdMkr() {
  console.log('CrdMkr - Component rendering');
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-crd-black via-crd-surface to-crd-black">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-crd-text mb-4 font-display">
              CRDMKR Studio
            </h1>
            <p className="text-crd-text-dim mb-8">
              Professional PSD-to-Frame conversion and card creation tools
            </p>
            
            {/* Creator Tools Quick Access */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Link to="/crdmkr/frame-builder" className="block">
                <div className="p-6 bg-crd-surface border border-crd-orange/20 hover:border-crd-orange rounded-lg hover:scale-105 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-crd-orange to-crd-yellow rounded-xl flex items-center justify-center">
                      <Palette className="w-6 h-6 text-crd-black" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-crd-text mb-1">Frame Builder</h3>
                      <p className="text-sm text-crd-text-dim">Convert PSD files into professional frame templates</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-crd-orange" />
                  </div>
                </div>
              </Link>
              
              <Link to="/create" className="block">
                <div className="p-6 bg-crd-surface border border-crd-green/20 hover:border-crd-green rounded-lg hover:scale-105 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-crd-green to-crd-blue rounded-xl flex items-center justify-center">
                      <Plus className="w-6 h-6 text-crd-black" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-crd-text mb-1">Card Creator</h3>
                      <p className="text-sm text-crd-text-dim">Create cards using frames and templates</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-crd-green" />
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="mt-8 text-crd-text-dim">
              <p>Authentication system temporarily simplified - routes now accessible</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
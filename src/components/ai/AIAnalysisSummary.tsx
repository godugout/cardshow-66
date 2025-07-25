/**
 * AI Analysis Summary Component
 * Provides AI-powered suggestions for card details based on uploaded images
 */

import React, { useState } from 'react';
import { Sparkles, Check, Loader2, RefreshCw, Tag, Type, FileText, Star } from 'lucide-react';
import { CRDButton } from '@/components/ui/design-system/atoms/CRDButton';
import { CRDCard } from '@/components/ui/design-system/atoms/CRDCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIAnalysisResult {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  rawAnalysis?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

interface AIAnalysisSummaryProps {
  imageUrl?: string;
  imageData?: string; // Base64 data
  imageFile?: File;
  onAcceptTitle?: (title: string) => void;
  onAcceptDescription?: (description: string) => void;
  onAcceptCategory?: (category: string) => void;
  onAcceptTags?: (tags: string) => void;
  onAcceptRarity?: (rarity: string) => void;
  onAcceptAll?: (analysis: AIAnalysisResult) => void;
  className?: string;
}

export const AIAnalysisSummary: React.FC<AIAnalysisSummaryProps> = ({
  imageUrl,
  imageData,
  imageFile,
  onAcceptTitle,
  onAcceptDescription,
  onAcceptCategory,
  onAcceptTags,
  onAcceptRarity,
  onAcceptAll,
  className = ''
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analyzeImage = async () => {
    if (!imageUrl && !imageData && !imageFile) {
      toast.error('No image provided for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      let analysisData = null;

      // If we have a file, convert it to base64
      if (imageFile && !imageData) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string;
          await performAnalysis(imageUrl, base64Data.split(',')[1]); // Remove data:image/...;base64, prefix
        };
        reader.readAsDataURL(imageFile);
        return;
      }

      // Perform analysis with existing data
      await performAnalysis(imageUrl, imageData);

    } catch (error) {
      console.error('AI Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      toast.error('Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performAnalysis = async (url?: string, data?: string) => {
    const { data: result, error } = await supabase.functions.invoke('analyze-card-with-gemini', {
      body: {
        imageUrl: url,
        imageData: data
      }
    });

    if (error) {
      throw error;
    }

    if (result) {
      setAnalysis(result);
      setHasAnalyzed(true);
      toast.success('AI analysis complete!');
    }
  };

  const handleAcceptField = (field: string, value: any) => {
    switch (field) {
      case 'title':
        onAcceptTitle?.(value);
        break;
      case 'description':
        onAcceptDescription?.(value);
        break;
      case 'category':
        onAcceptCategory?.(value);
        break;
      case 'tags':
        onAcceptTags?.(Array.isArray(value) ? value.join(', ') : value);
        break;
      case 'rarity':
        onAcceptRarity?.(value);
        break;
    }
    toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} applied!`);
  };

  const handleAcceptAll = () => {
    if (analysis) {
      onAcceptAll?.(analysis);
      toast.success('All AI suggestions applied!');
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  if (!imageUrl && !imageData && !imageFile) {
    return null;
  }

  return (
    <CRDCard className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-crd-text flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-crd-orange" />
          AI Analysis
        </h3>
        
        {!hasAnalyzed && (
          <CRDButton
            onClick={analyzeImage}
            disabled={isAnalyzing}
            variant="orange"
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Image
              </>
            )}
          </CRDButton>
        )}

        {hasAnalyzed && !isAnalyzing && (
          <CRDButton
            onClick={analyzeImage}
            variant="ghost"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-analyze
          </CRDButton>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          {/* Confidence Score */}
          {analysis.confidence && (
            <div className="bg-crd-surface-light rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-crd-text-dim">Analysis Confidence</span>
                <span className="text-sm font-medium text-crd-text">
                  {Math.round(analysis.confidence * 100)}%
                </span>
              </div>
              <div className="w-full bg-crd-surface rounded-full h-2">
                <div 
                  className="bg-crd-orange h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(analysis.confidence || 0) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Accept All Button */}
          <CRDButton
            onClick={handleAcceptAll}
            variant="success"
            size="sm"
            className="w-full mb-4"
          >
            <Check className="w-4 h-4 mr-2" />
            Accept All Suggestions
          </CRDButton>

          {/* Individual Suggestions */}
          <div className="space-y-3">
            {/* Title Suggestion */}
            {analysis.title && (
              <div className="bg-crd-surface-light rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Type className="w-4 h-4 mr-2 text-crd-text-dim" />
                      <span className="text-sm font-medium text-crd-text-dim">Suggested Title</span>
                    </div>
                    <p className="text-crd-text font-medium">{analysis.title}</p>
                  </div>
                  <CRDButton
                    onClick={() => handleAcceptField('title', analysis.title)}
                    variant="ghost"
                    size="sm"
                  >
                    <Check className="w-4 h-4" />
                  </CRDButton>
                </div>
              </div>
            )}

            {/* Description Suggestion */}
            {analysis.description && (
              <div className="bg-crd-surface-light rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 mr-2 text-crd-text-dim" />
                      <span className="text-sm font-medium text-crd-text-dim">Suggested Description</span>
                    </div>
                    <p className="text-crd-text text-sm">{analysis.description}</p>
                  </div>
                  <CRDButton
                    onClick={() => handleAcceptField('description', analysis.description)}
                    variant="ghost"
                    size="sm"
                  >
                    <Check className="w-4 h-4" />
                  </CRDButton>
                </div>
              </div>
            )}

            {/* Category Suggestion */}
            {analysis.category && (
              <div className="bg-crd-surface-light rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Tag className="w-4 h-4 mr-2 text-crd-text-dim" />
                      <span className="text-sm font-medium text-crd-text-dim">Suggested Category</span>
                    </div>
                    <p className="text-crd-text">{analysis.category}</p>
                  </div>
                  <CRDButton
                    onClick={() => handleAcceptField('category', analysis.category)}
                    variant="ghost"
                    size="sm"
                  >
                    <Check className="w-4 h-4" />
                  </CRDButton>
                </div>
              </div>
            )}

            {/* Tags Suggestion */}
            {analysis.tags && analysis.tags.length > 0 && (
              <div className="bg-crd-surface-light rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Tag className="w-4 h-4 mr-2 text-crd-text-dim" />
                      <span className="text-sm font-medium text-crd-text-dim">Suggested Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-crd-surface text-crd-text text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <CRDButton
                    onClick={() => handleAcceptField('tags', analysis.tags)}
                    variant="ghost"
                    size="sm"
                  >
                    <Check className="w-4 h-4" />
                  </CRDButton>
                </div>
              </div>
            )}

            {/* Rarity Suggestion */}
            {analysis.rarity && (
              <div className="bg-crd-surface-light rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 mr-2 text-crd-text-dim" />
                      <span className="text-sm font-medium text-crd-text-dim">Suggested Rarity</span>
                    </div>
                    <p className={`font-medium ${getRarityColor(analysis.rarity)}`}>
                      {analysis.rarity.charAt(0).toUpperCase() + analysis.rarity.slice(1)}
                    </p>
                  </div>
                  <CRDButton
                    onClick={() => handleAcceptField('rarity', analysis.rarity)}
                    variant="ghost"
                    size="sm"
                  >
                    <Check className="w-4 h-4" />
                  </CRDButton>
                </div>
              </div>
            )}
          </div>

          {/* Raw Analysis (if available) */}
          {analysis.rawAnalysis && (
            <details className="bg-crd-surface-light rounded-lg p-4">
              <summary className="text-sm text-crd-text-dim cursor-pointer">
                View Full AI Analysis
              </summary>
              <div className="mt-3 text-sm text-crd-text whitespace-pre-wrap">
                {analysis.rawAnalysis}
              </div>
            </details>
          )}
        </div>
      )}

      {isAnalyzing && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-crd-orange mx-auto mb-3" />
            <p className="text-crd-text-dim">Analyzing your image with AI...</p>
            <p className="text-xs text-crd-text-muted mt-1">This may take a few seconds</p>
          </div>
        </div>
      )}

      {!hasAnalyzed && !isAnalyzing && (
        <div className="text-center py-6">
          <Sparkles className="w-12 h-12 text-crd-text-muted mx-auto mb-3" />
          <p className="text-crd-text-dim">Click "Analyze Image" to get AI-powered suggestions</p>
          <p className="text-xs text-crd-text-muted mt-1">
            AI will suggest title, description, category, tags, and rarity
          </p>
        </div>
      )}
    </CRDCard>
  );
};
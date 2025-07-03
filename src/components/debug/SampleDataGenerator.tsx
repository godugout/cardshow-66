import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { generateSampleData, getSampleCard } from '@/utils/sampleDataGenerator';
import { useStudioState } from '@/hooks/studio/useStudioState';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Database, Play } from 'lucide-react';

export const SampleDataGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { setCurrentCard } = useStudioState();
  const { user } = useAuth();

  const handleGenerateData = async () => {
    if (!user) {
      toast.error('Please sign in to generate sample data');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateSampleData(user.id);
      toast.success(`Created ${result.collections.length} collections and ${result.cards.length} cards!`);
      
      // Set the first card as the current card for the studio
      if (result.cards.length > 0) {
        // Convert Card to CardData format
        const cardData = {
          ...result.cards[0],
          rarity: result.cards[0].metadata?.rarity || "common",
          tags: result.cards[0].metadata?.tags || [],
          design_metadata: result.cards[0].metadata || {},
          visibility: "public" as const,
          creator_attribution: {
            collaboration_type: "solo" as const
          },
          publishing_options: {
            marketplace_listing: false,
            crd_catalog_inclusion: true,
            print_available: false,
            pricing: {
              currency: "USD"
            },
            distribution: {
              limited_edition: false
            }
          }
        };
        setCurrentCard(cardData);
        toast.info('First card loaded into studio for preview');
      }
    } catch (error) {
      console.error('Failed to generate sample data:', error);
      toast.error('Failed to generate sample data. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadSampleCard = () => {
    const sampleCard = getSampleCard();
    setCurrentCard(sampleCard);
    toast.success('Sample card loaded into studio');
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="text-center">
          <Database className="w-12 h-12 mx-auto mb-4 text-crd-primary" />
          <h2 className="text-xl font-bold text-crd-text-primary mb-2">Sample Data Generator</h2>
          <p className="text-sm text-crd-text-secondary">
            Generate sample collections and cards to test the studio with
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGenerateData}
            disabled={isGenerating || !user}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Generate Sample Data
              </>
            )}
          </Button>

          <Button
            onClick={handleLoadSampleCard}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Load Sample Card Only
          </Button>
        </div>

        {!user && (
          <p className="text-xs text-amber-600 text-center">
            Please sign in to generate persistent sample data
          </p>
        )}

        <div className="text-xs text-crd-text-secondary space-y-1">
          <p><strong>Generate Sample Data:</strong> Creates 2 collections with 6 cards total in your database</p>
          <p><strong>Load Sample Card:</strong> Loads a temporary card into the studio for immediate testing</p>
        </div>
      </div>
    </Card>
  );
};
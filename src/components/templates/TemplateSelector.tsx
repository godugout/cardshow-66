import React, { useState } from 'react';
import { Template } from '@/types/template';
import { CRD_TEMPLATES, getTemplatesByCategory } from '@/data/templates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCredits } from '@/hooks/useCredits';
import { toast } from 'sonner';

interface TemplateSelectorProps {
  selectedTemplate?: string;
  onTemplateSelect: (template: Template) => void;
  userProgress: {
    cardsCreated: number;
    subscriptionTier: string;
  };
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  userProgress
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('sports');
  const { spendCredits, canAfford } = useCredits();

  const categories = [
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'fantasy', name: 'Fantasy', icon: '⚔️' },
    { id: 'scifi', name: 'Sci-Fi', icon: '🚀' },
    { id: 'vintage', name: 'Vintage', icon: '🏛️' }
  ];

  const getUnlockText = (template: Template) => {
    if (!template.unlockRequirement || template.unlockRequirement.type === 'default') {
      return 'Available';
    }
    
    if (template.unlockRequirement.type === 'cards-created') {
      return `Unlock at ${template.unlockRequirement.value} cards`;
    }
    
    if (template.unlockRequirement.type === 'subscription') {
      return `${template.unlockRequirement.value} tier required`;
    }
    
    return '';
  };

  const isTemplateUnlocked = (template: Template) => {
    if (!template.unlockRequirement || template.unlockRequirement.type === 'default') {
      return true;
    }
    
    if (template.unlockRequirement.type === 'cards-created') {
      return userProgress.cardsCreated >= (template.unlockRequirement.value as number);
    }
    
    if (template.unlockRequirement.type === 'subscription') {
      const requiredTier = template.unlockRequirement.value;
      const userTier = userProgress.subscriptionTier;
      
      if (requiredTier === 'creator') {
        return userTier === 'creator' || userTier === 'pro';
      }
      if (requiredTier === 'pro') {
        return userTier === 'pro';
      }
    }
    
    return false;
  };

  const handleTemplateSelect = async (template: Template) => {
    // Check if template is unlocked based on progression
    if (!isTemplateUnlocked(template)) {
      toast.error(`This template is locked. ${getUnlockText(template)}`);
      return;
    }
    
    // Check if template requires credits (premium templates)
    const creditCost = getTemplateCreditCost(template);
    if (creditCost > 0) {
      if (!canAfford(creditCost)) {
        toast.error(`This template costs ${creditCost} credits. You need more credits to unlock it.`);
        return;
      }
      
      // Spend credits for premium template
      const success = await spendCredits(
        creditCost,
        `Unlocked template: ${template.name}`,
        template.id,
        'template_unlock'
      );
      
      if (!success) return;
    }
    
    onTemplateSelect(template);
    toast.success(`Selected ${template.name} template`);
  };

  const getTemplateCreditCost = (template: Template): number => {
    // Premium templates cost credits
    if (template.unlockRequirement?.type === 'subscription') {
      return 150; // Premium subscription templates cost credits as alternative
    }
    return 0; // Free templates
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Choose Template</h3>
        <Badge variant="secondary">
          {userProgress.cardsCreated} cards created
        </Badge>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              <span>{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTemplatesByCategory(category.id, userProgress).map((template) => {
                const isUnlocked = isTemplateUnlocked(template);
                const isSelected = selectedTemplate === template.id;

                return (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    } ${!isUnlocked ? 'opacity-60' : ''}`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="aspect-[2.5/3.5] bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="text-4xl text-muted-foreground">🎴</div>
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Badge variant="outline">🔒 Locked</Badge>
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-primary text-primary-foreground">✓ Selected</Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">{template.name}</h4>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        
                        <div className="flex flex-wrap gap-1">
                          {template.defaultEffects.holographic && (
                            <Badge variant="secondary" className="text-xs">Holographic</Badge>
                          )}
                          {template.defaultEffects.chrome && (
                            <Badge variant="secondary" className="text-xs">Chrome</Badge>
                          )}
                          {template.defaultEffects.foil && (
                            <Badge variant="secondary" className="text-xs">Foil</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={isUnlocked ? "default" : "outline"}
                            className="text-xs"
                          >
                            {getUnlockText(template)}
                          </Badge>
                          
                          {isSelected && (
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
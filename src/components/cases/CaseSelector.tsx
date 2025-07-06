import React from 'react';
import { CardCase } from '@/types/template';
import { CARD_CASES, getAvailableCases } from '@/data/cases';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CaseSelectorProps {
  selectedCase?: string;
  onCaseSelect: (cardCase: CardCase) => void;
  userProgress: {
    cardsCreated: number;
    subscriptionTier: string;
  };
}

export const CaseSelector: React.FC<CaseSelectorProps> = ({
  selectedCase,
  onCaseSelect,
  userProgress
}) => {
  const availableCases = getAvailableCases(userProgress);
  
  const getUnlockText = (cardCase: CardCase) => {
    if (!cardCase.unlockRequirement || cardCase.unlockRequirement.type === 'default') {
      return 'Available';
    }
    
    if (cardCase.unlockRequirement.type === 'cards-created') {
      return `Unlock at ${cardCase.unlockRequirement.value} cards`;
    }
    
    if (cardCase.unlockRequirement.type === 'subscription') {
      return `${cardCase.unlockRequirement.value} tier required`;
    }
    
    return '';
  };

  const isCaseUnlocked = (cardCase: CardCase) => {
    return availableCases.some(c => c.id === cardCase.id);
  };

  const handleCaseSelect = (cardCase: CardCase) => {
    if (!isCaseUnlocked(cardCase)) {
      toast.error(`This case is locked. ${getUnlockText(cardCase)}`);
      return;
    }
    
    onCaseSelect(cardCase);
    toast.success(`Selected ${cardCase.name} case`);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Choose Protection Case</h3>
        <Badge variant="secondary">
          {userProgress.cardsCreated} cards created
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {CARD_CASES.map((cardCase) => {
          const isUnlocked = isCaseUnlocked(cardCase);
          const isSelected = selectedCase === cardCase.id;

          return (
            <Card 
              key={cardCase.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${!isUnlocked ? 'opacity-60' : ''}`}
              onClick={() => handleCaseSelect(cardCase)}
            >
              <CardContent className="p-3 space-y-2">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="text-2xl text-muted-foreground">
                    {cardCase.type === 'penny-sleeve' && '📄'}
                    {cardCase.type === 'toploader' && '🛡️'}
                    {cardCase.type === 'magnetic' && '🧲'}
                    {cardCase.type === 'graded' && '🏆'}
                    {cardCase.type === 'premium' && '💎'}
                  </div>
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Badge variant="outline" className="text-xs">🔒</Badge>
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <Badge className="bg-primary text-primary-foreground text-xs">✓</Badge>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-foreground">{cardCase.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{cardCase.description}</p>
                  
                  <Badge 
                    variant={isUnlocked ? "default" : "outline"}
                    className="text-xs w-full justify-center"
                  >
                    {getUnlockText(cardCase)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
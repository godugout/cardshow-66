import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Palette, 
  Target, 
  Zap,
  Check,
  X
} from 'lucide-react';

interface CreatorOnboardingFlowProps {
  onComplete: (preferences: CreatorPreferences) => void;
  onSkip: () => void;
}

interface CreatorPreferences {
  topics: string[];
  projectTypes: string[];
  styles: string[];
  experience: string;
}

const TOPICS = [
  { id: 'sports', name: 'Sports', icon: '⚽', description: 'Trading cards for athletes and teams' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', description: 'Character cards and game assets' },
  { id: 'art', name: 'Art', icon: '🎨', description: 'Artistic showcase cards' },
  { id: 'music', name: 'Music', icon: '🎵', description: 'Artist and album cards' },
  { id: 'business', name: 'Business', icon: '💼', description: 'Professional networking cards' },
  { id: 'collectibles', name: 'Collectibles', icon: '💎', description: 'Rare and unique items' }
];

const PROJECT_TYPES = [
  { id: 'trading', name: 'Trading Cards', description: 'Classic collectible format' },
  { id: 'business', name: 'Business Cards', description: 'Professional networking' },
  { id: 'showcase', name: 'Showcase Cards', description: 'Portfolio presentation' },
  { id: 'event', name: 'Event Cards', description: 'Tickets and invitations' }
];

const STYLES = [
  { id: 'modern', name: 'Modern', preview: '🎯' },
  { id: 'vintage', name: 'Vintage', preview: '📜' },
  { id: 'minimal', name: 'Minimal', preview: '⚪' },
  { id: 'bold', name: 'Bold', preview: '⚡' },
  { id: 'artistic', name: 'Artistic', preview: '🎨' },
  { id: 'tech', name: 'Tech', preview: '🔮' }
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', name: 'Beginner', description: 'New to card design' },
  { id: 'intermediate', name: 'Intermediate', description: 'Some design experience' },
  { id: 'advanced', name: 'Advanced', description: 'Professional designer' }
];

export const CreatorOnboardingFlow = ({ onComplete, onSkip }: CreatorOnboardingFlowProps) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<CreatorPreferences>({
    topics: [],
    projectTypes: [],
    styles: [],
    experience: ''
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleSelection = (category: keyof CreatorPreferences, value: string) => {
    if (category === 'experience') {
      setPreferences(prev => ({ ...prev, [category]: value }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter(item => item !== value)
          : [...prev[category], value]
      }));
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return preferences.topics.length > 0;
      case 2: return preferences.projectTypes.length > 0;
      case 3: return preferences.styles.length > 0;
      case 4: return preferences.experience !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">What interests you?</h2>
            <p className="text-muted-foreground mb-6">
              Select the topics you'd like to create cards for (choose multiple)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOPICS.map((topic) => (
                <Card 
                  key={topic.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    preferences.topics.includes(topic.id) 
                      ? 'ring-2 ring-crd-green bg-crd-green/5' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => toggleSelection('topics', topic.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{topic.icon}</div>
                    <h3 className="font-semibold mb-1">{topic.name}</h3>
                    <p className="text-xs text-muted-foreground">{topic.description}</p>
                    {preferences.topics.includes(topic.id) && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-crd-green" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">What will you create?</h2>
            <p className="text-muted-foreground mb-6">
              Choose the types of projects you want to work on
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROJECT_TYPES.map((type) => (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    preferences.projectTypes.includes(type.id) 
                      ? 'ring-2 ring-crd-green bg-crd-green/5' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => toggleSelection('projectTypes', type.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{type.name}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                      {preferences.projectTypes.includes(type.id) && (
                        <Check className="w-5 h-5 text-crd-green" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">What's your style?</h2>
            <p className="text-muted-foreground mb-6">
              Select design styles that appeal to you
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {STYLES.map((style) => (
                <Card 
                  key={style.id}
                  className={`cursor-pointer transition-all hover:scale-105 aspect-square ${
                    preferences.styles.includes(style.id) 
                      ? 'ring-2 ring-crd-green bg-crd-green/5' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => toggleSelection('styles', style.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                    <div className="text-4xl mb-2">{style.preview}</div>
                    <h3 className="font-semibold text-center">{style.name}</h3>
                    {preferences.styles.includes(style.id) && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-crd-green" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">Your experience level?</h2>
            <p className="text-muted-foreground mb-6">
              This helps us customize the interface complexity for you
            </p>
            <div className="space-y-4">
              {EXPERIENCE_LEVELS.map((level) => (
                <Card 
                  key={level.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    preferences.experience === level.id 
                      ? 'ring-2 ring-crd-green bg-crd-green/5' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => toggleSelection('experience', level.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{level.name}</h3>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                      {preferences.experience === level.id && (
                        <Check className="w-5 h-5 text-crd-green" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-crd-green/20 rounded-full">
              <Sparkles className="w-6 h-6 text-crd-green" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Creator Setup</h1>
              <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onSkip}>
            <X className="w-4 h-4 mr-2" />
            Skip Setup
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i + 1 <= step ? 'bg-crd-green' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-crd-green hover:bg-crd-green/90"
          >
            {step === totalSteps ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start Creating
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
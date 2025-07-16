import React, { useState } from 'react';
import { FullPageOverlay } from './FullPageOverlay';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { PSDAnalyzeStep } from './steps/PSDAnalyzeStep';
import { PSDBuildStep } from './steps/PSDBuildStep';
import { PSDReviewStep } from './steps/PSDReviewStep';

interface PSDWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file?: File;
  onFrameCreated?: (frameData: any) => void;
}

type WorkflowStep = 'analyze' | 'build' | 'review';

export const PSDWorkflowDialog = ({ 
  isOpen, 
  onClose, 
  file,
  onFrameCreated 
}: PSDWorkflowDialogProps) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('analyze');
  const [psdData, setPSDData] = useState<any>(null);
  const [layerMappings, setLayerMappings] = useState<any>({});
  const [framePreview, setFramePreview] = useState<string | null>(null);

  const steps: { id: WorkflowStep; title: string; description: string }[] = [
    { id: 'analyze', title: 'Analyze PSD', description: 'Review and process your PSD file layers' },
    { id: 'build', title: 'Build Frame', description: 'Map layers to card elements and configure the frame' },
    { id: 'review', title: 'Review & Create', description: 'Preview your frame and finalize creation' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      const nextStep = steps[currentStepIndex + 1];
      setCurrentStep(nextStep.id);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevStep = steps[currentStepIndex - 1];
      setCurrentStep(prevStep.id);
    }
  };

  const handleComplete = () => {
    if (onFrameCreated && framePreview) {
      onFrameCreated({
        preview: framePreview,
        mappings: layerMappings,
        psdData: psdData
      });
    }
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'analyze':
        return psdData !== null;
      case 'build':
        return Object.keys(layerMappings).length > 0;
      case 'review':
        return framePreview !== null;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'analyze':
        return (
          <PSDAnalyzeStep
            file={file}
            onAnalysisComplete={setPSDData}
          />
        );
      case 'build':
        return (
          <PSDBuildStep
            psdData={psdData}
            layerMappings={layerMappings}
            onMappingsChange={setLayerMappings}
          />
        );
      case 'review':
        return (
          <PSDReviewStep
            psdData={psdData}
            layerMappings={layerMappings}
            onPreviewGenerated={setFramePreview}
          />
        );
      default:
        return null;
    }
  };

  const renderActions = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${index <= currentStepIndex 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-12 h-0.5 mx-2
                ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {isLastStep ? (
          <Button
            onClick={handleComplete}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            <Check className="w-4 h-4 mr-2" />
            Create Frame
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );

  const currentStepData = steps[currentStepIndex];

  return (
    <FullPageOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={`PSD to Frame Converter - ${currentStepData.title}`}
      actions={renderActions()}
    >
      <div className="h-full flex flex-col">
        {/* Step Header */}
        <div className="border-b border-border p-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {currentStepData.title}
          </h2>
          <p className="text-muted-foreground mt-1">
            {currentStepData.description}
          </p>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          {renderStepContent()}
        </div>
      </div>
    </FullPageOverlay>
  );
};
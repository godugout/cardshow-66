
import React from 'react';
import { ProfessionalStudioWorkspace } from '@/components/studio/ProfessionalStudioWorkspace';
import { AdvancedStudioProvider } from '@/contexts/AdvancedStudioContext';

const StudioPage: React.FC = () => {
  return (
    <AdvancedStudioProvider>
      <ProfessionalStudioWorkspace mode="pro" preset="animation-studio" />
    </AdvancedStudioProvider>
  );
};

export default StudioPage;

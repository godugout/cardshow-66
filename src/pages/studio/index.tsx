
import React from 'react';
import { ProfessionalStudioWorkspace } from '@/components/studio/ProfessionalStudioWorkspace';
import { AdvancedStudioProvider } from '@/contexts/AdvancedStudioContext';
import CRDAssistantToolbar from '@/components/CRDAssistantToolbar';

const StudioPage: React.FC = () => {
  return (
    <AdvancedStudioProvider>
      <ProfessionalStudioWorkspace mode="pro" preset="animation-studio" />
      {process.env.NODE_ENV === 'development' && <CRDAssistantToolbar />}
    </AdvancedStudioProvider>
  );
};

export default StudioPage;

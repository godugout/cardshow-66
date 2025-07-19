
// Legacy component - replaced by StudioPropertiesPanel
import { StudioPropertiesPanel as NewStudioPropertiesPanel } from './properties/StudioPropertiesPanel';

interface StudioPropertiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudioPropertiesPanel: React.FC<StudioPropertiesPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return <NewStudioPropertiesPanel />;
};

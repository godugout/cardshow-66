
// Core Design System Components
export { CRDButton, buttonVariants, type ButtonProps } from './Button';
export { 
  CRDCard, 
  CRDCardHeader, 
  CRDCardTitle, 
  CRDCardDescription, 
  CRDCardContent, 
  CRDCardFooter,
  cardVariants, 
  type CardProps 
} from './Card';
export { CRDInput, inputVariants, type InputProps } from './Input';
export { CRDModal, modalVariants, modalContentVariants, type ModalProps } from './Modal';
export { 
  CRDSkeleton, 
  CRDSkeletonText, 
  CRDSkeletonAvatar, 
  CRDSkeletonCard,
  skeletonVariants, 
  type SkeletonProps 
} from './Skeleton';

// Enhanced Design System Components Export
export { designTokens } from './tokens';
export type { DesignTokens } from './tokens';
export { ComponentSpecs, ComponentUsageExamples } from './ComponentSpecs';
export { InteractiveExamples } from './InteractiveExamples';

// Atoms
export { UniversalButton } from './atoms/UniversalButton';
export { UniversalInput } from './atoms/UniversalInput';
export { UniversalCard } from './atoms/UniversalCard';
export { UniversalBadge } from './atoms/UniversalBadge';

// Molecules
export { UniversalNavItem } from './molecules/UniversalNavItem';

// Organisms
export { UniversalNavbar } from './organisms/UniversalNavbar';

// Templates
export { UniversalPageLayout } from './templates/UniversalPageLayout';

// Main Design Guide
export { default as CRDDesignGuide } from './CRDDesignGuide';

// Legacy exports for backward compatibility
export { Typography, Heading, AccentText } from './Typography';
export { colors } from './colors';
export type { 
  BrandColor, 
  InterfaceColor, 
  TextColor, 
  StatusColor, 
  MarketplaceColor,
  NeutralColor, 
  ColorKey 
} from './colors';
export { PSDCard } from './PSDCard';
export { PSDButton } from './PSDButton';
export { psdTokens } from './psd-tokens';
export type { LayerCategoryType } from './psd-tokens';

// Re-export utility functions
export { cn } from '@/lib/utils';

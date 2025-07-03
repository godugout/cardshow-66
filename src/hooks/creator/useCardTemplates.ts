import { useState } from 'react';
import { toast } from 'sonner';

export interface CardTemplate {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  tags: string[];
  template_data: any;
  preview_images: string[];
  sales_count: number;
  revenue_generated: number;
  rating_average: number;
  rating_count: number;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
}

export const useCardTemplates = () => {
  const [publicTemplates] = useState<CardTemplate[]>([]);
  const [myTemplates] = useState<CardTemplate[]>([]);

  const createTemplate = {
    mutate: () => {},
    mutateAsync: async () => ({ id: 'mock-template-id' }),
    isPending: false,
  };

  const updateTemplate = {
    mutate: () => {},
    mutateAsync: async () => ({ id: 'mock-template-id' }),
    isPending: false,
  };

  const purchaseTemplate = {
    mutate: () => {},
    mutateAsync: async () => ({ id: 'mock-template-id' }),
    isPending: false,
  };

  return {
    publicTemplates,
    myTemplates,
    isLoading: false,
    createTemplate,
    updateTemplate,
    purchaseTemplate,
  };
};
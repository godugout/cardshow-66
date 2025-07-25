
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Team } from '@/types/team';

export const useTeams = () => {
  const { 
    data: teams = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['teams'],
    queryFn: async (): Promise<Team[]> => {
      // Teams table doesn't exist in current schema, return empty array
      console.warn('Teams table not implemented in current schema');
      return [];
        
    }
  });

  const getTeamById = (id: string): Team | null => {
    return teams.find(team => team.id === id) || null;
  };

  return {
    teams,
    isLoading,
    error,
    getTeamById
  };
};

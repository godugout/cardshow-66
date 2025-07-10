
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Team } from '@/types/team';

export const useTeams = () => {
  // Teams feature not implemented yet - return empty data
  const teams: Team[] = [];
  const isLoading = false;
  const error = null;

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

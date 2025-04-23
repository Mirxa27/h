import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Property } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface RecommendationFilters {
  location?: string;
  budget?: number;
  guests?: number;
  amenities?: string[];
  dateRange?: { from: string; to: string };
}

interface PropertyWithScore extends Property {
  score?: number;
  explanation?: string;
  matchedCriteria?: string[];
}

interface RecommendationsResponse {
  success?: boolean;
  recommendations: {
    recommendations: PropertyWithScore[];
    summary?: string;
  };
  properties: Property[];
  error?: string;
  message?: string;
}

type RecommendationsResult = {
  recommendations: PropertyWithScore[];
  properties: Property[];
  summary: string;
  isLoading: boolean;
  error: Error | null;
  updateFilters: (newFilters: Partial<RecommendationFilters>) => void;
  getRecommendations: () => Promise<any>;
  activeFilters: RecommendationFilters;
};

export function usePropertyRecommendations(filters: RecommendationFilters = {}): RecommendationsResult {
  const [activeFilters, setActiveFilters] = useState<RecommendationFilters>(filters);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['property-recommendations', activeFilters],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/ai/recommendations', activeFilters);
      if (!response.ok) {
        throw new Error('Failed to fetch property recommendations');
      }
      return response.json() as Promise<RecommendationsResponse>;
    },
    enabled: false // Don't fetch automatically on mount
  });
  
  const updateFilters = (newFilters: Partial<RecommendationFilters>) => {
    setActiveFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  const getRecommendations = () => {
    return refetch();
  };
  
  return {
    recommendations: data?.recommendations?.recommendations || [],
    properties: data?.properties || [],
    summary: data?.recommendations?.summary || '',
    isLoading,
    error,
    updateFilters,
    getRecommendations,
    activeFilters
  };
}
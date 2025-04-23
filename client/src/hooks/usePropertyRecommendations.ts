import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: number;
  title: string;
  price: number;
  [key: string]: any;
}

interface PropertyRecommendation {
  id: number;
  score: number;
  explanation: string;
  matchedCriteria: string[];
  [key: string]: any;
}

interface RecommendationRequest {
  location?: string;
  budget?: number;
  guests?: number;
  amenities?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
}

interface RecommendationResponse {
  success: boolean;
  recommendations: {
    recommendations: PropertyRecommendation[];
    summary: string;
  };
  properties: Property[];
}

/**
 * Hook for fetching AI-powered property recommendations based on user preferences
 * Includes improved error handling, validation, and retry logic
 */
export function usePropertyRecommendations() {
  const { toast } = useToast();

  return useMutation<RecommendationResponse, Error, RecommendationRequest>({
    mutationFn: async (variables) => {
      try {
        // Validate inputs - ensure at least one search criteria is provided
        if (!variables.location && !variables.budget && !variables.guests && 
           (!variables.amenities || variables.amenities.length === 0)) {
          throw new Error('Please provide at least one search criteria (location, budget, guests, or amenities)');
        }

        // Validate date range if provided
        if (variables.dateRange) {
          const { from, to } = variables.dateRange;
          
          if (!from || !to) {
            throw new Error('If providing a date range, both start and end dates are required');
          }
          
          const fromDate = new Date(from);
          const toDate = new Date(to);
          
          if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            throw new Error('Invalid date format. Please use YYYY-MM-DD format');
          }
          
          if (fromDate >= toDate) {
            throw new Error('Check-out date must be after check-in date');
          }
        }

        // Make the API request
        const response = await apiRequest('POST', '/api/ai/recommendations', variables);
        
        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
          throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }
        
        // Parse and validate the response
        const data = await response.json();
        
        if (!data.success || !data.recommendations) {
          throw new Error('Invalid response format from recommendations API');
        }
        
        return data;
      } catch (error: any) {
        // Log error for debugging
        console.error('Property recommendations error:', error);
        
        // Show user-friendly error message
        toast({
          title: 'Recommendation error',
          description: error.message || 'Failed to get property recommendations',
          variant: 'destructive',
        });
        
        // Re-throw to update mutation state
        throw error;
      }
    },
    // Add retry logic for transient errors
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
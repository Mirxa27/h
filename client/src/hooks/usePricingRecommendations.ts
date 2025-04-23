import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: number;
  title: string;
  price: number;
  [key: string]: any;
}

interface MarketData {
  avgPrice: number;
  highSeason: boolean;
  [key: string]: any;
}

interface PricingRecommendation {
  propertyId: number;
  recommendedPrice: number;
  reasoning: any;
}

interface PricingResponse {
  success: boolean;
  recommendations: PricingRecommendation;
}

export function usePricingRecommendations(propertyId) {
  return useQuery(["pricing-recommendations", propertyId], async () => {
    const response = await apiRequest("GET", `/api/pricing-recommendations/${propertyId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch pricing recommendations");
    }
    return response.json();
  });
}

export function usePricingRecommendationsMutation() {
  const { toast } = useToast();

  return useMutation<PricingResponse, Error, { property: Property; market: MarketData }>({
    mutationFn: async (variables) => {
      try {
        // Validate input
        if (!variables.property || !variables.property.id || !variables.property.price) {
          throw new Error('Property information is incomplete. Please provide at least id and price.');
        }

        // Make the API request
        const response = await apiRequest('POST', '/api/ai/pricing', variables);
        
        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
          throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }
        
        // Parse the response
        const data = await response.json();
        
        // Validate the response format
        if (!data.success || !data.recommendations) {
          throw new Error('Invalid response format from pricing API');
        }
        
        return data;
      } catch (error: any) {
        // Log error for debugging
        console.error('Pricing API error:', error);
        
        // Show toast notification with user-friendly message
        toast({
          title: 'Pricing recommendation error',
          description: error.message || 'Failed to get pricing recommendations',
          variant: 'destructive',
        });
        
        // Re-throw for the mutation error state
        throw error;
      }
    },
    // Add retry logic
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
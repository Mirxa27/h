import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Property, Review } from '@shared/schema';

export const useProperties = (filters?: Record<string, any>) => {
  let queryString = '';
  
  if (filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    queryString = `?${params.toString()}`;
  }

  return useQuery<Property[]>({
    queryKey: [`/api/properties${queryString}`],
  });
};

export const useProperty = (id: number) => {
  const queryClient = useQueryClient();
  
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id,
  });
  
  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/properties/${id}/reviews`],
    enabled: !!id,
  });
  
  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/wishlist/toggle`, { propertyId: id });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
    },
  });
  
  const isInWishlist = async (): Promise<{ isInWishlist: boolean }> => {
    const response = await apiRequest('GET', `/api/wishlist/check/${id}`);
    return response.json();
  };

  return {
    property,
    isLoading,
    error,
    reviews,
    toggleWishlist: () => toggleWishlistMutation.mutateAsync(),
    isWishlistLoading: toggleWishlistMutation.isPending,
    isInWishlist,
  };
};

// Mutation hook for creating a new property
export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyData: Omit<Property, 'id' | 'createdAt'>) => {
      const response = await apiRequest('POST', '/api/properties', propertyData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create property');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries that fetch lists of properties to include the new one
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      // Potentially invalidate user data if host status changes
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] }); 
    },
  });
};

export const useNearbyProperties = (latitude: number, longitude: number, distance: number = 10) => {
  return useQuery<Property[]>({
    queryKey: [`/api/properties/nearby?lat=${latitude}&lng=${longitude}&distance=${distance}`],
    enabled: !!latitude && !!longitude,
  });
};

export const useRecommendedProperties = (userId?: number, preferences?: string[]) => {
  const queryParams = new URLSearchParams();
  
  if (userId) {
    queryParams.append('userId', userId.toString());
  }
  
  if (preferences && preferences.length) {
    queryParams.append('preferences', preferences.join(','));
  }
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return useQuery<Property[]>({
    queryKey: [`/api/properties/recommended${queryString}`],
    enabled: !!userId || (preferences && preferences.length > 0),
  });
};

export function useAvailabilityManagement(propertyId) {
  return useQuery(["availability-management", propertyId], async () => {
    const response = await apiRequest("GET", `/api/availability-management/${propertyId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch availability settings");
    }
    return response.json();
  });
}

export function useUpdateAvailability() {
  return useMutation(async (data) => {
    const response = await apiRequest("POST", "/api/availability-management/update", data);
    if (!response.ok) {
      throw new Error("Failed to update availability settings");
    }
    return response.json();
  });
}

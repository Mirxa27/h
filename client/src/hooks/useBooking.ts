import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Booking, InsertBooking } from "@shared/schema";

// Main hook for fetching and managing bookings
export function useBookings() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading, error } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Create a new booking
  const createBookingMutation = useMutation({
    mutationFn: async (newBooking: InsertBooking) => {
      const response = await apiRequest("POST", "/api/bookings", newBooking);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
  });

  // Update an existing booking
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Booking> }) => {
      const response = await apiRequest("PUT", `/api/bookings/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
  });

  return {
    bookings,
    isLoading,
    error,
    createBooking: createBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
    updateBooking: updateBookingMutation.mutate,
    isUpdating: updateBookingMutation.isPending,
  };
}

// Hook for managing bookings for a specific property
export function usePropertyBookings(propertyId: number) {
  return useQuery<Booking[]>({
    queryKey: [`/api/properties/${propertyId}/bookings`],
    enabled: propertyId > 0,
  });
}

// Hook for a single booking
export function useBooking(bookingId?: number) {
  const queryClient = useQueryClient();
  
  // Get a single booking by ID
  const { data: booking, isLoading, error } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
    enabled: !!bookingId,
  });

  // Create a new booking (for use in BookingModal)
  const createBookingMutation = useMutation({
    mutationFn: async (newBooking: Partial<InsertBooking>) => {
      const response = await apiRequest("POST", "/api/bookings", newBooking);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
  });

  // Update an existing booking
  const updateBookingMutation = useMutation({
    mutationFn: async (data: Partial<Booking>) => {
      if (!bookingId) throw new Error("Booking ID is required");
      const response = await apiRequest("PUT", `/api/bookings/${bookingId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/${bookingId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
  });

  return {
    booking,
    isLoading,
    error,
    createBooking: createBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
    updateBooking: updateBookingMutation.mutate,
    isUpdating: updateBookingMutation.isPending,
  };
}

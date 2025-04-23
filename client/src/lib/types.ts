import { Property, Booking, Review, Message, User, Wishlist } from "@shared/schema";

// Type for filtered properties search
export interface PropertyFilters {
  type?: string;
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minGuests?: number;
  amenities?: string[];
  search?: string;
  minRating?: number;
}

// Type for property with reviews and host information
export interface PropertyWithDetails extends Property {
  host?: User;
  reviews?: Review[];
  averageRating?: number;
}

// Type for conversation with user info
export interface Conversation {
  user: User;
  lastMessage: Message;
}

// Type for wishlist item with property details
export interface WishlistItem {
  wishlist: Wishlist;
  property: Property;
}

// Type for login credentials
export interface LoginCredentials {
  username: string;
  password: string;
}

// Type for registration data
export interface RegistrationData {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

// Type for booking with property details
export interface BookingWithProperty extends Booking {
  property: Property;
}

// Type for review with user details
export interface ReviewWithUser extends Review {
  guest: User;
}

// Currency symbols
export const SAR_SYMBOL = 'ر.س'; // Saudi Riyal

// Date formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DATE_DISPLAY_FORMAT = 'MMM dd, yyyy';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Booking statuses
export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// AI assistant options
export const ASSISTANT_TYPES = {
  BOOKING: 'booking',
  HOSTING: 'hosting',
  CUSTOMER_SERVICE: 'customer_service',
};

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  MADA: 'mada',
  APPLE_PAY: 'apple_pay',
};

// Property types
export const PROPERTY_TYPES = [
  'apartment',
  'house',
  'villa',
  'condominium',
  'studio',
  'chalet',
];

// Common amenities
export const AMENITIES = [
  'wifi',
  'airConditioning',
  'kitchen',
  'washer',
  'dryer',
  'tv',
  'pool',
  'parking',
  'elevator',
  'gym',
];

// App routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  PROPERTY: '/property/:id',
  PROPERTY_DETAILS: (id: number | string) => `/property/${id}`,
  DASHBOARD: '/dashboard',
  WISHLIST: '/wishlist',
  MESSAGES: '/messages',
  BECOME_HOST: '/become-host',
  BOOKING_SUCCESS: '/booking-success',
  BOOKING_ERROR: '/booking-error',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    USER: '/api/auth/user',
  },
  PROPERTIES: {
    LIST: '/api/properties',
    DETAILS: (id: number | string) => `/api/properties/${id}`,
    HOST: '/api/properties/host',
    CREATE: '/api/properties',
    UPDATE: (id: number | string) => `/api/properties/${id}`,
    DELETE: (id: number | string) => `/api/properties/${id}`,
  },
  BOOKINGS: {
    LIST: '/api/bookings',
    DETAILS: (id: number | string) => `/api/bookings/${id}`,
    CREATE: '/api/bookings',
    UPDATE: (id: number | string) => `/api/bookings/${id}`,
    CANCEL: (id: number | string) => `/api/bookings/${id}/cancel`,
  },
  REVIEWS: {
    LIST: '/api/reviews',
    PROPERTY: (id: number | string) => `/api/reviews/property/${id}`,
    CREATE: '/api/reviews',
  },
  PAYMENTS: {
    CREATE: '/api/payments/create',
    STATUS: (id: string) => `/api/payments/status/${id}`,
    EXECUTE: (id: string) => `/api/payments/execute/${id}`,
  },
  MESSAGES: {
    LIST: '/api/messages',
    CONVERSATION: (userId: number | string) => `/api/messages/conversation/${userId}`,
    SEND: '/api/messages',
    READ: (id: number | string) => `/api/messages/${id}/read`,
  },
  WISHLIST: {
    LIST: '/api/wishlist',
    ADD: '/api/wishlist',
    REMOVE: (id: number | string) => `/api/wishlist/${id}`,
    CHECK: (propertyId: number | string) => `/api/wishlist/check/${propertyId}`,
  },
  AI: {
    CHAT: '/api/ai/assistant/chat',
    RECOMMENDATIONS: '/api/ai/recommendations',
    PRICING: '/api/ai/pricing',
  },
};
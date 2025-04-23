import { apiRequest } from '@/lib/queryClient';

interface PaymentInitiationParams {
  bookingDetails: {
    propertyId: number;
    checkIn: string;
    checkOut: string;
    guests: number;
    amount: number;
    nights: number;
  };
  userId: number;
  customerName: string;
  customerEmail: string;
  paymentMethodId?: number; // MyFatoorah payment method ID
}

export async function initiateMyFatoorahPayment(params: PaymentInitiationParams) {
  try {
    const response = await apiRequest('POST', '/api/payments/initiate-myfatoorah', params);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initiate payment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Payment initiation error:', error);
    throw error;
  }
}

export async function initiatePayPalPayment(params: PaymentInitiationParams) {
  try {
    const response = await apiRequest('POST', '/api/payments/initiate-paypal', params);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initiate PayPal payment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('PayPal payment initiation error:', error);
    throw error;
  }
}

export async function verifyPaymentStatus(paymentId: string, paymentMethod: 'myfatoorah' | 'paypal') {
  try {
    const endpoint = paymentMethod === 'myfatoorah' 
      ? `/api/payments/verify-myfatoorah/${paymentId}`
      : `/api/payments/verify-paypal/${paymentId}`;
      
    const response = await apiRequest('GET', endpoint);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify payment status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
}

export function getCurrencyByRegion(countryCode: string): string {
  // Middle East countries
  const middleEastCountries = ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'];
  
  // Return appropriate currency code based on country
  if (middleEastCountries.includes(countryCode)) {
    return countryCode === 'AE' ? 'AED' : countryCode === 'SA' ? 'SAR' : 'USD';
  }
  
  // Default to USD for other regions
  return 'USD';
}
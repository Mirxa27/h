import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, Home, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { SAR_SYMBOL } from "@/lib/constants";

interface PendingBooking {
  propertyId: number;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  paymentId: string;
}

export default function BookingSuccess() {
  const [, navigate] = useLocation();
  const [bookingDetails, setBookingDetails] = useState<PendingBooking | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

  useEffect(() => {
    // Retrieve booking details from session storage
    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking) {
      const booking = JSON.parse(storedBooking);
      setBookingDetails(booking);
      
      // Get payment status
      const fetchPaymentStatus = async () => {
        try {
          const response = await apiRequest("GET", `/api/payments/${booking.paymentId}/status`);
          if (response.ok) {
            const data = await response.json();
            setPaymentStatus(data);
          }
        } catch (error) {
          console.error("Error fetching payment status:", error);
        }
      };
      
      fetchPaymentStatus();
    }
  }, []);

  const handleViewBookings = () => {
    navigate("/profile");
    
    // Clear the pending booking from session storage
    sessionStorage.removeItem('pendingBooking');
  };

  return (
    <div className="container max-w-3xl py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          <CardDescription>
            Thank you for booking with Habibistay
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {bookingDetails && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-lg">{bookingDetails.propertyTitle}</h3>
                
                <div className="mt-4 space-y-3">
                  <div className="flex">
                    <Calendar className="h-5 w-5 mr-3 text-slate-500" />
                    <div>
                      <div className="font-medium">Check-in</div>
                      <div className="text-slate-500">
                        {format(new Date(bookingDetails.checkIn), "EEEE, MMMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <Calendar className="h-5 w-5 mr-3 text-slate-500" />
                    <div>
                      <div className="font-medium">Check-out</div>
                      <div className="text-slate-500">
                        {format(new Date(bookingDetails.checkOut), "EEEE, MMMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <CreditCard className="h-5 w-5 mr-3 text-slate-500" />
                    <div>
                      <div className="font-medium">Payment</div>
                      <div className="text-slate-500">
                        {paymentStatus ? (
                          <>
                            {paymentStatus.status === "Paid" ? (
                              <span className="text-green-600 font-medium">
                                Paid: {paymentStatus.currencySymbol || SAR_SYMBOL} {paymentStatus.invoiceValue.toFixed(2)}
                              </span>
                            ) : (
                              <span>
                                {paymentStatus.status}: {paymentStatus.currencySymbol || SAR_SYMBOL} {paymentStatus.invoiceValue.toFixed(2)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span>{SAR_SYMBOL} {bookingDetails.amount.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                    <span>You'll receive a confirmation email with all booking details.</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                    <span>The property owner will be notified of your booking.</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                    <span>You can view all your booking details in your profile.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="sm:w-auto w-full"
          >
            <Home className="mr-2 h-4 w-4" /> Back to Home
          </Button>
          <Button 
            onClick={handleViewBookings}
            className="sm:w-auto w-full"
          >
            View My Bookings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
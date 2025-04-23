import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Home, CalendarX } from "lucide-react";

interface PendingBooking {
  propertyId: number;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  paymentId: string;
}

export default function BookingError() {
  const [, navigate] = useLocation();
  const [bookingDetails, setBookingDetails] = useState<PendingBooking | null>(null);

  useEffect(() => {
    // Retrieve booking details from session storage
    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking) {
      setBookingDetails(JSON.parse(storedBooking));
    }
  }, []);

  const handleTryAgain = () => {
    // If we have booking details, navigate back to the property page
    if (bookingDetails) {
      navigate(`/property/${bookingDetails.propertyId}`);
    } else {
      navigate("/");
    }
    
    // Clear the pending booking from session storage
    sessionStorage.removeItem('pendingBooking');
  };

  return (
    <div className="container max-w-3xl py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Booking Not Completed</CardTitle>
          <CardDescription>
            We couldn't complete your booking at this time
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-center">
                <CalendarX className="h-12 w-12 text-slate-400 mr-4" />
                <div>
                  <h3 className="font-semibold text-lg">Payment Not Processed</h3>
                  <p className="text-slate-500">
                    {bookingDetails ? (
                      <>Your payment for {bookingDetails.propertyTitle} was not completed.</>
                    ) : (
                      <>Your payment was not completed.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium mb-2">Possible reasons:</h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                  <span>The payment was canceled or declined</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                  <span>There was an issue with the payment gateway</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                  <span>The booking is no longer available for the selected dates</span>
                </li>
              </ul>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium mb-2">What you can do:</h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                  <span>Try booking again with a different payment method</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                  <span>Check if your payment card has sufficient funds</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                  <span>Contact our support team for assistance</span>
                </li>
              </ul>
            </div>
          </div>
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
            onClick={handleTryAgain}
            className="sm:w-auto w-full"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
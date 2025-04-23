import { useState, useEffect } from "react";
import { useProperty } from "@/hooks/useProperty";
import { useBooking } from "@/hooks/useBooking";
import { useAuth } from "@/hooks/useAuth";
import { format, addDays, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Property } from "@shared/schema";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: number | null;
}

export default function BookingModal({ open, onClose, propertyId }: BookingModalProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { property, isLoading } = useProperty(propertyId || 0);
  const { createBooking } = useBooking();

  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 5));
  const [guests, setGuests] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens with a new property
  useEffect(() => {
    if (open && propertyId) {
      setCheckIn(new Date());
      setCheckOut(addDays(new Date(), 5));
      setGuests(2);
    }
  }, [open, propertyId]);

  if (!open || !propertyId) return null;

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book a property",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!property) return;

    // Client-side validation
    if (!checkIn || !checkOut) {
      toast({
        title: "Validation Error",
        description: "Please select both check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    if (checkIn >= checkOut) {
      toast({
        title: "Validation Error",
        description: "Check-out date must be after check-in date.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison
    if (checkIn < today) {
      toast({
        title: "Validation Error",
        description: "Check-in date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    if (guests <= 0) {
      toast({
        title: "Validation Error",
        description: "Number of guests must be at least 1.",
        variant: "destructive",
      });
      return;
    }

    if (guests > property.maxGuests) {
      toast({
        title: "Validation Error",
        description: `Number of guests cannot exceed the property's maximum capacity of ${property.maxGuests}.`,
        variant: "destructive",
      });
      return;
    }


    setIsSubmitting(true);

    try {
      const nights = differenceInDays(checkOut, checkIn);
      const totalPrice = property.price * nights + (property.cleaningFee || 0) + (property.serviceFee || 0);

      await createBooking({
        propertyId: property.id,
        checkIn,
        checkOut,
        totalPrice,
        numGuests: guests,
        status: "pending",
      });

      toast({
        title: "Booking successful!",
        description: "Your booking has been confirmed.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!property) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Property not found</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const nights = differenceInDays(checkOut, checkIn);
  const subtotal = property.price * nights;
  const total = subtotal + (property.cleaningFee || 0) + (property.serviceFee || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Book your stay</DialogTitle>
          <DialogDescription>
            {property.title}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium mb-4">{property.title}</h4>
              <div className="flex items-center mb-4">
                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="font-medium">4.92</span>
                <span className="text-slate-400 ml-1">(128 reviews)</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>${property.price} × {nights} nights</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>${property.cleaningFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${property.serviceFee || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold pt-2">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Dates</label>
                <Calendar
                  mode="range"
                  selected={{
                    from: checkIn,
                    to: checkOut,
                  }}
                  onSelect={(range) => {
                    if (range?.from) {
                      setCheckIn(range.from);
                    }
                    if (range?.to) {
                      setCheckOut(range.to);
                    }
                  }}
                  className="rounded-md border"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Guests</label>
                <Select
                  value={guests.toString()}
                  onValueChange={(value) => setGuests(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'guest' : 'guests'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Confirm Booking"}
              </Button>

              <p className="text-xs text-slate-500 text-center mt-3">
                You won't be charged yet. You'll pay your host directly.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";

export default function AIBookingAssistant() {
  const [prompt, setPrompt] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [bookings, setBookings] = useState([]);

  // Fetch existing bookings for context
  const { data: bookingsData, isLoading } = useQuery(["ai-bookings"], async () => {
    const response = await apiRequest("GET", "/api/bookings");
    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }
    return response.json();
  });

  useEffect(() => {
    if (bookingsData) {
      setBookings(bookingsData);
    }
  }, [bookingsData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || processing) return;

    setProcessing(true);
    try {
      const response = await apiRequest("POST", "/api/ai/booking-assistant", {
        prompt,
        context: { bookings },
      });

      if (!response.ok) {
        throw new Error("Failed to process request");
      }

      const data = await response.json();
      setResult(data);
      
      // If there was a booking action (create/modify/cancel), refresh the bookings list
      if (data.action && (data.action === "create" || data.action === "modify" || data.action === "cancel")) {
        const newBookingsResponse = await apiRequest("GET", "/api/bookings");
        if (newBookingsResponse.ok) {
          const newBookings = await newBookingsResponse.json();
          setBookings(newBookings);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">AI Booking Assistant</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>What would you like to do?</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder="E.g., 'Book a 3-night stay at Luxury Beachfront Villa starting next Friday for 2 adults and 1 child' or 'Cancel my reservation at Mountain Retreat'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="h-32"
                />
                <Button type="submit" disabled={processing || !prompt.trim()}>
                  {processing ? "Processing..." : "Process Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="mt-4 p-4 border rounded">Loading bookings...</div>
          ) : (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Your Bookings</h2>
              {bookings.length > 0 ? (
                <div className="space-y-2">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded p-3">
                      <div className="font-medium">{booking.property.title}</div>
                      <div className="text-sm text-slate-500">
                        {new Date(booking.checkIn).toLocaleDateString()} to{" "}
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </div>
                      <div className="text-sm">Guests: {booking.numGuests}</div>
                      <div className="text-sm">Status: {booking.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500">No bookings found</div>
              )}
            </div>
          )}
        </div>

        <div>
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {result.action === "create"
                    ? "Booking Created"
                    : result.action === "modify"
                    ? "Booking Modified"
                    : result.action === "cancel"
                    ? "Booking Cancelled"
                    : "Results"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose">
                  <p>{result.message}</p>
                  {result.details && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="text-base font-medium">Details</h3>
                      {result.details.propertyName && (
                        <p>
                          <strong>Property:</strong> {result.details.propertyName}
                        </p>
                      )}
                      {result.details.checkIn && (
                        <p>
                          <strong>Check-in:</strong>{" "}
                          {new Date(result.details.checkIn).toLocaleDateString()}
                        </p>
                      )}
                      {result.details.checkOut && (
                        <p>
                          <strong>Check-out:</strong>{" "}
                          {new Date(result.details.checkOut).toLocaleDateString()}
                        </p>
                      )}
                      {result.details.guests && (
                        <p>
                          <strong>Guests:</strong> {result.details.guests}
                        </p>
                      )}
                      {result.details.price && (
                        <p>
                          <strong>Total Price:</strong> ${result.details.price}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBooking";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Calendar, Home, Bell, Settings, Star } from "lucide-react";
import React from "react";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { user, updateUser, isLoading } = useAuth();
  const { bookings } = useBookings();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  if (!user) {
    navigate("/login");
    return null;
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      bio: user.bio || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateUser(data);
      toast({
        description: "Your profile has been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update profile.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.profileImage} alt={user.fullName} />
                  <AvatarFallback>{user.fullName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-1">{user.fullName}</h2>
                <p className="text-sm text-slate-500 mb-3">{user.email}</p>
                {user.isHost && <Badge className="mb-4">Host</Badge>}
                <Button className="w-full" variant="outline">
                  Edit Photo
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="flex flex-col space-y-1">
                <Button variant="ghost" className="justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Personal Info
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Bookings
                </Button>
                {user.isHost && (
                  <Button variant="ghost" className="justify-start" onClick={() => navigate("/dashboard")}>
                    <Home className="mr-2 h-4 w-4" />
                    Hosting Dashboard
                  </Button>
                )}
                <Button variant="ghost" className="justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="reviews">My Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about yourself"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>
                    View and manage your upcoming and past bookings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings && bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="border rounded-lg p-4 transition-shadow hover:shadow-md"
                        >
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold">
                                Booking #{booking.id}
                              </h3>
                              <p className="text-sm text-slate-500">
                                {format(new Date(booking.checkIn), "MMM dd, yyyy")} -{" "}
                                {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                              </p>
                            </div>
                            <Badge
                              className={
                                booking.status === "confirmed"
                                  ? "bg-green-500"
                                  : booking.status === "pending"
                                  ? "bg-yellow-500"
                                  : booking.status === "cancelled"
                                  ? "bg-red-500"
                                  : "bg-slate-500"
                              }
                            >
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                            </Badge>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-sm">
                                <strong>Guests:</strong> {booking.numGuests}
                              </p>
                              <p className="text-sm">
                                <strong>Total:</strong> ${booking.totalPrice}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium mb-1">No bookings yet</h3>
                      <p className="text-slate-500 mb-4">
                        You haven't made any bookings yet.
                      </p>
                      <Button onClick={() => navigate("/")}>
                        Find a place to stay
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Reviews</CardTitle>
                  <CardDescription>
                    Reviews you've left for properties you've stayed at.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
                    <p className="text-slate-500 mb-4">
                      You haven't left any reviews yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{user.isHost ? "Host Profile" : "Guest Profile"}</h1>
      <p className="mt-2">Welcome, {user.name}!</p>

      {user.isHost ? (
        <div>
          <h2 className="text-xl font-semibold mt-4">Your Listings</h2>
          <p>Manage your properties and bookings here.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mt-4">Your Bookings</h2>
          <p>View and manage your upcoming stays here.</p>
        </div>
      )}
    </div>
  );
}

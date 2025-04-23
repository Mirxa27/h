import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useProperty } from '@/hooks/useProperty';
import { useAuth } from '@/hooks/useAuth';
import { Star, Heart, Share, MapPin, Calendar, Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface PropertyDetailsProps {
  openBookingModal?: (propertyId: number) => void;
}

export default function PropertyDetails({ openBookingModal }: PropertyDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const { property, isLoading, reviews, toggleWishlist, isInWishlist } = useProperty(parseInt(id));
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [, navigate] = useLocation();

  // Load wishlist status when component mounts
  useState(() => {
    const checkWishlistStatus = async () => {
      if (user) {
        const status = await isInWishlist();
        if (status) {
          setIsWishlisted(status.isInWishlist);
        }
      }
    };

    checkWishlistStatus();
  });

  const handleWishlistClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const result = await toggleWishlist();
    if (result) {
      setIsWishlisted(result.isInWishlist);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-center">Property not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Property Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
        <div className="flex flex-wrap justify-between items-center mt-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="font-medium">4.92</span>
              <span className="text-slate-400 ml-1">({reviews?.length || 0} reviews)</span>
            </div>
            <span>•</span>
            <span className="flex items-center">
              <MapPin className="h-4 w-4 text-slate-400 mr-1" />
              {property.city}, {property.country}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <button className="flex items-center text-slate-700 hover:text-primary">
              <Share className="h-4 w-4 mr-1" />
              <span className="text-sm">Share</span>
            </button>
            <button
              className="flex items-center text-slate-700 hover:text-primary"
              onClick={handleWishlistClick}
            >
              <Heart className={`h-4 w-4 mr-1 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-sm">Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Property Images */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl overflow-hidden">
        <div className="md:col-span-1 h-64 md:h-96">
          <img
            src={property.images?.[0] || "https://via.placeholder.com/500x300?text=No+Image"}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(index => (
            <div key={index} className="h-[11.25rem]">
              <img
                src={property.images?.[index] || "https://via.placeholder.com/200x150?text=No+Image"}
                alt={`${property.title} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Property Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Property Description */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-1">{property.type} hosted by Host Name</h2>
                <p className="text-slate-600">
                  {property.maxGuests} guests • {property.bedrooms} bedrooms • {property.bathrooms} baths
                </p>
              </div>
              <Avatar className="h-12 w-12">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Host" />
                <AvatarFallback>HN</AvatarFallback>
              </Avatar>
            </div>
            <Separator className="my-6" />
            <p className="text-slate-700 whitespace-pre-line">{property.description}</p>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
            <div className="grid grid-cols-2 gap-4">
              {property.amenities?.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs for Reviews, Location, etc. */}
          <Tabs defaultValue="reviews" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="host">Host</TabsTrigger>
            </TabsList>
            <TabsContent value="reviews" className="mt-4">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="font-medium text-lg">4.92 · {reviews?.length || 0} reviews</span>
                </div>

                {reviews && reviews.length > 0 ? (
                  reviews.map((review: any, index: number) => (
                    <div key={index} className="border-b border-slate-200 pb-6 last:border-0">
                      <div className="flex items-center gap-4 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{review.guestId.toString().substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Guest {review.guestId}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No reviews yet.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="location" className="mt-4">
              <div className="rounded-xl overflow-hidden h-80">
                <div className="bg-slate-200 w-full h-full relative">
                  <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/55.2708,25.2048,13,0/1200x900?access_token=pk.eyJ1IjoiZXhhbXBsZXRva2VuIiwiYSI6ImV4YW1wbGV0b2tlbiJ9.example')] bg-cover">
                    <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      <div className="bg-primary text-white shadow-md rounded-full px-3 py-2 text-sm font-medium">
                        ${property.price}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-lg mb-2">Area Information</h3>
                <p className="text-slate-700">
                  {property.address}, {property.city}, {property.state}, {property.country}
                  {property.zipCode ? `, ${property.zipCode}` : ''}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="host" className="mt-4">
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Host" />
                  <AvatarFallback>HN</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">Hosted by Host Name</h3>
                  <p className="text-slate-500">Host since January 2020</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>4.98 · 128 reviews</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                Professional host dedicated to providing excellent stays and experiences for all guests.
              </p>
              <Button>Message Host</Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-36">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xl font-semibold">${property.price}</span>
                  <span className="text-slate-500"> night</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="font-medium">4.92</span>
                  <span className="text-slate-400 ml-1">({reviews?.length || 0})</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                <div className="flex border-b">
                  <div className="flex-1 p-3 border-r">
                    <div className="text-xs text-slate-500">CHECK-IN</div>
                    <div>Add date</div>
                  </div>
                  <div className="flex-1 p-3">
                    <div className="text-xs text-slate-500">CHECKOUT</div>
                    <div>Add date</div>
                  </div>
                </div>
                <div className="p-3 border-b">
                  <div className="text-xs text-slate-500">GUESTS</div>
                  <div className="flex justify-between items-center">
                    <div>1 guest</div>
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mb-4"
                onClick={() => openBookingModal && openBookingModal(property.id)}
              >
                Reserve
              </Button>

              <p className="text-center text-sm text-slate-500 mb-6">You won't be charged yet</p>

              {/* Price calculation will be shown in the booking modal */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

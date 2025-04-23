import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Heart, MapPin, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { WishlistItem } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

export default function Wishlist() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: wishlistItems, isLoading, refetch } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlists"],
    enabled: !!user,
  });

  const handleRemoveFromWishlist = async (wishlistId: number) => {
    try {
      await apiRequest("DELETE", `/api/wishlists/${wishlistId}`);
      refetch();
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const handleViewProperty = (propertyId: number) => {
    navigate(`/property/${propertyId}`);
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Wishlist</h1>
          <p className="text-slate-500">
            Manage your saved properties and dream destinations
          </p>
        </div>
        <Button onClick={() => navigate("/")}>Explore Properties</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : wishlistItems && wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.wishlist.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <img
                  src={item.property.images?.[0] || "https://via.placeholder.com/500x300?text=No+Image"}
                  alt={item.property.title}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white rounded-full h-8 w-8 p-0 hover:bg-slate-100"
                  onClick={() => handleRemoveFromWishlist(item.wishlist.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-slate-500 text-sm">{item.property.type} in {item.property.city}</p>
                    <h3 className="font-semibold truncate">{item.property.title}</h3>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm">4.92</span>
                  </div>
                </div>
                <div className="text-slate-600 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {item.property.city}, {item.property.country}
                  </div>
                  <p className="mt-1">
                    {item.property.bedrooms} bedrooms • {item.property.bathrooms} baths
                  </p>
                </div>
                <p className="font-semibold mt-2">${item.property.price} <span className="font-normal text-slate-500 text-sm">night</span></p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full"
                  onClick={() => handleViewProperty(item.property.id)}
                >
                  View Property
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-lg">
          <Heart className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Save properties you're interested in by clicking the heart icon when browsing listings.
          </p>
          <Button onClick={() => navigate("/")}>Discover Places to Stay</Button>
        </div>
      )}
    </div>
  );
}

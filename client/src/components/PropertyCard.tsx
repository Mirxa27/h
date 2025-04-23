import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Heart } from "lucide-react";
import { Property } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useProperty } from "@/hooks/useProperty";
import { SAR_SYMBOL } from "@/lib/constants";

interface PropertyCardProps {
  property: Property;
  openBookingModal: (propertyId: number) => void;
}

export default function PropertyCard({ property, openBookingModal }: PropertyCardProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useProperty(property.id);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate("/login");
      return;
    }
    
    const result = await toggleWishlist();
    if (result) {
      setIsWishlisted(result.isInWishlist);
    }
  };

  // Load wishlist status when component mounts
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user) {
        const status = await isInWishlist();
        if (status) {
          setIsWishlisted(status.isInWishlist);
        }
      }
    };
    
    checkWishlistStatus();
  }, [user, isInWishlist]);

  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-2/5">
          <img 
            src={property.images?.[0] || "https://via.placeholder.com/500x300?text=No+Image"}
            alt={property.title}
            className="h-64 md:h-full w-full object-cover"
          />
          <button 
            className={`absolute top-4 right-4 ${isWishlisted ? 'text-red-500' : 'text-primary'} bg-white rounded-full p-2 shadow hover:bg-slate-100`}
            onClick={handleWishlistClick}
          >
            <Heart className={isWishlisted ? 'fill-current' : ''} />
          </button>
        </div>
        <div className="p-5 flex flex-col justify-between md:w-3/5">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm mb-1">{property.type} in {property.city}</p>
                <h2 className="text-xl font-semibold mb-2">{property.title}</h2>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="font-medium">4.92</span>
                <span className="text-slate-400 ml-1">(128)</span>
              </div>
            </div>
            <div className="text-slate-600 text-sm mb-4">
              <span>{property.maxGuests} guests</span> • <span>{property.bedrooms} bedrooms</span> • <span>{property.bathrooms} baths</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {property.amenities?.slice(0, 4).map((amenity, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-slate-100 rounded-full">{amenity}</span>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-sm text-slate-500">Exceptional value</div>
              <div className="text-lg font-semibold">{SAR_SYMBOL} {property.price} <span className="text-slate-500 font-normal text-sm">night</span></div>
            </div>
            <button 
              onClick={() => navigate(`/property/${property.id}`)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              View details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

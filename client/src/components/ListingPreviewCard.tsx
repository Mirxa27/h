import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Users, BedDouble, Bath } from 'lucide-react';
import { PropertyFormValues } from './ListingWizard'; // Assuming type is exported

interface ListingPreviewCardProps {
  formData: Partial<PropertyFormValues>; // Use partial as form might be incomplete
}

const ListingPreviewCard: React.FC<ListingPreviewCardProps> = ({ formData }) => {
  const {
    title = "Your Listing Title",
    type = "Property Type",
    price = 0,
    images = [],
    bedrooms = 1,
    bathrooms = 1,
    maxGuests = 2,
    city = "City",
    country = "Country",
    amenities = [],
  } = formData;

  const displayPrice = price > 0 ? `$${price.toFixed(2)}` : '$--.--';
  const displayLocation = city && country ? `${city}, ${country}` : 'Location';
  const mainImage = images && images.length > 0 ? images[0] : 'https://via.placeholder.com/400x300.png?text=Upload+Photo';

  return (
    <Card className="w-full sticky top-24 shadow-md">
      <CardHeader className="p-0">
        <img
          src={mainImage}
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div>
          <Badge variant="secondary" className="mb-2">{type || 'Type'}</Badge>
          <CardTitle className="text-lg font-semibold leading-tight truncate">
            {title || 'Listing Title'}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {displayLocation}
          </CardDescription>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{maxGuests} guests</span>
          </div>
          <div className="flex items-center gap-1">
            <BedDouble className="w-4 h-4" />
            <span>{bedrooms} {bedrooms === 0 ? 'Studio' : 'bed'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{bathrooms} bath</span>
          </div>
        </div>

        {amenities && amenities.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-1">
              {amenities.slice(0, 5).map((amenity) => ( // Show limited amenities
                <Badge key={amenity} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {amenities.length > 5 && <Badge variant="outline" className="text-xs">...</Badge>}
            </div>
          </div>
        )}

        <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-lg font-bold text-primary">{displayPrice}</span>
          <span className="text-sm text-muted-foreground">/ night</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingPreviewCard;

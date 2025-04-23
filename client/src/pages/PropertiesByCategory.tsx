import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useProperties } from '@/hooks/useProperty';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Filter } from 'lucide-react';

export default function PropertiesByCategory() {
  const params = useParams<{ category: string }>();
  const [, navigate] = useLocation();
  const { data: allProperties, isLoading } = useProperties();
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState("recommended");

  // Format category from URL param (e.g., "luxury-villas" to "Luxury Villas")
  const formatCategory = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryName = formatCategory(params.category);

  // Filter properties by category
  useEffect(() => {
    if (!allProperties) return;

    let filtered = [...allProperties];

    // Apply category filtering
    switch (params.category.toLowerCase()) {
      case 'luxury-villas':
        filtered = filtered.filter(p => p.type === 'villa' && p.price >= 1000);
        break;
      case 'beachfront-properties':
        filtered = filtered.filter(p => p.description?.toLowerCase().includes('beach') || p.amenities?.includes('beachfront'));
        break;
      case 'city-apartments':
        filtered = filtered.filter(p => p.type === 'apartment' && (p.city?.toLowerCase().includes('riyadh') || p.city?.toLowerCase().includes('jeddah')));
        break;
      case 'traditional-homes':
        filtered = filtered.filter(p => p.description?.toLowerCase().includes('traditional') || p.amenities?.includes('traditional'));
        break;
      case 'penthouses':
        filtered = filtered.filter(p => p.type === 'penthouse' || p.description?.toLowerCase().includes('penthouse'));
        break;
      case 'desert-retreats':
        filtered = filtered.filter(p => p.description?.toLowerCase().includes('desert') || p.amenities?.includes('desert view'));
        break;
      case 'family-friendly':
        filtered = filtered.filter(p => p.maxGuests >= 4 && (p.amenities?.includes('kid friendly') || p.amenities?.includes('family')));
        break;
      case 'business-travel':
        filtered = filtered.filter(p => p.amenities?.includes('workspace') || p.amenities?.includes('wifi') || p.description?.toLowerCase().includes('business'));
        break;
      default:
        // If category doesn't match any predefined filters, try to match by type
        filtered = filtered.filter(p => 
          p.type?.toLowerCase() === params.category.toLowerCase() ||
          p.description?.toLowerCase().includes(params.category.toLowerCase())
        );
    }

    // Apply sorting
    const sorted = sortProperties(filtered, sortOrder);
    setFilteredProperties(sorted);
  }, [params.category, allProperties, sortOrder]);

  // Sort properties
  const sortProperties = (properties: any[], order: string) => {
    const propertiesCopy = [...properties];

    switch (order) {
      case "price_low":
        return propertiesCopy.sort((a, b) => a.price - b.price);
      case "price_high":
        return propertiesCopy.sort((a, b) => b.price - a.price);
      case "rating":
        return propertiesCopy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "recommended":
      default:
        // For recommended, we could have a more complex algorithm
        // For now, just return in original order or by rating if available
        return propertiesCopy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0 flex items-center hover:bg-transparent"
        onClick={() => navigate('/properties')}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to All Properties
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{categoryName}</h1>
          <p className="text-muted-foreground mt-1">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} available
          </p>
        </div>

        <div className="flex items-center mt-4 md:mt-0">
          <Select 
            value={sortOrder} 
            onValueChange={setSortOrder}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="ml-2" onClick={() => navigate('/properties')}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <Separator className="mb-8" />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-muted h-80 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              openBookingModal={() => {}} // Placeholder function
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No properties found in this category</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We couldn't find any properties matching this category. Try browsing all properties or check back later.
          </p>
          <Button onClick={() => navigate('/properties')}>View All Properties</Button>
        </div>
      )}
    </div>
  );
}
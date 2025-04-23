import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useProperties } from '@/hooks/useProperty';
import { SAR_SYMBOL } from '@/lib/constants';
import {
  Bath,
  BedDouble,
  Calendar,
  Car,
  Coffee,
  Dumbbell,
  Home,
  MapPin,
  PawPrint,
  Radio,
  Search,
  Snowflake,
  Users,
  Waves,
  Wifi
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Properties() {
  // Get properties from the API
  const { data: allProperties, isLoading } = useProperties();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    priceRange: [0, 5000], // Default price range in SAR
    propertyType: 'any',
    bedrooms: 0,
    bathrooms: 0,
    amenities: [] as string[]
  });

  // Update filtered properties when search parameters or all properties change
  useEffect(() => {
    if (!allProperties) return;

    let filtered = [...allProperties];

    // Filter by location
    if (searchParams.location) {
      const location = searchParams.location.toLowerCase();
      filtered = filtered.filter(p =>
        (p.city && p.city.toLowerCase().includes(location)) ||
        (p.address && p.address.toLowerCase().includes(location)) ||
        (p.country && p.country.toLowerCase().includes(location))
      );
    }

    // Filter by guests
    if (searchParams.guests > 1) {
      filtered = filtered.filter(p => p.maxGuests >= searchParams.guests);
    }

    // Filter by price range
    filtered = filtered.filter(p =>
      p.price >= searchParams.priceRange[0] &&
      p.price <= searchParams.priceRange[1]
    );

    // Filter by property type
    if (searchParams.propertyType && searchParams.propertyType !== 'any') {
      filtered = filtered.filter(p => p.type === searchParams.propertyType);
    }

    // Filter by bedrooms
    if (searchParams.bedrooms > 0) {
      filtered = filtered.filter(p => p.bedrooms >= searchParams.bedrooms);
    }

    // Filter by bathrooms
    if (searchParams.bathrooms > 0) {
      filtered = filtered.filter(p => p.bathrooms >= searchParams.bathrooms);
    }

    // Filter by amenities
    if (searchParams.amenities.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.amenities) return false;
        return searchParams.amenities.every(amenity =>
          p.amenities?.includes(amenity) || false
        );
      });
    }

    setFilteredProperties(filtered);
  }, [searchParams, allProperties]);

  const handleSearch = () => {
    // No need to do anything here as the useEffect will handle filtering
    // This is just to provide a user action for the search button
    console.log('Searching with params:', searchParams);
  };

  const handleAmenityToggle = (amenity: string) => {
    setSearchParams(prev => {
      const amenities = [...prev.amenities];
      if (amenities.includes(amenity)) {
        return { ...prev, amenities: amenities.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...amenities, amenity] };
      }
    });
  };

  const amenitiesList = [
    { name: 'WiFi', value: 'wifi', icon: <Wifi className="h-4 w-4" /> },
    { name: 'Parking', value: 'parking', icon: <Car className="h-4 w-4" /> },
    { name: 'Pool', value: 'pool', icon: <Waves className="h-4 w-4" /> },
    { name: 'Kitchen', value: 'kitchen', icon: <Coffee className="h-4 w-4" /> },
    { name: 'Air Conditioning', value: 'ac', icon: <Snowflake className="h-4 w-4" /> },
    { name: 'TV', value: 'tv', icon: <Radio className="h-4 w-4" /> },
    { name: 'Pet Friendly', value: 'pets_allowed', icon: <PawPrint className="h-4 w-4" /> },
    { name: 'Gym', value: 'gym', icon: <Dumbbell className="h-4 w-4" /> }
  ];

  const propertyTypes = [
    { name: 'Any Type', value: 'any' },
    { name: 'Apartment', value: 'apartment' },
    { name: 'Villa', value: 'villa' },
    { name: 'House', value: 'house' },
    { name: 'Studio', value: 'studio' },
    { name: 'Chalet', value: 'chalet' }
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Find Your Perfect Stay</h1>

      {/* Search Filters Section */}
      <div className="bg-muted p-6 rounded-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Location
            </label>
            <div className="relative">
              <Input
                placeholder="City or address"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                className="pl-8"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Check In - Check Out
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={searchParams.checkIn}
                onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
              />
              <Input
                type="date"
                value={searchParams.checkOut}
                onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1">
              <Users className="h-4 w-4" /> Guests
            </label>
            <Select
              value={searchParams.guests.toString()}
              onValueChange={(value) => setSearchParams({ ...searchParams, guests: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select guests" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'guest' : 'guests'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1">
              <Home className="h-4 w-4" /> Property Type
            </label>
            <Select
              value={searchParams.propertyType}
              onValueChange={(value) => setSearchParams({ ...searchParams, propertyType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Price Range (SAR)</label>
              <span>
                {SAR_SYMBOL}{searchParams.priceRange[0]} - {SAR_SYMBOL}{searchParams.priceRange[1]}
              </span>
            </div>
            <Slider
              defaultValue={searchParams.priceRange}
              min={0}
              max={10000}
              step={100}
              onValueChange={(value) => setSearchParams({ ...searchParams, priceRange: value as [number, number] })}
              className="py-4"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 flex items-center gap-1">
                <BedDouble className="h-4 w-4" /> Bedrooms
              </label>
              <Select
                value={searchParams.bedrooms.toString()}
                onValueChange={(value) => setSearchParams({ ...searchParams, bedrooms: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}+
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 flex items-center gap-1">
                <Bath className="h-4 w-4" /> Bathrooms
              </label>
              <Select
                value={searchParams.bathrooms.toString()}
                onValueChange={(value) => setSearchParams({ ...searchParams, bathrooms: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}+
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Amenities</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amenitiesList.map((amenity) => (
              <div key={amenity.value} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.value}
                  checked={searchParams.amenities.includes(amenity.value)}
                  onCheckedChange={() => handleAmenityToggle(amenity.value)}
                />
                <label
                  htmlFor={amenity.value}
                  className="text-sm flex items-center gap-1 cursor-pointer"
                >
                  {amenity.icon} {amenity.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full sm:w-auto" onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>

      {/* Properties Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Available
          </h2>
          <Select defaultValue="recommended">
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
        </div>

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
                openBookingModal={() => { }} // Placeholder function
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No properties match your search criteria</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search for a different location</p>
            <Button
              variant="outline"
              onClick={() => setSearchParams({
                location: '',
                checkIn: '',
                checkOut: '',
                guests: 1,
                priceRange: [0, 5000],
                propertyType: 'any',
                bedrooms: 0,
                bathrooms: 0,
                amenities: []
              })}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

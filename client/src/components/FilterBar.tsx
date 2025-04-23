import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Home,
  Building,
  Umbrella,
  Mountain,
  Leaf,
  Tent,
  Sun,
  Droplet,
  ChevronDown,
  Sliders,
} from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: Record<string, any>) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [price, setPrice] = useState([0, 1000]);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);

  const propertyTypes = [
    { icon: <Home className="text-2xl mb-1" />, name: 'Houses' },
    { icon: <Building className="text-2xl mb-1" />, name: 'Apartments' },
    { icon: <Umbrella className="text-2xl mb-1" />, name: 'Beach' },
    { icon: <Mountain className="text-2xl mb-1" />, name: 'Mountain' },
    { icon: <Leaf className="text-2xl mb-1" />, name: 'Countryside' },
    { icon: <Tent className="text-2xl mb-1" />, name: 'Camping' },
    { icon: <Sun className="text-2xl mb-1" />, name: 'Tropical' },
    { icon: <Droplet className="text-2xl mb-1" />, name: 'Lake' },
  ];

  const availableAmenities = [
    'Pool',
    'Gym',
    'Free parking',
    'Wi-Fi',
    'Kitchen',
    'Air conditioning',
    'Washing machine',
    'TV',
    'BBQ',
  ];

  const handlePropertyTypeClick = (type: string) => {
    onFilterChange({ type });
  };

  const handlePriceChange = (values: number[]) => {
    setPrice(values);
    onFilterChange({ minPrice: values[0], maxPrice: values[1] });
  };

  const handleBedroomsChange = (value: number) => {
    setBedrooms(value);
    onFilterChange({ bedrooms: value });
  };

  const handleBathroomsChange = (value: number) => {
    setBathrooms(value);
    onFilterChange({ bathrooms: value });
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const updatedAmenities = checked
      ? [...amenities, amenity]
      : amenities.filter((a) => a !== amenity);
    
    setAmenities(updatedAmenities);
    onFilterChange({ amenities: updatedAmenities });
  };

  return (
    <div className="border-b bg-white sticky top-16 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Property Type Filters */}
        <div className="flex overflow-x-auto space-x-8 pb-2 no-scrollbar">
          {propertyTypes.map((type) => (
            <button
              key={type.name}
              className="flex flex-col items-center min-w-[64px] text-sm text-slate-800 opacity-70 hover:opacity-100 focus:outline-none"
              onClick={() => handlePropertyTypeClick(type.name)}
            >
              {type.icon}
              <span>{type.name}</span>
            </button>
          ))}
        </div>
        
        {/* Additional Filters */}
        <div className="flex justify-between items-center pt-3 border-t mt-3">
          <div className="flex space-x-2 overflow-x-auto">
            {/* Price Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="px-4 py-2 text-sm font-medium rounded-full border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                >
                  Price <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Price range</h4>
                  <Slider
                    defaultValue={[0, 1000]}
                    max={1000}
                    step={10}
                    onValueChange={handlePriceChange}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      ${price[0]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${price[1]}
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Rooms Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="px-4 py-2 text-sm font-medium rounded-full border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                >
                  Rooms <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Bedrooms</h4>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4, 5].map((num) => (
                        <Button
                          key={num}
                          variant={bedrooms === num ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => handleBedroomsChange(num)}
                        >
                          {num === 0 ? 'Studio' : num}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Bathrooms</h4>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Button
                          key={num}
                          variant={bathrooms === num ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => handleBathroomsChange(num)}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Amenities Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="px-4 py-2 text-sm font-medium rounded-full border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                >
                  Amenities <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Amenities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={amenities.includes(amenity)}
                          onCheckedChange={(checked) => 
                            handleAmenityChange(amenity, checked as boolean)
                          }
                        />
                        <Label htmlFor={amenity}>{amenity}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Rating Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="hidden sm:block px-4 py-2 text-sm font-medium rounded-full border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                >
                  Rating <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Minimum Rating</h4>
                  <div className="flex gap-2">
                    {[3, 3.5, 4, 4.5, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant="outline"
                        className="flex-1"
                        onClick={() => onFilterChange({ minRating: rating })}
                      >
                        {rating}+
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* All Filters Button */}
          <Button
            variant="outline"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-full border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
          >
            <Sliders className="mr-2 h-4 w-4" /> All filters
          </Button>
        </div>
      </div>
    </div>
  );
}

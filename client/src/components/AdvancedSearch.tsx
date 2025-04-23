import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function AdvancedSearch() {
  const [filters, setFilters] = useState({
    priceRange: "",
    propertyType: "",
    amenities: [],
  });

  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Advanced Search</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Price Range</label>
          <Input
            placeholder="e.g. $50 - $200"
            value={filters.priceRange}
            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Property Type</label>
          <Select
            onValueChange={(value) => handleFilterChange("propertyType", value)}
            defaultValue={filters.propertyType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="House">House</SelectItem>
              <SelectItem value="Villa">Villa</SelectItem>
              <SelectItem value="Studio">Studio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amenities</label>
          <Input
            placeholder="e.g. Pool, Wi-Fi"
            value={filters.amenities.join(", ")}
            onChange={(e) =>
              handleFilterChange("amenities", e.target.value.split(", "))
            }
          />
        </div>
      </div>

      <Button className="mb-6">Search</Button>

      <div className="h-96">
        <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          <Marker position={mapCenter}>
            <Popup>Your selected location</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
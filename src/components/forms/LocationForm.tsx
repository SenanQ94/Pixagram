import React, { useState } from "react";
import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ILocation } from "@/types";

const LocationForm = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("germany");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);

  const position = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);

        // Fetch city/location based on latitude and longitude using OSM Nominatim
        const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
        try {
          const response = await axios.get(apiUrl);
          const town = response.data.address?.town;
          const county = response.data.address?.county;
          const state = response.data.address?.state;
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      },
      (err) => console.log(err)
    );
  };

  const handleSearch = async (value: string) => {
    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${value}&format=json&addressdetails=1`;
    try {
      const response = await axios.get(apiUrl);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    }
  };

  const handleSelectLocation = (selectedLocation: ILocation) => {
    setSearchTerm(selectedLocation.display_name);
    setSelectedLocation(selectedLocation);

    // Extract specific information
    const countryName = selectedLocation.address?.country;
    const countryCode = selectedLocation.address?.country_code;

    console.log("Country Name:", countryName);
    console.log("Country Code:", countryCode);
  };

  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button onClick={position} className="Filter">
        Filter
      </button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className=" w-full justify-between"
          >
            {searchTerm}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-dark-4 w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search location..."
              onValueChange={(value) => {
                setSearchTerm(value);
                handleSearch(value);
              }}
              className="bg-dark-4 text-light p-2 w-full"
            />
            <CommandEmpty className="text-light">
              No location found.
            </CommandEmpty>
            <CommandGroup>
              {searchResults.map((location: any) => (
                <CommandItem
                  key={location.place_id}
                  value={location.display_name}
                  onSelect={() => {
                    handleSelectLocation(location);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between p-2 hover:bg-dark-3"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 bg-dark-4",
                      searchTerm === location.display_name
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span className="flex-shrink-0 overflow-hidden whitespace-nowrap overflow-ellipsis">
                    {location.display_name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationForm;

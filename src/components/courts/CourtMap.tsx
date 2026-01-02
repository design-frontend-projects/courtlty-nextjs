"use client";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
  Autocomplete,
} from "@react-google-maps/api";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Search, Crosshair } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "1rem",
};

// Define libraries array outside component to prevent re-renders
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [
  "places",
];

interface CourtMapProps {
  address?: string;
  defaultLocation?: { lat: number; lng: number };
  isInteractive?: boolean;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

export function CourtMap({
  address,
  defaultLocation,
  isInteractive = false,
  onLocationSelect,
}: CourtMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [courtLocation, setCourtLocation] = useState<
    { lat: number; lng: number } | undefined
  >(defaultLocation);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Update court location when props change
  useEffect(() => {
    if (defaultLocation) {
      // eslint-disable-next-line
      setCourtLocation((prev) => {
        if (
          prev &&
          prev.lat === defaultLocation.lat &&
          prev.lng === defaultLocation.lng
        ) {
          return prev;
        }
        return defaultLocation;
      });
    }
  }, [defaultLocation]);

  // Geocode address ONLY if not interactive and no default location provided
  useEffect(() => {
    if (isLoaded && address && !courtLocation && !isInteractive) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const loc = results[0].geometry.location;
          setCourtLocation({ lat: loc.lat(), lng: loc.lng() });
        } else {
          console.error("Geocode failed: " + status);
        }
      });
    }
  }, [isLoaded, address, courtLocation, isInteractive]);

  // Wrap calculateRoute in useCallback to stabilize its reference
  const calculateRoute = useCallback(
    (destination: { lat: number; lng: number }) => {
      if (!userLocation || !isLoaded) return;

      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
            if (result?.routes[0]?.legs[0]?.distance?.text) {
              setDistance(result.routes[0].legs[0].distance.text);
              setDuration(result.routes[0].legs[0].duration?.text || "");
            }
          } else {
            console.error(`error fetching directions ${status}`);
          }
        }
      );
    },
    [userLocation, isLoaded]
  );

  // Calculate route automatically when viewing detail page (not interactive)
  useEffect(() => {
    if (userLocation && courtLocation && isLoaded && !isInteractive) {
      calculateRoute(courtLocation);
    }
  }, [userLocation, courtLocation, isLoaded, isInteractive, calculateRoute]);

  // Get User Location
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          map?.panTo(loc);
          map?.setZoom(15);
          // If interactive, update selection too
          if (isInteractive) {
            setCourtLocation(loc);
            if (onLocationSelect) {
              onLocationSelect(loc);
            }
          }
        },
        (error) => {
          console.error("Error getting location", error);
          toast.error("Could not get your location.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const loc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setCourtLocation(loc);
        map?.panTo(loc);
        map?.setZoom(17);
        if (onLocationSelect) {
          onLocationSelect(loc);
        }
      } else {
        toast.error("No location details available for this place.");
      }
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!isInteractive || !e.latLng) return;
    const loc = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setCourtLocation(loc);
    if (onLocationSelect) {
      onLocationSelect(loc);
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!isInteractive || !e.latLng) return;
    const loc = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setCourtLocation(loc);
    if (onLocationSelect) {
      onLocationSelect(loc);
    }
  };

  if (!isLoaded)
    return (
      <div className="h-[400px] bg-muted animate-pulse rounded-xl flex items-center justify-center">
        Loading Map...
      </div>
    );

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-[400px] bg-muted/20 rounded-xl flex items-center justify-center border-2 border-dashed">
        <p className="text-muted-foreground">
          Google Maps API Key not configured.
        </p>
      </div>
    );
  }

  // If not interactive and no location found yet, hide
  if (!isInteractive && !courtLocation && !address) return null;

  return (
    <div className="space-y-4">
      {/* Header / Search Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {isInteractive ? "Select Location" : "Location & Directions"}
          </h3>
          {!isInteractive && distance && (
            <div className="flex gap-4 text-sm font-medium bg-secondary/50 px-3 py-1 rounded-full">
              <span>{distance}</span>
              <span>•</span>
              <span>{duration} drive</span>
            </div>
          )}
        </div>

        {isInteractive && (
          <div className="flex gap-2">
            <div className="relative w-full">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={onPlaceChanged}
              >
                <Input
                  placeholder="Search for a place..."
                  className="pl-9 bg-white dark:bg-gray-800"
                />
              </Autocomplete>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleMyLocation}
              title="Current Location"
            >
              <Crosshair className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={
          courtLocation || userLocation || { lat: 34.020882, lng: -6.84165 }
        } // Default to Rabat/Casablanca area or user loc
        zoom={courtLocation ? 15 : 12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {courtLocation && (
          <Marker
            position={courtLocation}
            title="Court Location"
            draggable={isInteractive}
            onDragEnd={handleMarkerDragEnd}
            animation={
              isInteractive && !courtLocation
                ? google.maps.Animation.DROP
                : undefined
            }
          />
        )}
        {userLocation && (
          <Marker
            position={userLocation}
            label="You"
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            }}
          />
        )}
        {!isInteractive && directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#3b82f6",
                strokeWeight: 5,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Footer Actions */}
      {!isInteractive && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            if (courtLocation) {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${courtLocation.lat},${courtLocation.lng}`,
                "_blank"
              );
            }
          }}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Open in Google Maps
        </Button>
      )}

      {isInteractive && courtLocation && (
        <div className="text-xs text-muted-foreground text-center">
          Latitude: {courtLocation.lat.toFixed(6)}, Longitude:{" "}
          {courtLocation.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}

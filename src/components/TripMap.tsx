import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Place {
  city: string;
  place_name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  lat?: number;
  lng?: number;
}

interface TripMapProps {
  places: Place[];
  selectedPlaces: string[];
  onPlaceClick?: (placeName: string) => void;
}

const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  andaman: { lat: 11.6234, lng: 92.7265 },
  manali: { lat: 32.2396, lng: 77.1887 },
  chikmagalur: { lat: 13.3161, lng: 75.7720 },
  bihar: { lat: 25.0961, lng: 85.3131 },
};

const placeOffsets: Record<string, Array<{ lat: number; lng: number }>> = {
  andaman: [
    { lat: 0.1, lng: 0.05 },
    { lat: -0.1, lng: 0.05 },
    { lat: 0.05, lng: -0.1 },
    { lat: -0.05, lng: -0.1 },
    { lat: 0.15, lng: -0.05 },
  ],
  manali: [
    { lat: 0.08, lng: 0.06 },
    { lat: -0.08, lng: 0.06 },
    { lat: 0.06, lng: -0.08 },
    { lat: -0.06, lng: -0.08 },
    { lat: 0.12, lng: -0.04 },
  ],
  chikmagalur: [
    { lat: 0.1, lng: 0.08 },
    { lat: -0.1, lng: 0.08 },
    { lat: 0.08, lng: -0.1 },
    { lat: -0.08, lng: -0.1 },
    { lat: 0.15, lng: -0.05 },
    { lat: -0.15, lng: 0.05 },
    { lat: 0.05, lng: 0.15 },
  ],
  bihar: [
    { lat: 0.2, lng: 0.15 },
    { lat: -0.2, lng: 0.15 },
    { lat: 0.15, lng: -0.2 },
    { lat: -0.15, lng: -0.2 },
  ],
};

function MapBounds({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length > 0) {
      const bounds = L.latLngBounds(
        places.map((place) => [place.lat || 0, place.lng || 0])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places, map]);

  return null;
}

export function TripMap({ places, selectedPlaces, onPlaceClick }: TripMapProps) {
  const placesWithCoords = places.map((place, index) => {
    const cityKey = place.city.toLowerCase();
    const cityCenter = cityCoordinates[cityKey] || { lat: 0, lng: 0 };
    const offsets = placeOffsets[cityKey] || [];
    const offset = offsets[index % offsets.length] || { lat: 0, lng: 0 };

    return {
      ...place,
      lat: cityCenter.lat + offset.lat,
      lng: cityCenter.lng + offset.lng,
    };
  });

  const selectedIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const unselectedIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const defaultCenter: [number, number] = placesWithCoords[0]
    ? [placesWithCoords[0].lat || 0, placesWithCoords[0].lng || 0]
    : [20.5937, 78.9629];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={10}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds places={placesWithCoords} />
      {placesWithCoords.map((place) => {
        const isSelected = selectedPlaces.includes(place.place_name);
        return (
          <Marker
            key={place.place_name}
            position={[place.lat || 0, place.lng || 0]}
            icon={isSelected ? selectedIcon : unselectedIcon}
            eventHandlers={{
              click: () => onPlaceClick?.(place.place_name),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-base mb-2">{place.place_name}</h3>
                <p className="text-xs text-gray-600 mb-2">{place.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{place.category}</span>
                  <span className="text-xs text-yellow-600">★ {place.rating}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

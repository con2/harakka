import { MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import type { CartItem } from "@/types/cart";

interface LocationGroup {
  locationInfo: {
    id: string;
    name: string;
    address: string;
    cityName: string;
    fullLocationName: string;
  };
  items: CartItem[];
}

interface LocationAnalysis {
  sameCity: boolean;
  cityName: string | null;
}

interface MultipleLocationsProps {
  itemsByLocation: LocationGroup[];
  locationAnalysis: LocationAnalysis;
  hasMultipleLocations: boolean;
}

export default function MultipleLocations({
  itemsByLocation,
  locationAnalysis,
  hasMultipleLocations,
}: MultipleLocationsProps) {
  const { lang } = useLanguage();

  if (!hasMultipleLocations) return null;

  return (
    <div
      className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6"
      data-cy="cart-multiple-locations-notice"
    >
      <h4 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        {locationAnalysis.sameCity && locationAnalysis.cityName
          ? t.multipleLocations.sameCityMultipleLocations[lang]
              .replace("{count}", itemsByLocation.length.toString())
              .replace("{city}", locationAnalysis.cityName)
          : t.multipleLocations.differentLocations[lang]}
      </h4>
      <p className="text-blue-700 text-sm mb-3">
        {locationAnalysis.sameCity
          ? t.multipleLocations.sameCityPickupInfo[lang]
          : t.multipleLocations.pickupInfo[lang]}
      </p>

      {/* Only show location list if items are in different cities */}
      {!locationAnalysis.sameCity && (
        <ul className="space-y-2">
          {(() => {
            // Group by city name for display when items are in different cities
            const cityGroups = new Map<
              string,
              { count: number; addresses: string[] }
            >();

            itemsByLocation.forEach((locationGroup) => {
              const cityName = locationGroup.locationInfo.cityName;
              const address = locationGroup.locationInfo.address;

              if (!cityGroups.has(cityName)) {
                cityGroups.set(cityName, { count: 0, addresses: [] });
              }

              const cityGroup = cityGroups.get(cityName)!;
              cityGroup.count += locationGroup.items.length;
              if (address && !cityGroup.addresses.includes(address)) {
                cityGroup.addresses.push(address);
              }
            });

            return Array.from(cityGroups.entries()).map(
              ([cityName, group], index) => (
                <li
                  key={cityName}
                  className="text-blue-800 font-medium"
                  data-cy={`cart-location-item-${index}`}
                >
                  {cityName}{" "}
                  <span className="text-blue-600 font-normal">
                    ({group.count}{" "}
                    {group.count === 1
                      ? t.multipleLocations.itemCountSingular[lang]
                      : t.multipleLocations.itemCount[lang]}
                    )
                  </span>
                  {group.addresses.length > 0 && (
                    <div className="text-xs text-gray-600 font-normal ml-2">
                      {group.addresses.join(", ")}
                    </div>
                  )}
                </li>
              ),
            );
          })()}
        </ul>
      )}
    </div>
  );
}

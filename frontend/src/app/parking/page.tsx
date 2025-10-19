type Amenity = "EV charging" | "Covered" | "Security" | "24/7" | "Valet";

interface Parking {
  id: string;
  name: string;
  address: string;
  city: string;
  pricePerHour: number; // USD
  distanceMeters: number; // from search point
  rating: number; // 0..5
  amenities: Amenity[];
  maxHeightMeters?: number;
}

const DEMO: Parking[] = [
  {
    id: "p1",
    name: "Downtown Center Garage",
    address: "123 Main St",
    city: "Los Angeles, CA",
    pricePerHour: 4.5,
    distanceMeters: 220,
    rating: 4.4,
    amenities: ["Covered", "Security", "24/7"],
    maxHeightMeters: 2.0,
  },
  {
    id: "p2",
    name: "Union Station Lot A",
    address: "800 N Alameda St",
    city: "Los Angeles, CA",
    pricePerHour: 3.0,
    distanceMeters: 950,
    rating: 4.1,
    amenities: ["EV charging", "Covered"],
    maxHeightMeters: 2.1,
  },
  {
    id: "p3",
    name: "Mission Bay Garage",
    address: "455 3rd St",
    city: "San Francisco, CA",
    pricePerHour: 6.5,
    distanceMeters: 540,
    rating: 4.6,
    amenities: ["EV charging", "Covered", "24/7"],
    maxHeightMeters: 2.2,
  },
];

function metersToPretty(m: number) {
  if (m < 950) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  const arr: string[] = new Array(5).fill("☆");
  for (let i = 0; i < full; i++) arr[i] = "★";
  if (half && full < 5) arr[full] = "⯪"; // half-ish

  return <span className="text-amber-500">{arr.join("")}</span>;
}

export default function ParkingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-4 text-xl font-semibold">Nearby parking</h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {DEMO.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold">{p.name}</div>
                <div className="text-xs text-gray-600">
                  {p.address} • {p.city}
                </div>
                <div className="mt-2 flex flex-wrap gap-1 text-xs text-gray-700">
                  {p.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-gray-300 bg-white px-2 py-1"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  ${p.pricePerHour.toFixed(2)}/hr
                </div>
                <div className="text-xs text-gray-600">
                  {metersToPretty(p.distanceMeters)}
                </div>
                <div className="text-xs">
                  <Stars rating={p.rating} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-600">
        * Demo UI — static data only.
      </p>
    </main>
  );
}

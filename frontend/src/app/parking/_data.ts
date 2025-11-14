// src/app/parking/_data.ts
export type Amenity = "EV charging" | "Covered" | "Security" | "24/7" | "Valet";

export interface Parking {
  id: string;
  name: string;
  address: string;
  city: string;
  pricePerHour: number; // USD
  distanceMeters: number; // from user/search point
  rating: number; // 0..5
  amenities: Amenity[];
  maxHeightMeters?: number;
  lat: number;
  lng: number;
  imageUrl: string;
  userName: string;
}

export const DEMO_SPOTS: Parking[] = [
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
    lat: 34.049,
    lng: -118.25,
    imageUrl: "/images/how-step2.jpg",
    userName: "macK",
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
    lat: 34.0562,
    lng: -118.2365,
    imageUrl: "/images/how-step2.jpg",
    userName: "ParkingFan21",
  },
  {
    id: "p3",
    name: "Mission Bay Garage",
    address: "455 3rd St",
    city: "San Francisco, CA",
    pricePerHour: 6.5,
    distanceMeters: 5400,
    rating: 4.6,
    amenities: ["EV charging", "Covered", "24/7"],
    maxHeightMeters: 2.2,
    lat: 37.773,
    lng: -122.389,
    imageUrl: "/images/sf-parking.jpg",
    userName: "SFDriver",
  },
];

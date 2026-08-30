export type DemoStay = {
  slug: string;
  name: string;
  location: "ubud" | "canggu" | "seminyak" | "uluwatu" | "sanur";
  area: string;
  type: "Villa" | "Hotel" | "Homestay";
  guests: number;
  pricePerNight: number;
  image: string;
  highlight: string;
  description: string;
  roomName: string;
  bed: string;
  amenities: string[];
};

export const demoStays: DemoStay[] = [
  {
    slug: "tirta-grove-villas",
    name: "Tirta Grove Villas",
    location: "ubud",
    area: "Ubud, Gianyar",
    type: "Villa",
    guests: 2,
    pricePerNight: 1_250_000,
    image: "/images/stay-ubud.jpg",
    highlight: "Free cancellation until 3 days before check-in",
    description: "A peaceful private villa surrounded by tropical greenery, designed for slow mornings and quiet evenings close to central Ubud.",
    roomName: "Garden pool villa",
    bed: "1 king bed",
    amenities: ["Private pool", "Breakfast", "Fast Wi-Fi", "Air conditioning", "Workspace", "Airport pickup"],
  },
  {
    slug: "sora-house-canggu",
    name: "Sora House Canggu",
    location: "canggu",
    area: "Canggu, Badung",
    type: "Villa",
    guests: 4,
    pricePerNight: 1_875_000,
    image: "/images/stay-canggu.jpg",
    highlight: "Private pool and workspace",
    description: "A bright contemporary villa with generous living space, a private pool, and easy access to Canggu's cafés and beaches.",
    roomName: "Two-bedroom pool villa",
    bed: "2 king beds",
    amenities: ["Private pool", "Kitchen", "Fast Wi-Fi", "Workspace", "Air conditioning", "Daily housekeeping"],
  },
  {
    slug: "nusa-cliff-retreat",
    name: "Nusa Cliff Retreat",
    location: "uluwatu",
    area: "Uluwatu, Badung",
    type: "Hotel",
    guests: 2,
    pricePerNight: 2_100_000,
    image: "/images/stay-uluwatu.jpg",
    highlight: "Breakfast included",
    description: "A relaxed cliff-side retreat with ocean-inspired rooms, warm hospitality, and memorable sunset views in southern Bali.",
    roomName: "Ocean view room",
    bed: "1 king bed",
    amenities: ["Ocean view", "Breakfast", "Shared pool", "Fast Wi-Fi", "Air conditioning", "Restaurant"],
  },
  {
    slug: "sari-sanur-suites",
    name: "Sari Sanur Suites",
    location: "sanur",
    area: "Sanur, Denpasar",
    type: "Homestay",
    guests: 3,
    pricePerNight: 925_000,
    image: "/images/stay-sanur.jpg",
    highlight: "Quiet stay near the beach",
    description: "A welcoming homestay in a calm Sanur neighborhood, ideal for travelers who value local character and easy beach access.",
    roomName: "Deluxe garden room",
    bed: "1 queen bed",
    amenities: ["Garden", "Breakfast", "Fast Wi-Fi", "Air conditioning", "Bike rental", "Laundry service"],
  },
  {
    slug: "uma-seminyak-house",
    name: "Uma Seminyak House",
    location: "seminyak",
    area: "Seminyak, Badung",
    type: "Villa",
    guests: 6,
    pricePerNight: 2_450_000,
    image: "/images/stay-seminyak.jpg",
    highlight: "Walkable location near dining and shops",
    description: "A spacious private stay in the heart of Seminyak, balancing a calm tropical atmosphere with easy access to dining and shopping.",
    roomName: "Three-bedroom private villa",
    bed: "3 king beds",
    amenities: ["Private pool", "Kitchen", "Fast Wi-Fi", "Air conditioning", "Living room", "Daily housekeeping"],
  },
];

export function formatIdr(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDemoStay(slug: string) {
  return demoStays.find((stay) => stay.slug === slug);
}

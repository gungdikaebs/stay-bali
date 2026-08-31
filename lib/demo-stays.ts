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
  {
    slug: "sawah-senja-retreat",
    name: "Sawah Senja Retreat",
    location: "ubud",
    area: "Tegallalang, Gianyar",
    type: "Hotel",
    guests: 2,
    pricePerNight: 1_075_000,
    image: "/images/stay-ubud.jpg",
    highlight: "Rice field views and daily breakfast",
    description: "A quiet boutique retreat overlooking rice fields north of Ubud, with thoughtful local hospitality and restorative surroundings.",
    roomName: "Rice field suite",
    bed: "1 king bed",
    amenities: ["Rice field view", "Breakfast", "Shared pool", "Fast Wi-Fi", "Air conditioning", "Yoga space"],
  },
  {
    slug: "batu-bolong-lofts",
    name: "Batu Bolong Lofts",
    location: "canggu",
    area: "Batu Bolong, Badung",
    type: "Hotel",
    guests: 2,
    pricePerNight: 1_450_000,
    image: "/images/stay-canggu.jpg",
    highlight: "Rooftop pool near Batu Bolong Beach",
    description: "Modern loft-style rooms for travelers who want a comfortable base close to Canggu's beach, cafés, and creative community.",
    roomName: "Studio loft",
    bed: "1 king bed",
    amenities: ["Rooftop pool", "Fast Wi-Fi", "Workspace", "Air conditioning", "Café", "Luggage storage"],
  },
  {
    slug: "melasti-cliff-house",
    name: "Melasti Cliff House",
    location: "uluwatu",
    area: "Ungasan, Badung",
    type: "Villa",
    guests: 4,
    pricePerNight: 2_750_000,
    image: "/images/stay-uluwatu.jpg",
    highlight: "Private sunset terrace",
    description: "A private southern Bali villa with open living spaces, a sunset terrace, and easy access to the beaches around Ungasan.",
    roomName: "Two-bedroom cliff villa",
    bed: "2 king beds",
    amenities: ["Private pool", "Sunset terrace", "Kitchen", "Fast Wi-Fi", "Air conditioning", "Daily housekeeping"],
  },
  {
    slug: "segara-sanur-house",
    name: "Segara Sanur House",
    location: "sanur",
    area: "Sanur, Denpasar",
    type: "Hotel",
    guests: 2,
    pricePerNight: 1_180_000,
    image: "/images/stay-sanur.jpg",
    highlight: "Breakfast and beach shuttle included",
    description: "A relaxed hotel with garden courtyards and warm service, well placed for sunrise walks and laid-back days by the sea.",
    roomName: "Courtyard king room",
    bed: "1 king bed",
    amenities: ["Garden pool", "Breakfast", "Beach shuttle", "Fast Wi-Fi", "Air conditioning", "Restaurant"],
  },
  {
    slug: "petitenget-palm-suites",
    name: "Petitenget Palm Suites",
    location: "seminyak",
    area: "Petitenget, Badung",
    type: "Hotel",
    guests: 2,
    pricePerNight: 1_650_000,
    image: "/images/stay-seminyak.jpg",
    highlight: "Near Petitenget Beach and dining",
    description: "Contemporary suites with a calm palm-lined courtyard in one of Seminyak's most convenient neighborhoods.",
    roomName: "Palm courtyard suite",
    bed: "1 king bed",
    amenities: ["Courtyard pool", "Breakfast", "Fast Wi-Fi", "Air conditioning", "Restaurant", "Airport pickup"],
  },
];

export function formatIdr(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatStayDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getDemoStay(slug: string) {
  return demoStays.find((stay) => stay.slug === slug);
}

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  year: number;
  category: "Compact & City" | "Hybrid Sedan" | "SUV & Crossover" | "Van & Group";
  tagline: string;
  pricePerDay: number; // in LKR (Rs.)
  deposit: number;     // in LKR (Rs.)
  fuelEconomy: string;
  engineOrType: string;
  transmission: string;
  seats: number;
  luggage: string;
  image: string;
  badge: string;
  availableIn: string[];
  features: string[];
}

export const FLEET_VEHICLES: Vehicle[] = [
  {
    id: "suzuki-wagon-r-stingray",
    name: "Wagon R Hybrid",
    brand: "Suzuki",
    year: 2024,
    category: "Compact & City",
    tagline:
      "Sri Lanka's favorite everyday hybrid—easy to park in Colombo and super light on fuel.",
    pricePerDay: 8500,
    deposit: 25000,
    fuelEconomy: "22 km/L",
    engineOrType: "660cc Mild Hybrid",
    transmission: "Automatic",
    seats: 4,
    luggage: "2 Bags",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=85",
    badge: "Best Value",
    availableIn: ["Colombo", "Katunayake Airport", "Negombo", "Kandy", "Galle"],
    features: [
      "Push-start & smart key",
      "Reverse camera & Apple CarPlay",
      "Ice-cold climate control A/C",
      "22+ km/L fuel efficiency",
    ],
  },
  {
    id: "toyota-axio-hybrid",
    name: "Axio WxB Hybrid",
    brand: "Toyota",
    year: 2024,
    category: "Hybrid Sedan",
    tagline:
      "Dependable, comfortable hybrid sedan built for daily commutes, weddings, and family trips.",
    pricePerDay: 13500,
    deposit: 30000,
    fuelEconomy: "20 km/L",
    engineOrType: "1.5L Toyota Hybrid",
    transmission: "Automatic",
    seats: 5,
    luggage: "3 Large Bags",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1400&q=85",
    badge: "Most Popular",
    availableIn: ["Colombo", "Katunayake Airport", "Kandy", "Galle", "Negombo"],
    features: [
      "Spacious 5-passenger cabin",
      "Large boot for airport luggage",
      "Toyota Safety Sense",
      "Bluetooth & USB fast charging",
    ],
  },
  {
    id: "toyota-raize-turbo",
    name: "Raize Z Grade",
    brand: "Toyota",
    year: 2024,
    category: "SUV & Crossover",
    tagline:
      "Compact turbo SUV with high ground clearance—ideal for Kandy, Nuwara Eliya, and Ella.",
    pricePerDay: 15500,
    deposit: 35000,
    fuelEconomy: "17 km/L",
    engineOrType: "1.0L Turbo Petrol",
    transmission: "Automatic",
    seats: 5,
    luggage: "4 Bags",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=85",
    badge: "Hill Country Ready",
    availableIn: ["Colombo", "Katunayake Airport", "Kandy", "Ella", "Galle"],
    features: [
      "High ground clearance for hill roads",
      "Apple CarPlay & Android Auto",
      "Cruise control for highway drives",
      "Fold-flat rear cargo space",
    ],
  },
  {
    id: "honda-vezel-rs",
    name: "Vezel RS Hybrid",
    brand: "Honda",
    year: 2024,
    category: "SUV & Crossover",
    tagline:
      "Stylish, smooth crossover SUV perfect for Southern Expressway drives down to Galle & Mirissa.",
    pricePerDay: 17500,
    deposit: 40000,
    fuelEconomy: "18 km/L",
    engineOrType: "1.5L i-DCD Hybrid",
    transmission: "Automatic",
    seats: 5,
    luggage: "4 Bags",
    image:
      "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1400&q=85",
    badge: "Family Favorite",
    availableIn: ["Colombo", "Katunayake Airport", "Galle", "Kandy"],
    features: [
      "Sporty RS interior trim",
      "Dual-zone automatic A/C",
      "Magic folding rear seats",
      "Highway ETC toll pass ready",
    ],
  },
  {
    id: "toyota-prius-hybrid",
    name: "Prius S Touring",
    brand: "Toyota",
    year: 2024,
    category: "Hybrid Sedan",
    tagline:
      "Ultra-low fuel consumption and whisper-quiet comfort for long island-wide road trips.",
    pricePerDay: 14500,
    deposit: 30000,
    fuelEconomy: "24 km/L",
    engineOrType: "1.8L Hybrid Synergy",
    transmission: "Automatic",
    seats: 5,
    luggage: "4 Bags",
    image:
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1400&q=85",
    badge: "Long Trip Saver",
    availableIn: ["Colombo", "Katunayake Airport", "Negombo", "Galle"],
    features: [
      "Up to 24 km/L fuel economy",
      "Huge hatchback luggage area",
      "Smooth EV mode in city traffic",
      "Full comprehensive insurance",
    ],
  },
  {
    id: "toyota-kdh-van",
    name: "KDH High-Roof Van",
    brand: "Toyota",
    year: 2024,
    category: "Van & Group",
    tagline:
      "The gold standard for Sri Lankan family trips, group tours, and airport transfers.",
    pricePerDay: 22000,
    deposit: 50000,
    fuelEconomy: "12 km/L",
    engineOrType: "2.8L Turbo Diesel",
    transmission: "Automatic",
    seats: 9,
    luggage: "8+ Large Suitcases",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=85",
    badge: "Self-Drive or With Driver",
    availableIn: ["Colombo", "Katunayake Airport", "Kandy", "Galle", "Negombo", "Ella"],
    features: [
      "9 adjustable reclining captain seats",
      "Dual rear cabin air conditioning",
      "Available with experienced driver",
      "Plenty of room for all luggage",
    ],
  },
];

export interface HubLocation {
  id: string;
  city: string;
  hubName: string;
  coords: string;
  deliveryMinutes: number;
  fleetCount: number;
  temp: string;
  status: string;
}

export const HUB_LOCATIONS: HubLocation[] = [
  {
    id: "colombo",
    city: "Colombo",
    hubName: "Colombo 01–15, Rajagiriya & Nugegoda Branch",
    coords: "Western Province • Doorstep Delivery",
    deliveryMinutes: 30,
    fleetCount: 45,
    temp: "Open 24/7",
    status: "Available Now",
  },
  {
    id: "airport",
    city: "Katunayake Airport",
    hubName: "BIA Arrival Terminal 24/7 Meet & Greet",
    coords: "Bandaranaike International Airport",
    deliveryMinutes: 15,
    fleetCount: 38,
    temp: "Open 24/7",
    status: "Available Now",
  },
  {
    id: "kandy",
    city: "Kandy",
    hubName: "Peradeniya Road & City Center Hub",
    coords: "Central Province • Hill Country",
    deliveryMinutes: 25,
    fleetCount: 22,
    temp: "6 AM – 11 PM",
    status: "Available Now",
  },
  {
    id: "galle",
    city: "Galle",
    hubName: "Galle Fort, Unawatuna & Mirissa Pickup",
    coords: "Southern Province • Coastal Hub",
    deliveryMinutes: 25,
    fleetCount: 26,
    temp: "Open 24/7",
    status: "Available Now",
  },
  {
    id: "negombo",
    city: "Negombo",
    hubName: "Poruthota Beach Road Pickup Point",
    coords: "15 Mins from BIA Airport",
    deliveryMinutes: 20,
    fleetCount: 20,
    temp: "Open 24/7",
    status: "Available Now",
  },
  {
    id: "ella",
    city: "Ella",
    hubName: "Ella Town & Nuwara Eliya Drop-off Point",
    coords: "Uva Province • Scenic Highlands",
    deliveryMinutes: 35,
    fleetCount: 15,
    temp: "7 AM – 10 PM",
    status: "Available Now",
  },
];

// ============================================================================
// CUSTOMER + CAR HANDOVER GALLERY
// Tip: Drop your real customer handover photos into `/public/customers/`
// (e.g., `/customers/customer-1.jpg`) and update the `image` paths below,
// or use the in-page "[ + Add Customer Photo ]" button to preview immediately!
// ============================================================================
export interface CustomerPhoto {
  id: string;
  customerName: string;
  location: string;
  vehicleName: string;
  tripTag: string;
  quote: string;
  image: string;
}

export const CUSTOMER_GALLERY_PHOTOS: CustomerPhoto[] = [
  {
    id: "cust-01",
    customerName: "Kasun & Family",
    location: "Katunayake BIA Airport",
    vehicleName: "Toyota Axio Hybrid WxB",
    tripTag: "AIRPORT HANDOVER // 01",
    quote: "Car was waiting right outside BIA arrivals at 2 AM—spotless and ice-cold A/C!",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "cust-02",
    customerName: "Lukas & Hannah (UK)",
    location: "Kandy → Ella Road Trip",
    vehicleName: "Toyota Raize Z Turbo",
    tripTag: "HILL COUNTRY // 02",
    quote: "10 days driving from Colombo to Kandy and Ella. Zero issues and great fuel economy.",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "cust-03",
    customerName: "Dinesh Perera",
    location: "Colombo 07 • Doorstep",
    vehicleName: "Suzuki Wagon R Hybrid",
    tripTag: "CITY COMMUTE // 03",
    quote: "Delivered to my house in 25 minutes. Got 22 km/L around Colombo all week.",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "cust-04",
    customerName: "Amaya & Friends",
    location: "Galle Fort & Mirissa",
    vehicleName: "Honda Vezel RS Sensing",
    tripTag: "SOUTH COAST // 04",
    quote: "Smooth highway cruise down the Southern Expressway. Super clean interior!",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "cust-05",
    customerName: "Silva Family (10 Pax)",
    location: "Nuwara Eliya & Yala",
    vehicleName: "Toyota KDH High-Roof Van",
    tripTag: "FAMILY TOUR // 05",
    quote: "Rented the KDH van with a driver for our family trip. Best service in Sri Lanka.",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "cust-06",
    customerName: "Nalin & Tharushi",
    location: "Negombo Beach Hub",
    vehicleName: "Toyota Prius S Touring",
    tripTag: "COASTAL RUN // 06",
    quote: "Super easy AAC permit process and refundable deposit returned on the spot.",
    image:
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "cust-07",
    customerName: "Marco & Elena (Italy)",
    location: "Sigiriya & Dambulla",
    vehicleName: "Toyota Raize Z Turbo",
    tripTag: "CULTURAL ROUTE // 07",
    quote: "High ground clearance made driving around Sigiriya and Habarana effortless.",
    image:
      "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "cust-08",
    customerName: "Chathura Wijesinghe",
    location: "Rajagiriya Branch",
    vehicleName: "Toyota Axio Hybrid WxB",
    tripTag: "WEDDING RENTAL // 08",
    quote: "Booked two white Axio WxB sedans for a family wedding. Immaculate condition.",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "cust-09",
    customerName: "Roshan & Dilani",
    location: "Down South Expressway",
    vehicleName: "Suzuki Wagon R Hybrid",
    tripTag: "WEEKEND TRIP // 09",
    quote: "Rs. 8,500/day with zero hidden charges. Our go-to rental in Colombo!",
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "cust-10",
    customerName: "David & Crew (Australia)",
    location: "Arugam Bay & Ella",
    vehicleName: "Toyota KDH High-Roof Van",
    tripTag: "SURF & HILLS // 10",
    quote: "Fitted all our boards and luggage easily. 10/10 communication on WhatsApp.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85",
  },
];

export interface Seller {
  id: string;
  name: string;
  email?: string;
  category?: string;
  rating?: number;
  time?: string;
  fee?: string;
}

export interface CityOption {
  city: string;
  state: string;
  label: string;
  lat: number;
  lng: number;
}

export interface SellerWithLocation extends Seller {
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
}

export const CITY_OPTIONS: CityOption[] = [
  { city: "Cabo Frio", state: "RJ", label: "Cabo Frio, RJ", lat: -22.8794, lng: -42.0186 },
  { city: "Arraial do Cabo", state: "RJ", label: "Arraial do Cabo, RJ", lat: -22.9671, lng: -42.0278 },
  { city: "Buzios", state: "RJ", label: "Buzios, RJ", lat: -22.7469, lng: -41.8816 },
  { city: "Rio de Janeiro", state: "RJ", label: "Rio de Janeiro, RJ", lat: -22.9068, lng: -43.1729 },
  { city: "Niteroi", state: "RJ", label: "Niteroi, RJ", lat: -22.8832, lng: -43.1034 },
  { city: "Sao Paulo", state: "SP", label: "Sao Paulo, SP", lat: -23.5505, lng: -46.6333 },
  { city: "Campinas", state: "SP", label: "Campinas, SP", lat: -22.9099, lng: -47.0626 },
  { city: "Santos", state: "SP", label: "Santos, SP", lat: -23.9608, lng: -46.3336 },
  { city: "Belo Horizonte", state: "MG", label: "Belo Horizonte, MG", lat: -19.9167, lng: -43.9345 },
  { city: "Juiz de Fora", state: "MG", label: "Juiz de Fora, MG", lat: -21.761, lng: -43.3503 },
  { city: "Curitiba", state: "PR", label: "Curitiba, PR", lat: -25.4284, lng: -49.2733 },
  { city: "Florianopolis", state: "SC", label: "Florianopolis, SC", lat: -27.5949, lng: -48.5482 },
];

const SELLER_LOCATION_PRESETS: Record<string, Omit<SellerWithLocation, keyof Seller>> = {
  "1": { city: "Cabo Frio", state: "RJ", lat: -22.8851, lng: -42.0202 },
  "2": { city: "Arraial do Cabo", state: "RJ", lat: -22.9696, lng: -42.0284 },
  "3": { city: "Rio de Janeiro", state: "RJ", lat: -22.9135, lng: -43.2003 },
  "4": { city: "Sao Pedro da Aldeia", state: "RJ", lat: -22.8425, lng: -42.1026 },
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function enrichSeller(seller: Seller): SellerWithLocation {
  return {
    ...seller,
    ...SELLER_LOCATION_PRESETS[seller.id],
  };
}

export function formatLocationLabel(city?: string, state?: string) {
  if (!city || !state) return undefined;
  return `${city}, ${state}`;
}

export function getCitySuggestions(query: string, limit = 6) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return CITY_OPTIONS.slice(0, limit);
  }

  return CITY_OPTIONS.filter((option) =>
    normalizeText(option.label).includes(normalizedQuery),
  ).slice(0, limit);
}

export function findCityOption(query: string) {
  const normalizedQuery = normalizeText(query);
  return CITY_OPTIONS.find((option) => normalizeText(option.label) === normalizedQuery);
}

export function calculateDistanceKm(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(endLat - startLat);
  const dLng = toRadians(endLng - startLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(startLat)) *
      Math.cos(toRadians(endLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function findNearbySellers(
  sellers: Seller[],
  location: Pick<CityOption, "lat" | "lng">,
  maxDistanceKm = 80,
  limit = 4,
) {
  return sellers
    .map(enrichSeller)
    .map((seller) => {
      if (seller.lat == null || seller.lng == null) {
        return seller;
      }

      return {
        ...seller,
        distanceKm: calculateDistanceKm(location.lat, location.lng, seller.lat, seller.lng),
      };
    })
    .filter((seller) => seller.distanceKm != null && seller.distanceKm <= maxDistanceKm)
    .sort((left, right) => (left.distanceKm ?? Number.MAX_SAFE_INTEGER) - (right.distanceKm ?? Number.MAX_SAFE_INTEGER))
    .slice(0, limit);
}
export function findClosestNeighborhood(
  lat: number,
  lng: number,
  allData: [string, string, string, number, number][]
) {
  if (!allData || allData.length === 0) return null;

  let closest = allData[0];
  let minDistance = calculateDistanceKm(lat, lng, closest[3], closest[4]);

  for (let i = 1; i < allData.length; i++) {
    const item = allData[i];
    const distance = calculateDistanceKm(lat, lng, item[3], item[4]);
    if (distance < minDistance) {
      minDistance = distance;
      closest = item;
    }
  }

  const [bairro, cidade, uf] = closest;
  return `${bairro}, ${cidade} - ${uf}`;
}

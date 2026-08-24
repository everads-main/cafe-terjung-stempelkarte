export const STAMPS_FOR_REWARD = 10;
export const MAX_STAMPS_PER_ACTION = 10;
/** Sicherheitsnetz pro Tag – mehrere Kaffees am Tag sind erlaubt. */
export const DAILY_STAMP_LIMIT = 20;
export const STAFF_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const LIVE_POLL_MS = 2000;

export const DEFAULT_STAFF_PIN = process.env.STAFF_PIN ?? "5954";

export const LOCATIONS = [
  {
    id: "stammhaus",
    name: "Stammhaus",
    address: "Steverstr. 6, Lüdinghausen",
  },
  {
    id: "backwiaerk",
    name: "Backwiärk",
    address: "Wilhelmstr. 3, Lüdinghausen",
  },
  {
    id: "reitstall",
    name: "Café Reitstall",
    address: "Burg Vischering, Berenbrock 1",
  },
] as const;

export type LocationId = (typeof LOCATIONS)[number]["id"];

export function isLocationId(value: string): value is LocationId {
  return LOCATIONS.some((location) => location.id === value);
}

export function locationById(id: string) {
  return LOCATIONS.find((location) => location.id === id) ?? LOCATIONS[0];
}

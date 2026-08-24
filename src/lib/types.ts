import type { LocationId } from "@/lib/config";

export type Guest = {
  id: string;
  firstName: string;
  cardCode: string;
  pinHash: string;
  createdAt: string;
};

export type Stamp = {
  id: string;
  guestId: string;
  createdAt: string;
  locationId: LocationId;
  tokenId: string;
};

export type Redemption = {
  id: string;
  guestId: string;
  createdAt: string;
  locationId: LocationId;
  tokenId: string;
};

export type Move = {
  id: string;
  type: "stamp" | "redeem";
  guestId: string;
  cups: number;
  locationId: LocationId;
  createdAt: string;
};

export type TokenKind = "stamp" | "redeem";

export type Token = {
  id: string;
  secret: string;
  kind: TokenKind;
  cups: number;
  locationId: LocationId;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  usedByGuestId: string | null;
};

export type StaffSession = {
  id: string;
  locationId: LocationId;
  createdAt: string;
  expiresAt: string;
};

export type StoreData = {
  guests: Guest[];
  stamps: Stamp[];
  redemptions: Redemption[];
  moves: Move[];
  tokens: Token[];
  staffSessions: StaffSession[];
};

export type CardHistoryItem = {
  id: string;
  type: "stamp" | "redeem";
  createdAt: string;
  locationName: string;
  cups?: number;
};

export type CardState = {
  guestId: string;
  firstName: string;
  cardCode: string;
  current: number;
  stampsToday: number;
  dailyLimit: number;
  freeCoffeeReady: boolean;
  stampsUntilFree: number;
  stampsRoom: number;
  pendingStamps: number;
  history: CardHistoryItem[];
};

export type ActivityItem = {
  id: string;
  type: "stamp" | "redeem";
  createdAt: string;
  firstName: string;
  cardCode: string;
  cups?: number;
  current: number;
};

export type GuestSummary = {
  firstName: string;
  cardCode: string;
  current: number;
  freeCoffeeReady: boolean;
};

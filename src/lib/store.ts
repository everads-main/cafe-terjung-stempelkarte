import { hasDatabase } from "@/db";

import * as neonRepo from "@/lib/repository";
import * as localRepo from "@/lib/local-repository";

type Api = typeof localRepo;

const api: Api = (hasDatabase() ? neonRepo : localRepo) as Api;

export const applyRedeem = api.applyRedeem;
export const applyStampBatch = api.applyStampBatch;
export const activityForLocation = api.activityForLocation;
export const cardStateForGuest = api.cardStateForGuest;
export const createGuest = api.createGuest;
export const createStaffSession = api.createStaffSession;
export const currentStamps = api.currentStamps;
export const findGuest = api.findGuest;
export const findGuestByUsername = api.findGuestByUsername;
export const usernameTaken = api.usernameTaken;
export const formatStampSteps = api.formatStampSteps;
export const guestByCardCode = api.guestByCardCode;
export const guestById = api.guestById;
export const guestCount = api.guestCount;
export const hashPin = api.hashPin;
export const isKnownLocation = api.isKnownLocation;
export const LOCATIONS = api.LOCATIONS;
export const normalizeName = api.normalizeName;
export const normalizeUsername = api.normalizeUsername;
export const staffSessionById = api.staffSessionById;
export const verifyStaffPin = api.verifyStaffPin;

export type StampError = localRepo.StampError;
export type StampStep = localRepo.StampStep;

export function storageMode() {
  return hasDatabase() ? "neon" : "local-demo";
}

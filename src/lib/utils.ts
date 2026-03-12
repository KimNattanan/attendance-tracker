import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { decryptString } from "./server-action";

export function cn(...inputs: ClassValue[]){
  return twMerge(clsx(inputs))
}

// utils

export const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
export const monthNamesAbbr = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
export function formatDateTime(date: Date){
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return [date.getDate(), monthNames[date.getMonth()], date.getFullYear(), `${hours}:${minutes}:${seconds}`];
}

export function isNumeric(str: string): boolean {
  if(typeof str !== 'string' || str.trim().length === 0){
    return false;
  }
  return !isNaN(Number(str)) && isFinite(Number(str));
};

// face recognition

export function euclideanDistance(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const len = a.length;
  if(len !== b.length) return Number.POSITIVE_INFINITY;
  let sum = 0;
  for (let i = 0; i < len; i++){
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function parseStoredFaceId(faceIdJson: string): Float32Array | null {
  
  const v: unknown = JSON.parse(faceIdJson);

  if(Array.isArray(v) && v.every((n) => typeof n === "number")){
    return new Float32Array(v);
  }

  if(v && typeof v === "object"){
    const entries = Object.entries(v as Record<string, unknown>)
      .filter(([k, val]) => /^\d+$/.test(k) && typeof val === "number")
      .sort((a, b) => Number(a[0]) - Number(b[0]));
    if(entries.length > 0){
      return new Float32Array(entries.map(([, val]) => val as number));
    }
  }

  return null;
}

export async function findMatchUserFace(users: { id: string, faceId: string }[], faceId: Float32Array<ArrayBufferLike>){
  
  const threshold = 0.6;

  let best: { id: string; distance: number } | null = null;
  
  for (const user of users){
    const parsed = await (async () => {
      try {
        return parseStoredFaceId(await decryptString(user.faceId));
      } catch {
        return null;
      }
    })();

    if(!parsed) continue;

    const distance = euclideanDistance(faceId, parsed);
    if(!Number.isFinite(distance)) continue;

    if(!best || distance < best.distance){
      best = { id: user.id, distance };
    }
  }

  if(!best) return null
  if(best.distance > threshold) return null;

  return best
}

// location utils

export const EARTH_RADIUS_METERS = 6371000;

export type Location = {
  lat: number
  lng: number
}

export function degreesToRadians(deg: number){
  return (deg * Math.PI) / 180;
}

export function calculateLocationDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
){
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // Haversine formula
  return EARTH_RADIUS_METERS * c;
}
import { USERS_KEY } from "../constants";

export const classNames = (...xs: (string | false | null | undefined)[]) =>
  xs.filter(Boolean).join(" ");

export const formatDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString() : "—";

export const hasAvailable = (b: any) =>
  (b.availability || []).some(
    (a: any) => a.status === "Available" || a.status === "On shelf",
  );

export function readUsers() {
  try {
    const arr = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function writeUsers(list: any[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  } catch {}
}

export const AUTH_TOKEN_KEY = "mg_token";
export const AUTH_EMAIL_KEY = "mg_email";

export function saveAuth(payload: { token: string; email: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
  localStorage.setItem(AUTH_EMAIL_KEY, payload.email);
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EMAIL_KEY);
}

export function getAuth() {
  if (typeof window === "undefined") return { token: "", email: "" };
  return {
    token: localStorage.getItem(AUTH_TOKEN_KEY) || "",
    email: localStorage.getItem(AUTH_EMAIL_KEY) || "",
  };
}

export function isAuthed() {
  const { token } = getAuth();
  return Boolean(token);
}

import { API_URL } from "./config";

const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem("auth"))?.token ?? null;
  } catch {
    return null;
  }
};

// Use exactly like fetch, but pass only the path after /api
// Example: authFetch("/properties")
export async function authFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Expired or invalid token: clear it and go back to the login page
  if (res.status === 401) {
    localStorage.removeItem("auth");
    window.location.href = "/login";
  }

  return res;
}
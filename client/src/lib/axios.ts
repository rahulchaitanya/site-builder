import axios from "axios";

// Set VITE_API_URL in client/.env, e.g. http://localhost:3000 (dev)
// or https://api.yourdomain.dev (production)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // required so better-auth session cookies are sent
});

export default api;

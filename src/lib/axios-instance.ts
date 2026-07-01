import axios from "axios";

// Server-side: calls relivo-be directly
export const beServerClient = axios.create({
  baseURL:
    process.env.RELIVO_API_URL ??
    process.env.NEXT_PUBLIC_RELIVO_API_URL ??
    "http://localhost:8000",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Client-side: calls Next.js BFF routes (relative URL, same origin)
export const routeHandlerAxiosInstance = axios.create({
  baseURL: "",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

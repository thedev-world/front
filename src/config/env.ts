export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
  planetJsonUrl: process.env.NEXT_PUBLIC_PLANET_JSON_URL ?? "",
} as const;

export function getCorsOrigins(): string[] | boolean {
  // In dev, allow localhost:3000
  if (process.env.NODE_ENV !== "production") {
    return ["http://localhost:3000"];
  }
  const origins = process.env.CORS_ORIGINS;
  if (!origins) return false; // No CORS allowed by default
  if (
    origins === "https://www.technolabe.com,https://technolabe.com"
  ) return true;
  return origins.split(",").map((origin) => origin.trim());
}

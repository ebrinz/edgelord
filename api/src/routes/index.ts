import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.js";
import { refreshRoutes } from "./refresh.js";

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  // Register all route groups with their correct prefixes
  fastify.register(authRoutes, { prefix: "/api/auth" });
  fastify.register(refreshRoutes, { prefix: "/api" });

  // Health check endpoint (no auth)
  fastify.get("/health", async () => {
    return { status: "ok", time: new Date().toISOString() };
  });
}

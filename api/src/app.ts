// /api/src/app.ts
import { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import { supabasePlugin } from "./plugins/supabase.js";
import { registerRoutes } from "./routes/index.js";
import { getCorsOrigins } from "./utils/corsOrigins.js";

export default async function (fastify: FastifyInstance) {
  await fastify.register(fastifyCors, {
    origin: getCorsOrigins(),
    credentials: true,
  });
  await fastify.register(supabasePlugin);
  await registerRoutes(fastify);
}

import { FastifyInstance } from "fastify";

export async function refreshRoutes(fastify: FastifyInstance) {
  fastify.post("/refresh", async (request, reply) => {
    try {
      // Use supabase client from fastify instance
      const { data, error } = await fastify.supabase.auth.refreshSession();
      if (error) {
        return reply.status(401).send({ error: error.message });
      }
      return reply.send({ user: data.user });
    } catch (err) {
      fastify.log.error("Session refresh error:", err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}

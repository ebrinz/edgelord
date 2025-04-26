import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseUser } from "../types.js";

export const supabasePlugin = fp(async (fastify: FastifyInstance) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or Service Key");
  }

  // Create Supabase client with service key for admin access
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  // Create a decorator to access Supabase client
  fastify.decorate("supabase", supabaseAdmin);

  // Helper function to create user-specific Supabase client
  fastify.decorate("createUserSupabase", (accessToken: string) => {
    return createClient(supabaseUrl!, process.env.SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  });

  // Verify Supabase JWT token
  fastify.decorate(
    "verifySupabaseToken",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
          throw new Error("Missing authorization header");
        }

        const token = authHeader.replace("Bearer ", "");

        // Verify with Supabase
        const {
          data: { user },
          error,
        } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
          throw new Error("Invalid authentication token");
        }

        // Set user in request for later use - use supabaseUser to avoid conflicts
        (request as FastifyRequest).supabaseUser =
          user as unknown as SupabaseUser;

        // Also create user-specific Supabase client
        (request as FastifyRequest).userSupabase =
          fastify.createUserSupabase(token);

        return user;
      } catch (error: unknown) {
        fastify.log.error(error);
        let message = "Unknown error";
        if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          typeof (error as { message?: unknown }).message === "string"
        ) {
          message = (error as { message: string }).message;
        }
        reply.code(401).send({ error: "Unauthorized", message });
        throw new Error("Unauthorized");
      }
    },
  );

  // API key authentication for CLI access
  fastify.decorate(
    "verifyApiKey",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const apiKey = request.headers["x-api-key"] as string;

        if (!apiKey) {
          // Never reveal whether the key is missing or invalid for security
          throw new Error("Unauthorized");
        }

        // Query API keys table to validate the key
        const { data, error } = await supabaseAdmin
          .from("api_keys")
          .select("user_id, permissions, is_active, expires_at")
          .eq("key", apiKey)
          .single();

        // Check for invalid, inactive, or expired keys
        if (
          error ||
          !data ||
          !data.is_active ||
          (data.expires_at && new Date(data.expires_at) < new Date())
        ) {
          // Log failed attempt for audit (but never log the key itself)
          fastify.log.warn(
            { user_id: data?.user_id },
            "API key authentication failed",
          );
          throw new Error("Unauthorized");
        }

        // Get user information
        const { data: userData, error: userError } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("id", data.user_id)
          .single();

        if (userError || !userData) {
          throw new Error("Unauthorized");
        }

        // Set user in request for later use - use supabaseUser to avoid conflicts
        (request as FastifyRequest).supabaseUser =
          userData as unknown as SupabaseUser;
        (request as FastifyRequest).apiKeyPermissions = data.permissions;
        (request as FastifyRequest).apiKeyUserId = data.user_id;
        (request as FastifyRequest).apiKey = "[REDACTED]"; // Never expose the real key

        // Create admin Supabase client for API key users
        (request as FastifyRequest).userSupabase = supabaseAdmin;

        // --- Permission check stub ---
        // Usage example in downstream route:
        // if (!(request as FastifyRequest).apiKeyPermissions?.includes('repo:read')) {
        //   reply.code(403).send({ error: 'Forbidden', message: 'Missing required permission: repo:read' });
        //   throw new Error('Forbidden');
        // }

        return userData;
      } catch (error: unknown) {
        fastify.log.error(error);
        // Use reply.send with a proper status code instead of returning
        reply
          .code(401)
          .send({ error: "Unauthorized", message: "Invalid credentials" });
        throw new Error("Unauthorized");
      }
    },
  );
});

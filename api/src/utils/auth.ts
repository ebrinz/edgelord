import { FastifyRequest, FastifyReply } from "fastify";

/**
 * Standard authentication middleware for routes that require Bearer token authentication
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      reply.code(401).send({
        error: "Unauthorized",
        message: "Missing or invalid Authorization header",
      });
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    // Access the fastify instance to use Supabase
    const fastify = request.server;

    // Verify with Supabase
    const {
      data: { user },
      error,
    } = await fastify.supabase.auth.getUser(token);

    if (error || !user) {
      reply.code(401).send({
        error: "Unauthorized",
        message: error?.message || "Invalid authentication token",
      });
      return;
    }

    // Make user data available to route handlers
    (request as { supabaseUser: unknown; userSupabase: unknown }).supabaseUser =
      user;
    (request as { supabaseUser: unknown; userSupabase: unknown }).userSupabase =
      fastify.createUserSupabase(token);
  } catch (error: unknown) {
    reply.code(401).send({
      error: "Unauthorized",
      message: (error as { message: string }).message,
    });
  }
}

/**
 * Dual authentication middleware that supports both Bearer tokens and API keys
 */
export async function authenticateDual(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const fastify = request.server;

    // First try Bearer token authentication
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");

      // Verify with Supabase
      const {
        data: { user },
        error,
      } = await fastify.supabase.auth.getUser(token);

      if (!error && user) {
        // Store user in request
        (
          request as { supabaseUser: unknown; userSupabase: unknown }
        ).supabaseUser = user;
        (
          request as { supabaseUser: unknown; userSupabase: unknown }
        ).userSupabase = fastify.createUserSupabase(token);
        return;
      }
    }

    // Next, try API key authentication
    const apiKey = request.headers["x-api-key"] as string;
    if (apiKey) {
      // Query API keys table to validate the key
      const { data, error } = await fastify.supabase
        .from("api_keys")
        .select("user_id, permissions")
        .eq("key", apiKey)
        .eq("is_active", true)
        .single();

      if (!error && data) {
        // Get user information
        const { data: userData, error: userError } = await fastify.supabase
          .from("users")
          .select("*")
          .eq("id", data.user_id)
          .single();

        if (!userError && userData) {
          // Store user in request
          (
            request as {
              supabaseUser: unknown;
              apiKeyPermissions: unknown;
              userSupabase: unknown;
            }
          ).supabaseUser = userData;
          (
            request as {
              supabaseUser: unknown;
              apiKeyPermissions: unknown;
              userSupabase: unknown;
            }
          ).apiKeyPermissions = data.permissions;
          (
            request as {
              supabaseUser: unknown;
              apiKeyPermissions: unknown;
              userSupabase: unknown;
            }
          ).userSupabase = fastify.supabase;
          return;
        }
      }
    }

    // If we get here, authentication failed
    reply.code(401).send({
      error: "Unauthorized",
      message: "Valid Bearer token or API key required",
    });
  } catch (error: unknown) {
    reply.code(401).send({
      error: "Unauthorized",
      message: (error as { message: string }).message,
    });
  }
}

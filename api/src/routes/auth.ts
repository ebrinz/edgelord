import { FastifyInstance } from "fastify";
import { authenticate } from "../utils/auth.js";

export async function authRoutes(fastify: FastifyInstance) {
  // Schema for token generation request
  const tokenSchema = {
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 3 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { type: "object" },
        },
      },
    },
    tags: ["Auth"],
  };

  // Login route
  fastify.post("/login", { schema: tokenSchema }, async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    try {
      // Authenticate with Supabase
      const authResponse = await fastify.supabase.auth
        .signInWithPassword({
          email,
          password,
        })
        .catch((err) => {
          console.error("Detailed auth error:", {
            message: err.message,
            stack: err.stack,
            cause: err.cause ? err.cause.message : "No cause",
            code: err.code,
            status: err.status,
            name: err.name,
          });
          throw err;
        });

      console.log(
        "Supabase auth response:",
        JSON.stringify(authResponse, null, 2),
      );

      if (authResponse.error) throw authResponse.error;

      // Log the user data specifically
      console.log(
        "User data:",
        JSON.stringify(authResponse.data.user, null, 2),
      );

      return {
        token: authResponse.data.session.access_token,
        user: authResponse.data.user,
      };
    } catch (error: unknown) {
      const err = error as Error & {
        message?: string;
        name?: string;
        stack?: string;
      };
      console.error("Login error type:", typeof error);
      console.error("Login error name:", err.name);
      console.error("Login error message:", err.message);
      console.error("Login error stack:", err.stack);

      reply.code(401).send({
        error: "Authentication failed",
        message: err.message,
        details: "Check server logs for more information",
      });
    }
  });

  // User info route
  fastify.get(
    "/user",
    {
      schema: {
        headers: {
          type: "object",
          required: ["authorization"],
          properties: {
            authorization: { type: "string", description: "Bearer token" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              user: { type: "object" },
              profile: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  full_name: { type: "string" },
                  avatar_url: { type: "string" },
                },
              },
            },
          },
        },
        tags: ["Auth"],
      },
    },
    async (request, reply) => {
      try {
        // Get the token from the Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return reply.code(401).send({
            error: "Unauthorized",
            message:
              'Missing or invalid Authorization header. Format should be "Bearer your-token"',
          });
        }

        const token = authHeader.replace("Bearer ", "");

        // Fetch user data with the token
        const { data, error } = await fastify.supabase.auth.getUser(token);

        if (error) {
          console.error("Authentication error:", error);
          return reply.code(401).send({
            error: "Authentication failed",
            message: error.message,
          });
        }

        // Check if we actually got user data
        if (!data.user || Object.keys(data.user).length === 0) {
          console.error("No user data returned from Supabase despite no error");
          return reply.code(401).send({
            error: "Authentication failed",
            message: "Invalid or expired token",
          });
        }

        // Now fetch the profile data from the profiles table
        const { data: profileData, error: profileError } =
          await fastify.supabase
            .from("profiles")
            .select("username, full_name, avatar_url")
            .eq("id", data.user.id)
            .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Continue anyway, just return the auth user without profile
        }

        return {
          user: data.user,
          profile: profileData || null,
        };
      } catch (error: unknown) {
        const err = error as Error & {
          message?: string;
          name?: string;
          stack?: string;
        };
        console.error("Error fetching user:", err);
        return reply.code(500).send({
          error: "Failed to fetch user data",
          message: err.message,
        });
      }
    },
  );

  // Generate API key for CLI access
  fastify.post(
    "/api-key",
    {
      preHandler: authenticate,
      schema: {
        headers: {
          type: "object",
          required: ["authorization"],
          properties: {
            authorization: { type: "string", description: "Bearer token" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "UUID of the API key record used for revocation",
              },
              apiKey: { type: "string" },
              expiresAt: { type: "string" },
              permissions: { type: "array", items: { type: "string" } },
            },
          },
        },
        tags: ["Auth"],
      },
    },
    async (request, reply) => {
      try {
        // Get supabaseUser safely with type assertion
        const user = (request as import("../types.js").AuthenticatedRequest)
          .supabaseUser;
        if (!user || !user.id) {
          throw new Error("User not authenticated");
        }

        console.log("Generating API key for user:", user.id);

        // Generate a random API key
        const apiKey = Array(32)
          .fill(0)
          .map(() => Math.random().toString(36).charAt(2))
          .join("");

        console.log("API key generated, checking if api_keys table exists...");

        // Check if the api_keys table exists
        try {
          await fastify.supabase.from("api_keys").select("*").limit(1);
        } catch (tableCheckError: unknown) {
          const err = tableCheckError as Error & {
            message?: string;
            name?: string;
            stack?: string;
          };
          console.error("Exception checking api_keys table:", err);
          return reply.code(500).send({
            error: "Failed to generate API key",
            message: "Error checking api_keys table",
            details: err.message,
          });
        }

        // Store API key in database
        try {
          console.log("Inserting API key into database...");
          const { data, error } = await fastify.supabase
            .from("api_keys")
            .insert({
              key: apiKey,
              user_id: user.id,
              permissions: ["read", "write"], // Default permissions
              is_active: true,
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            })
            .select()
            .single();

          if (error) {
            console.error("Error inserting API key:", error);
            throw error;
          }

          console.log("API key successfully generated with ID:", data.id);

          return {
            id: data.id, // Include the UUID in the response
            apiKey,
            expiresAt: data.expires_at,
            permissions: data.permissions,
          };
        } catch (insertError: unknown) {
          const err = insertError as Error & {
            message?: string;
            name?: string;
            stack?: string;
          };
          console.error("Exception inserting API key:", err);
          return reply.code(500).send({
            error: "Failed to generate API key",
            message: "Error inserting API key into database",
            details: err.message,
          });
        }
      } catch (error: unknown) {
        const err = error as Error & {
          message?: string;
          name?: string;
          stack?: string;
        };
        console.error("General error in API key generation:", err);
        reply.code(500).send({
          error: "Failed to generate API key",
          message: err.message,
          stack: err.stack,
        });
      }
    },
  );

  // Revoke API key
  fastify.delete(
    "/api-key/:id",
    {
      preHandler: authenticate,
      schema: {
        description:
          "Revoke an API key using its UUID (not the API key string itself)",
        headers: {
          type: "object",
          required: ["authorization"],
          properties: {
            authorization: { type: "string", description: "Bearer token" },
          },
        },
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description:
                "UUID of the API key record (obtained when generating the key)",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
        tags: ["Auth"],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      // Validate UUID format
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(id)) {
        return reply.code(400).send({
          error: "Invalid ID format",
          message:
            "The API key ID must be a valid UUID. This is the ID returned when creating the key, not the API key string itself.",
        });
      }

      try {
        // Get supabaseUser safely with type assertion
        const user = (request as import("../types.js").AuthenticatedRequest)
          .supabaseUser;
        if (!user || !user.id) {
          throw new Error("User not authenticated");
        }

        console.log(
          `Attempting to revoke API key with ID: ${id} for user: ${user.id}`,
        );

        // First check if the API key belongs to this user
        const { data: keyData, error: keyError } = await fastify.supabase
          .from("api_keys")
          .select("id, is_active")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (keyError || !keyData) {
          console.log(
            `API key not found or doesn't belong to user: ${user.id}`,
          );
          return reply.code(404).send({
            error: "API key not found",
            message:
              "The specified API key does not exist or does not belong to you.",
          });
        }

        // Check if already inactive
        if (keyData.is_active === false) {
          return reply.code(200).send({
            success: true,
            message: "API key was already revoked",
          });
        }

        // Deactivate key in database
        console.log(`Revoking API key with ID: ${id}`);
        const { error } = await fastify.supabase
          .from("api_keys")
          .update({ is_active: false })
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating api_key status:", error);
          throw error;
        }

        console.log(`Successfully revoked API key with ID: ${id}`);
        return { success: true, message: "API key revoked successfully" };
      } catch (error: unknown) {
        const err = error as Error & {
          message?: string;
          name?: string;
          stack?: string;
        };
        console.error("Error revoking API key:", err);
        reply.code(500).send({
          error: "Failed to revoke API key",
          message: err.message,
        });
      }
    },
  );

  // List all API keys for the authenticated user
  fastify.get(
    "/api-keys",
    {
      preHandler: authenticate,
      schema: {
        description: "List all API keys for the authenticated user",
        headers: {
          type: "object",
          required: ["authorization"],
          properties: {
            authorization: { type: "string", description: "Bearer token" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "UUID for API key management",
                    },
                    key_preview: {
                      type: "string",
                      description: "First few characters of the API key",
                    },
                    name: { type: "string" },
                    permissions: { type: "array", items: { type: "string" } },
                    is_active: { type: "boolean" },
                    created_at: { type: "string" },
                    expires_at: { type: "string" },
                  },
                },
              },
            },
          },
        },
        tags: ["Auth"],
      },
    },
    async (request, reply) => {
      try {
        // Get supabaseUser safely with type assertion
        const user = (request as import("../types.js").AuthenticatedRequest)
          .supabaseUser;
        if (!user || !user.id) {
          throw new Error("User not authenticated");
        }

        console.log(`Fetching API keys for user: ${user.id}`);

        // Get API keys for this user
        const { data, error } = await fastify.supabase
          .from("api_keys")
          .select(
            "id, key, name, permissions, is_active, created_at, expires_at",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching API keys:", error);
          throw error;
        }

        // For security, don't return the full API keys, just a preview
        const processed =
          data?.map((item) => ({
            id: item.id,
            key_preview: item.key ? `${item.key.substring(0, 8)}...` : null,
            name: item.name,
            permissions: item.permissions,
            is_active: item.is_active,
            created_at: item.created_at,
            expires_at: item.expires_at,
          })) || [];

        console.log(`Found ${processed.length} API keys for user: ${user.id}`);
        return { data: processed };
      } catch (error: unknown) {
        const err = error as Error & {
          message?: string;
          name?: string;
          stack?: string;
        };
        console.error("Error fetching API keys:", err);
        reply.code(500).send({
          error: "Failed to fetch API keys",
          message: err.message,
        });
      }
    },
  );
}

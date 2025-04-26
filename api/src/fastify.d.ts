import { SupabaseClient } from "@supabase/supabase-js";

// This approach uses a global declaration file to extend TypeScript interfaces

interface SupabaseUser {
  id: string;
  email?: string;
  [key: string]: unknown;
}

// Extend Fastify but avoid properties that might conflict with JWT
declare module "fastify" {
  interface FastifyInstance {
    supabase: SupabaseClient;
    createUserSupabase: (accessToken: string) => SupabaseClient;
    verifySupabaseToken: (request: unknown, reply: unknown) => Promise<unknown>;
    verifyApiKey: (request: unknown, reply: unknown) => Promise<unknown>;
  }

  // IMPORTANT: We avoid using 'user' since it conflicts with JWT
  interface FastifyRequest {
    supabaseUser: SupabaseUser;
    userSupabase: SupabaseClient;
    apiKeyPermissions?: string[];
  }
}

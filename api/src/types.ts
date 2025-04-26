import { SupabaseClient } from "@supabase/supabase-js";
import { FastifyRequest } from "fastify";

// --- Specific interfaces for Supabase responses ---
export interface Repository {
  id: string;
  owner_id: string;
  [key: string]: unknown;
}

export interface Branch {
  id: string;
  latest_commit_sha?: string;
  is_protected?: boolean;
  [key: string]: unknown;
}

export interface Commit {
  id: string;
  sha: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_at: string;
  committer_name?: string;
  committer_email?: string;
  committed_at?: string;
  parent_sha?: string;
  branch_name?: string;
  namespace?: string;
  notes?: string;
  created_at: string;
  assistantThoughts?: string;
  prompt?: string;
  [key: string]: unknown;
}

export interface SupabaseUser {
  id: string;
  email?: string;
  [key: string]: unknown;
}

export interface AuthenticatedRequest extends FastifyRequest {
  supabaseUser: SupabaseUser;
  userSupabase: SupabaseClient;
  apiKeyPermissions?: string[];
  apiKeyUserId?: string;
  apiKey?: string;
}

// Query type for GET /commits/:repositoryId
export interface CommitsQuery {
  branch?: string;
  namespace?: string;
  limit?: number;
  offset?: number;
}

declare module "fastify" {
  interface FastifyRequest {
    supabaseUser: SupabaseUser;
    userSupabase: SupabaseClient;
    apiKeyPermissions?: string[];
    apiKeyUserId?: string;
    apiKey?: string;
  }
}

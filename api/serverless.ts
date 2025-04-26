// api/serverless.ts
import * as dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import appPlugin from "./src/app";

// Instantiate Fastify
const app = Fastify({ logger: true });

// Register your main application/plugin
app.register(appPlugin);

import { IncomingMessage, ServerResponse } from "http";

// Export the serverless handler for Vercel
export default async (req: IncomingMessage, res: ServerResponse) => {
  await app.ready();
  app.server.emit("request", req, res);
};

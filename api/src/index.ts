import "dotenv/config";
import Fastify, { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import { supabasePlugin } from "./plugins/supabase.js";
import { registerRoutes } from "./routes/index.js";
import { swaggerOptions, swaggerUiOptions } from "./config/swagger.js";
import { generateSupabaseSchema } from "./utils/schema-generator.js";
import { getCorsOrigins } from "./utils/corsOrigins.js";

import { promisify } from "util";
import { exec } from "child_process";
const execPromise = promisify(exec);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    const fastify: FastifyInstance = Fastify({
      logger: {
        level: process.env.LOG_LEVEL || "info",
        transport: {
          target: "pino-pretty",
          options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        },
      },
    });

    // Register plugins
    await fastify.register(fastifyCors, {
      origin: getCorsOrigins(),
      credentials: true,
    });

    await fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
      sign: {
        expiresIn: "7d",
      },
    });

    // Register Swagger for API documentation
    await fastify.register(fastifySwagger, swaggerOptions);
    await fastify.register(fastifySwaggerUi, swaggerUiOptions);

    // Register Supabase client as a plugin
    await fastify.register(supabasePlugin);

    // Register all routes
    await fastify.register(registerRoutes);

    // Start the server
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server is running on ${HOST}:${PORT}`);
    console.log(`API Documentation: http://${HOST}:${PORT}/documentation`);

    // Wait for fastify to be ready
    await fastify.ready();

    // Step 1: Generate Supabase schema documentation
    console.log("Generating Supabase schema documentation...");
    const supabaseSchema = await generateSupabaseSchema(fastify);
    const fs = await import("fs");

    // Step 2: Write the Supabase schema to a file
    fs.writeFileSync(
      "./supabase-schema.json",
      JSON.stringify(supabaseSchema, null, 2),
    );
    console.log(
      "Supabase schema JSON has been written to supabase-schema.json",
    );

    // Step 3: Get the API Swagger JSON (use type assertion)
    const apiSwaggerJSON = fastify.swagger() as Record<string, unknown>;

    // Type guard to check for object
    function isObject(val: unknown): val is Record<string, unknown> {
      return typeof val === "object" && val !== null;
    }

    // Type-safe extraction of nested objects
    type ComponentsWithSchemas = { schemas?: Record<string, unknown> };
    const apiComponents = isObject(apiSwaggerJSON.components)
      ? (apiSwaggerJSON.components as ComponentsWithSchemas)
      : {};
    const apiSchemas = isObject(apiComponents.schemas)
      ? apiComponents.schemas
      : {};
    const apiPaths = isObject(apiSwaggerJSON.paths) ? apiSwaggerJSON.paths : {};

    const supabaseComponents = isObject(supabaseSchema.components)
      ? (supabaseSchema.components as ComponentsWithSchemas)
      : {};
    const supabaseSchemas = isObject(supabaseComponents.schemas)
      ? supabaseComponents.schemas
      : {};
    const supabasePaths = isObject(supabaseSchema.paths)
      ? supabaseSchema.paths
      : {};

    // Step 4: Merge the Supabase schema with API swagger
    const combinedSwagger = {
      ...apiSwaggerJSON,
      components: {
        ...apiComponents,
        schemas: {
          ...apiSchemas,
          ...supabaseSchemas,
        },
      },
      paths: {
        ...apiPaths,
        ...supabasePaths,
      },
    };

    // Step 5: Write the combined schema to a file
    fs.writeFileSync(
      "./swagger.json",
      JSON.stringify(combinedSwagger, null, 2),
    );
    console.log(
      "Combined API and Supabase schema has been written to swagger.json",
    );

    // Step 6: Convert to Markdown using auto-documentation templates
    console.log("Converting to Markdown with auto-documentation templates...");
    try {
      // Create the auto-doc-templates directory if it doesn't exist
      if (!fs.existsSync("./auto-doc-templates")) {
        console.log("Creating auto-doc-templates directory...");
        fs.mkdirSync("./auto-doc-templates", { recursive: true });

        // Copy default templates if they're not already present
        const defaultTemplatesDir = "./node_modules/widdershins/templates";
        if (fs.existsSync(defaultTemplatesDir)) {
          console.log(
            "Copying default templates to auto-doc-templates directory...",
          );

          // Copy recursively
          const copyRecursive = (src, dest) => {
            const exists = fs.existsSync(src);
            const stats = exists && fs.statSync(src);
            const isDirectory = exists && stats.isDirectory();

            if (isDirectory) {
              if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
              }
              fs.readdirSync(src).forEach((childItemName) => {
                copyRecursive(
                  `${src}/${childItemName}`,
                  `${dest}/${childItemName}`,
                );
              });
            } else {
              fs.copyFileSync(src, dest);
            }
          };

          copyRecursive(defaultTemplatesDir, "./auto-doc-templates");
        }
      }

      await execPromise(
        'npx widdershins --search true --language_tabs "shell:cURL" ' +
          "--user_templates ./auto-doc-templates --omitHeader false --summary true " +
          "--shallowSchemas true --useBodyName true swagger.json -o api-documentation.md",
      );
      console.log("API documentation has been written to api-documentation.md");
    } catch (docError) {
      console.error("Error generating Markdown documentation:", docError);
    }
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();

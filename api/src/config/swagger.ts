import { SwaggerOptions } from "@fastify/swagger";
import { FastifySwaggerUiOptions } from "@fastify/swagger-ui";

export const swaggerOptions: SwaggerOptions = {
  openapi: {
    info: {
      title: "Next.js API with Fastify",
      description: "API for Next.js frontend with Supabase authentication",
      version: "1.0.0",
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        apiKeyAuth: {
          type: "apiKey",
          name: "x-api-key",
          in: "header",
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Users", description: "User management endpoints" },
      { name: "Data", description: "Data access endpoints" },
      { name: "Debug", description: "Debugging and development tools" },
      { name: "Repositories", description: "Repository management endpoints" },
    ],
    security: [{ bearerAuth: [] }],
  },
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: "/documentation",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
    persistAuthorization: true,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
};

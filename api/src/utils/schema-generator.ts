import { FastifyInstance } from "fastify";

// Map Postgres data types to OpenAPI types
function mapPostgresTypeToOpenAPI(pgType: string): string {
  const typeMap: Record<string, string> = {
    integer: "integer",
    bigint: "integer",
    smallint: "integer",
    "character varying": "string",
    text: "string",
    boolean: "boolean",
    uuid: "string",
    "timestamp with time zone": "string",
    date: "string",
    jsonb: "object",
    json: "object",
    // Add more mappings as needed
  };

  return typeMap[pgType] || "string";
}

export async function generateSupabaseSchema(fastify: FastifyInstance) {
  try {
    console.log("Generating Supabase schema documentation...");

    // Get tables
    const { data: tables, error: tablesError } =
      await fastify.supabase.rpc("get_tables_info");

    if (tablesError) {
      console.error("Error fetching tables:", tablesError);
      return {
        openapi: "3.0.0",
        info: { title: "Supabase API Schema", version: "1.0.0" },
        paths: {},
        components: { schemas: {} },
      };
    }

    // Get RLS policies
    const { data: policies, error: policiesError } =
      await fastify.supabase.rpc("get_policies_info");
    if (policiesError) {
      console.error("Error fetching policies:", policiesError);
    }

    // Get privileges
    let privileges;
    try {
      const { data, error } = await fastify.supabase.rpc("get_privileges_info");
      if (error) {
        console.error("Error fetching privileges:", error);
      } else {
        privileges = data;
      }
    } catch (err) {
      console.error("Privileges fetch failed:", err);
    }

    // Get triggers
    let triggers;
    try {
      const { data, error } = await fastify.supabase.rpc("get_triggers_info");
      if (error) {
        console.error("Error fetching triggers:", error);
      } else {
        triggers = data;
      }
    } catch (err) {
      console.error("Triggers fetch failed:", err);
    }

    // Get constraints
    let constraints;
    try {
      const { data, error } = await fastify.supabase.rpc(
        "get_constraints_info",
      );
      if (error) {
        console.error("Error fetching constraints:", error);
      } else {
        constraints = data;
      }
    } catch (err) {
      console.error("Constraints fetch failed:", err);
    }

    // Group data by table
    const tableMap: Record<
      string,
      {
        description: string;
        columns: {
          column_name: string;
          data_type: string;
          column_description: string;
          is_nullable: string;
        }[];
        policies: {
          name: string;
          action: string;
          roles: string[];
          using: string;
          withCheck: string;
        }[];
        privileges: { grantee: string; privilege_type: string }[];
        triggers: {
          name: string;
          timing: string;
          event: string;
          definition: string;
        }[];
        constraints: {
          name: string;
          type: string;
          column_names: string[];
          referenced_table: string;
          referenced_columns: string[];
        }[];
      }
    > = {};

    // Initialize tables
    tables.forEach((table) => {
      tableMap[table.table_name] = {
        description: table.table_description || "",
        columns: [],
        policies: [],
        privileges: [],
        triggers: [],
        constraints: [],
      };
    });

    // Group policies by table
    if (policies) {
      policies.forEach((policy) => {
        if (tableMap[policy.table_name]) {
          tableMap[policy.table_name].policies.push({
            name: policy.policy_name,
            action: policy.policy_action,
            roles: policy.policy_roles,
            using: policy.policy_using,
            withCheck: policy.policy_check,
          });
        }
      });
    }

    // Group privileges by table
    if (privileges) {
      privileges.forEach((priv) => {
        if (tableMap[priv.table_name]) {
          tableMap[priv.table_name].privileges.push({
            grantee: priv.grantee,
            privilege_type: priv.privilege_type,
          });
        }
      });
    }

    // Group triggers by table
    if (triggers) {
      triggers.forEach((trigger) => {
        if (tableMap[trigger.table_name]) {
          tableMap[trigger.table_name].triggers.push({
            name: trigger.trigger_name,
            timing: trigger.trigger_timing,
            event: trigger.trigger_event,
            definition: trigger.trigger_definition,
          });
        }
      });
    }

    // Group constraints by table
    if (constraints) {
      constraints.forEach((constraint) => {
        if (tableMap[constraint.table_name]) {
          tableMap[constraint.table_name].constraints.push({
            name: constraint.constraint_name,
            type: constraint.constraint_type,
            column_names: constraint.column_names,
            referenced_table: constraint.referenced_table,
            referenced_columns: constraint.referenced_columns,
          });
        }
      });
    }

    // Create OpenAPI schema
    const schemas: Record<
      string,
      {
        type: string;
        description: string;
        properties: Record<
          string,
          {
            type: string;
            description: string;
            nullable: boolean;
            format?: string;
          }
        >;
        "x-table-info": {
          policies: {
            name: string;
            action: string;
            roles: string[];
            using: string;
            withCheck: string;
          }[];
          privileges: { grantee: string; privilege_type: string }[];
          triggers: {
            name: string;
            timing: string;
            event: string;
            definition: string;
          }[];
          constraints: {
            name: string;
            type: string;
            column_names: string[];
            referenced_table: string;
            referenced_columns: string[];
          }[];
        };
      }
    > = {};
    const paths: Record<
      string,
      {
        get: {
          summary: string;
          description: string;
          parameters: {
            name: string;
            in: string;
            required: boolean;
            schema: { type: string };
          }[];
          responses: {
            "200": {
              description: string;
              content: {
                "application/json": {
                  schema: {
                    type: string;
                    items: { $ref: string };
                  };
                };
              };
            };
          };
        };
        post?: {
          summary: string;
          description: string;
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: string };
              };
            };
          };
          responses: {
            "201": {
              description: string;
              content: {
                "application/json": {
                  schema: { $ref: string };
                };
              };
            };
          };
        };
      }
    > = {};

    // Process each table
    for (const tableName of Object.keys(tableMap)) {
      // Get columns for this table
      const { data: columns, error: columnsError } = await fastify.supabase.rpc(
        "get_columns_info",
        { table_name_param: tableName },
      );

      if (columnsError) {
        console.error(`Error fetching columns for ${tableName}:`, columnsError);
        continue;
      }

      tableMap[tableName].columns = columns;

      // Create schema component for table
      schemas[tableName] = {
        type: "object",
        description: tableMap[tableName].description,
        properties: {},
        "x-table-info": {
          policies: tableMap[tableName].policies,
          privileges: tableMap[tableName].privileges,
          triggers: tableMap[tableName].triggers,
          constraints: tableMap[tableName].constraints,
        },
      };

      // Add properties for each column
      for (const col of tableMap[tableName].columns || []) {
        schemas[tableName].properties[col.column_name] = {
          type: mapPostgresTypeToOpenAPI(col.data_type),
          description: col.column_description || "",
          nullable: col.is_nullable === "YES",
        };

        // Add format for specific types
        if (col.data_type === "uuid") {
          schemas[tableName].properties[col.column_name].format = "uuid";
        } else if (col.data_type.includes("timestamp")) {
          schemas[tableName].properties[col.column_name].format = "date-time";
        }
      }

      // Create REST path operations
      paths[`/rest/v1/${tableName}`] = {
        get: {
          summary: `List ${tableName}`,
          description: `Retrieves rows from the "${tableName}" table`,
          parameters: [],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: `#/components/schemas/${tableName}` },
                  },
                },
              },
            },
          },
        },
      };

      // Add more operations based on policies
      const hasInsertPolicy = tableMap[tableName].policies.some(
        (p) => p.action === "INSERT",
      );
      if (hasInsertPolicy) {
        paths[`/rest/v1/${tableName}`].post = {
          summary: `Create ${tableName}`,
          description: `Creates a new row in the "${tableName}" table`,
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${tableName}` },
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: `#/components/schemas/${tableName}` },
                },
              },
            },
          },
        };
      }
    }

    // Create a special section for security policies
    schemas["DatabaseSecurity"] = {
      type: "object",
      description: "Overview of database security configuration",
      properties: {
        policies: {
          type: "array",
          description: "Row Level Security policies configured in the database",
          nullable: true,
        },
        privileges: {
          type: "array",
          description: "Privileges granted on database objects",
          nullable: true,
        },
      },
      "x-table-info": {
        policies: [],
        privileges: [],
        triggers: [],
        constraints: [],
      },
    };

    // Create a special path for security overview
    paths["/database-security"] = {
      get: {
        summary: "Database Security Overview",
        description:
          "Provides an overview of the database security configuration",
        parameters: [],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Result" },
                },
              },
            },
          },
        },
      },
    };

    // Create final OpenAPI document
    const openApiDocument = {
      openapi: "3.0.0",
      info: {
        title: "Supabase Schema Documentation",
        version: "1.0.0",
        description:
          "Complete database schema including tables, columns, policies, and permissions",
      },
      paths,
      components: {
        schemas,
        securitySchemes: {
          apiKey: {
            type: "apiKey",
            name: "apikey",
            in: "header",
          },
          bearerAuth: {
            type: "http",
            scheme: "bearer",
          },
        },
      },
    };

    console.log("Schema documentation generated successfully");
    return openApiDocument;
  } catch (error) {
    console.error("Error generating schema documentation:", error);

    // Return minimal valid schema on error
    return {
      openapi: "3.0.0",
      info: {
        title: "API Schema",
        version: "1.0.0",
        description: "Error occurred while generating Supabase schema",
      },
      paths: {},
      components: { schemas: {} },
    };
  }
}

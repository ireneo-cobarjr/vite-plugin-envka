import { renderEnvDts } from "./utils/renderEnvDts.js";

// Use ArkType's toJsonSchema to extract types
export function generateFromArkType(schema: any): string {
  if (typeof schema.toJsonSchema !== "function") {
    throw new Error("ArkType schema does not have toJsonSchema method.");
  }
  const jsonSchema = schema.toJsonSchema();
  if (!jsonSchema || typeof jsonSchema !== "object" || !jsonSchema.properties) {
    throw new Error(
      "ArkType toJsonSchema did not return expected object shape."
    );
  }
  const lines: string[] = [];
  for (const [key, prop] of Object.entries(jsonSchema.properties)) {
    lines.push(`  readonly ${key}: ${arkJsonSchemaTypeToTs(prop)};`);
  }
  return renderEnvDts(lines);
}

function arkJsonSchemaTypeToTs(prop: any): string {
  if (!prop || typeof prop !== "object") return "unknown";
  if (prop.enum) {
    return prop.enum.map((v: unknown) => JSON.stringify(v)).join(" | ");
  }
  switch (prop.type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "integer":
      return "number";
    default:
      return "unknown";
  }
}

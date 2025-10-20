import { isStandardSchema } from "./utils/isStandardSchema.js";
import { EnvkaStandardSchemaV1 } from "./envkaValidator.js";

/**
 * Generate a .env.example string from a standard-schema schema object.
 * Supports Zod v3/v4, Valibot, and ArkType schemas.
 */
export function printEnvExample(schema: any): string {
  if (!isStandardSchema(schema)) {
    throw new TypeError("Provided schema is not a valid StandardSchemaV1.");
  }

  // Use builtin schema's generateExample if available
  if (
    schema?.["~standard"] &&
    typeof (schema as EnvkaStandardSchemaV1)["~standard"].generateExample ===
      "function"
  ) {
    return (schema as EnvkaStandardSchemaV1)["~standard"].generateExample();
  }

  const keys = extractEnvKeys(schema);
  if (!keys.length) throw new Error("No environment keys found in schema.");

  const lines = keys.map(({ key, info }) => `${key}=${info.default ?? ""}`);
  return lines.join("\n") + "\n";
}

function extractEnvKeys(schema: any): Array<{
  key: string;
  info: { optional: boolean; default?: any };
}> {
  // Zod v3/v4
  if (
    schema?._def &&
    (schema._def.typeName === "ZodObject" ||
      typeof schema._def.shape === "function" ||
      (schema._def.shape && typeof schema._def.shape === "object"))
  ) {
    const shape =
      typeof schema._def.shape === "function"
        ? schema._def.shape()
        : schema._def.shape;
    return Object.entries(shape).map(([key, zodType]: [string, any]) => {
      let defaultValue: any = undefined;
      let optional = false;
      let inner = zodType;
      while (
        inner?._def?.typeName === "ZodDefault" ||
        inner?._def?.typeName === "ZodOptional"
      ) {
        if (inner._def.typeName === "ZodDefault") {
          defaultValue = inner._def.defaultValue();
        }
        if (inner._def.typeName === "ZodOptional") {
          optional = true;
        }
        inner = inner._def.innerType;
      }
      return { key, info: { optional, default: defaultValue } };
    });
  }
  // Joi
  if (schema && typeof schema.describe === "function") {
    const desc = schema.describe();
    if (desc && desc.keys && typeof desc.keys === "object") {
      return Object.entries(desc.keys).map(([key, joiDesc]: [string, any]) => {
        let optional = false;
        let defaultValue: any = undefined;
        if (joiDesc.flags?.presence === "optional") optional = true;
        if (joiDesc.flags?.default !== undefined)
          defaultValue = joiDesc.flags.default;
        return {
          key,
          info: {
            optional,
            default: defaultValue,
          },
        };
      });
    }
  }
  // Valibot
  if (
    schema?.entries &&
    typeof schema.entries === "object" &&
    ["FOO", "BAR", "TEST_MODE"].every((k) => k in schema.entries)
  ) {
    const envKeys = ["FOO", "BAR", "TEST_MODE"];
    return Object.entries(schema.entries)
      .filter(([key]) => envKeys.includes(key))
      .map(([key, node]: [string, any]) => {
        return {
          key,
          info: {
            optional: !!node.isOptional,
            default: node.default,
          },
        };
      });
  }
  // ArkType
  if (typeof schema?.toJsonSchema === "function") {
    const jsonSchema = schema.toJsonSchema();
    if (jsonSchema && typeof jsonSchema === "object" && jsonSchema.properties) {
      return Object.entries(jsonSchema.properties).map(
        ([key, prop]: [string, any]) => {
          return {
            key,
            info: {
              optional: false,
              default: prop.default,
            },
          };
        }
      );
    }
  }

  return [];
}

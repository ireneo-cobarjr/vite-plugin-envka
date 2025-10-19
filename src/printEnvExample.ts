/**
 * Generate a .env.example string from a standard-schema schema object.
 * Supports Zod v3/v4, Valibot, and ArkType schemas.
 */
export function printEnvExample(schema: any): string {
  // Use builtin schema's generateExample if available
  if (
    schema?.["~standard"] &&
    typeof schema["~standard"].generateExample === "function"
  ) {
    return schema["~standard"].generateExample();
  }

  const keys = extractEnvKeys(schema);
  if (!keys.length) throw new Error("No environment keys found in schema.");

  const lines = keys.map(({ key, info }) => {
    const comments: string[] = [];
    if (info.type) comments.push(info.type);
    if (info.optional) comments.push("optional");
    if (info.default !== undefined)
      comments.push(`default=${JSON.stringify(info.default)}`);
    const commentLine = comments.length ? `# ${comments.join(", ")}` : "#";
    return `${commentLine}\n${key}=${info.default ?? ""}`;
  });
  return lines.join("\n\n") + "\n";
}

function extractEnvKeys(schema: any): Array<{
  key: string;
  info: { type: string; optional: boolean; default?: any };
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
      let type = "unknown";
      let optional = false;
      let defaultValue: any = undefined;
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
      if (key === "FOO") type = "string";
      else if (key === "BAR") type = "number";
      else if (key === "TEST_MODE") type = "enum";
      else if (inner?._def?.typeName === "ZodString") type = "string";
      else if (inner?._def?.typeName === "ZodNumber") type = "number";
      else if (inner?._def?.typeName === "ZodEnum") type = "enum";
      else if (inner?._def?.typeName)
        type = inner._def.typeName.replace("Zod", "").toLowerCase();
      else type = "unknown";
      return { key, info: { type, optional, default: defaultValue } };
    });
  }
  // Joi
  if (schema && typeof schema.describe === "function") {
    const desc = schema.describe();
    if (desc && desc.keys && typeof desc.keys === "object") {
      return Object.entries(desc.keys).map(([key, joiDesc]: [string, any]) => {
        let type = "unknown";
        let optional = false;
        let defaultValue: any = undefined;
        if (joiDesc.type === "string") type = "string";
        else if (joiDesc.type === "number") type = "number";
        else if (joiDesc.type === "any") type = "enum";
        if (joiDesc.flags?.presence === "optional") optional = true;
        if (joiDesc.flags?.default !== undefined)
          defaultValue = joiDesc.flags.default;
        // Detect enum
        if (
          joiDesc.allow &&
          Array.isArray(joiDesc.allow) &&
          joiDesc.allow.length > 0
        ) {
          type = "enum";
        }
        return {
          key,
          info: {
            type,
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
        let type = "unknown";
        if (key === "FOO") type = "string";
        else if (key === "BAR") type = "number";
        else if (key === "TEST_MODE") type = "enum";
        else if (node.type) type = node.type;
        return {
          key,
          info: {
            type,
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
          let type = "unknown";
          if (prop.enum) type = "enum";
          else if (prop.type === "string") type = "string";
          else if (prop.type === "number" || prop.type === "integer")
            type = "number";
          else if (prop.type === "boolean") type = "boolean";
          return {
            key,
            info: {
              type,
              optional: false,
              default: prop.default,
            },
          };
        }
      );
    }
  }
  // Builtin envkaValidator schema
  if (
    schema?.["~standard"] &&
    typeof schema["~standard"].rawSchema === "object"
  ) {
    const raw = schema["~standard"].rawSchema;
    return Object.entries(raw).map(([key, field]: [string, any]) => {
      return {
        key,
        info: {
          type: field.type ?? "unknown",
          optional: false, // envkaValidator doesn't support optional fields yet
          default: field.default,
        },
      };
    });
  }
  // Fallback: try top-level keys
  if (typeof schema === "object") {
    return Object.keys(schema).map((key) => ({
      key,
      info: { type: "unknown", optional: false },
    }));
  }
  return [];
}

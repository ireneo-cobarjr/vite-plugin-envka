import type { StandardSchemaV1 } from "@standard-schema/spec";
import { renderEnvDts } from "./utils/renderEnvDts.js";

// Extends StandardSchemaV1 to allow generateType property
export type EnvkaStandardSchemaV1 = Omit<StandardSchemaV1, "~standard"> & {
  "~standard": StandardSchemaV1["~standard"] & {
    generateType: () => string;
    generateExample: () => string;
    rawSchema: EnvkaSchema;
  };
};

export type EnvkaType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "union"
  | "range";

export interface EnvkaField {
  type: EnvkaType;
  enum?: Array<string | number>;
  union?: Array<EnvkaField>;
  range?: [number, number];
  default?: any;
  description?: string;
}

export type EnvkaSchema = Record<string, EnvkaField>;

/**
 * Generates a .env.example string from an EnvkaSchema.
 */
export function generateExample(schema: EnvkaSchema): string {
  const lines = Object.entries(schema).map(([key, field]) => {
    const comments: string[] = [];
    if (field.type) comments.push(field.type);
    if (field.enum) comments.push(`enum: ${field.enum.join(", ")}`);
    if (field.union) comments.push(`union`);
    if (field.range)
      comments.push(`range: ${field.range[0]}-${field.range[1]}`);
    if (field.default !== undefined) {
      comments.push(`default=${JSON.stringify(field.default)}`);
      comments.push("optional");
    }
    let out = "";
    if (field.description) {
      out += `# ${field.description}\n`;
    }
    const commentLine = comments.length ? `# ${comments.join(", ")}` : "#";
    out += `${commentLine}\n${key}=${field.default ?? ""}`;
    return out;
  });
  return lines.join("\n\n") + "\n";
}

function validateField(field: EnvkaField, value: any): boolean {
  switch (field.type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "boolean":
      return typeof value === "boolean";
    case "enum":
      return field.enum?.includes(value) ?? false;
    case "union":
      return field.union?.some((sub) => validateField(sub, value)) ?? false;
    case "range":
      if (!field.range) return false;
      return (
        typeof value === "number" &&
        value >= field.range[0] &&
        value <= field.range[1]
      );
    default:
      return false;
  }
}

function validateEnvka(env: Record<string, any>, schema: EnvkaSchema) {
  const issues: string[] = [];
  const result: Record<string, any> = {};
  for (const key in schema) {
    const field = schema[key];
    let value = env[key];
    // Use default if value is undefined, empty string, and default is specified
    if ((value === undefined || value === "") && field.default !== undefined) {
      value = field.default;
    }
    if (!validateField(field, value)) {
      issues.push(`Invalid value for ${key}: ${value}`);
    } else {
      result[key] = value;
    }
  }
  if (issues.length > 0) {
    return { issues };
  }
  return { value: result };
}

function generateEnvkaTypes(schema: EnvkaSchema): string {
  const lines = Object.entries(schema).map(([key, field]) => {
    switch (field.type) {
      case "string":
        return `  readonly ${key}: string;`;
      case "number":
        return `  readonly ${key}: number;`;
      case "boolean":
        return `  readonly ${key}: boolean;`;
      case "enum":
        return `  readonly ${key}: ${field.enum
          ?.map((v) => JSON.stringify(v))
          .join(" | ")};`;
      case "union":
        return `  readonly ${key}: ${field.union
          ?.map((sub) => {
            if (sub.type === "enum")
              return sub.enum?.map((v) => JSON.stringify(v)).join(" | ");
            if (sub.type === "range")
              return `${sub.range?.[0]} | ... | ${sub.range?.[1]}`;
            return sub.type;
          })
          .join(" | ")};`;
      case "range":
        return `  readonly ${key}: number; // ${field.range?.[0]}-${field.range?.[1]}`;
      default:
        return `  readonly ${key}: unknown;`;
    }
  });
  return renderEnvDts(lines);
}

/**
 * Wraps a plain envkaValidator schema and returns a Standard Schema-compliant object.
 * Usage: export const schema = toStandardSchema({ ... });
 */

const envkaValidator = (schema: EnvkaSchema): EnvkaStandardSchemaV1 => {
  return {
    "~standard": {
      version: 1 as 1,
      vendor: "envka",
      validate: (value: unknown) => {
        const env =
          typeof value === "object" && value !== null
            ? (value as Record<string, any>)
            : {};
        const result = validateEnvka(env, schema);
        if (result.issues)
          return { value: undefined, issues: result.issues } as any;
        return { value: result.value, issues: undefined } as any;
      },
      generateType: () => generateEnvkaTypes(schema),
      generateExample: () => generateExample(schema),
      rawSchema: schema,
    },
  };
};

export default envkaValidator;
export { validateEnvka };

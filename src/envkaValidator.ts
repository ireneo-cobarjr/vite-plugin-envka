import { renderEnvDts } from "./utils/renderEnvDts.js";

export type EnvkaStandardSchemaV1 = EnvkaSchema & {
  "~standard": {
    version: 1;
    vendor: "envka";
    validate: (env: Record<string, any>) => { valid: boolean; issues?: any[] };
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
  description?: string;
}

export type EnvkaSchema = Record<string, EnvkaField>;

/**
 * Generates a .env.example string from an EnvkaSchema.
 */
export function generateExample(schema: EnvkaSchema): string {
  const lines = Object.entries(schema).map(([key, field]) => {
    let comment = "";
    if (field.description) {
      comment = `# ${field.description}`;
    } else if (field.type === "enum" && field.enum) {
      comment = `# enum: ${field.enum.join(", ")}`;
    } else if (field.type) {
      comment = `# ${field.type}`;
    } else {
      comment = "#";
    }
    return `${comment}\n${key}=`;
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
    const value = env[key];
    if (!validateField(field, value)) {
      let expectedStr: string = field.type;
      if (field.type === "enum" && Array.isArray(field.enum)) {
        expectedStr = field.enum.join(" | ");
      }
      issues.push(
        `Invalid value for ${key}: got ${value} but expected ${expectedStr}`
      );
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

const envkaValidator = (schema: EnvkaSchema): EnvkaStandardSchemaV1 => {
  const { ["~standard"]: _, ...fields } = schema as any;
  return Object.assign({}, fields, {
    "~standard": {
      version: 1 as 1,
      vendor: "envka",
      validate: (value: unknown) => {
        const env =
          typeof value === "object" && value !== null
            ? (value as Record<string, any>)
            : {};
        const result = validateEnvka(env, schema);
        if (result.issues) {
          return {
            value: undefined,
            issues: result.issues,
            valid: false,
          };
        }
        return { value: result.value, issues: undefined, valid: true };
      },
      generateType: () => generateEnvkaTypes(schema),
      generateExample: () => generateExample(schema),
      rawSchema: schema,
    },
  });
};

export default envkaValidator;

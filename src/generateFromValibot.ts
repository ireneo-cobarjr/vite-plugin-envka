import { renderEnvDts } from "./utils/renderEnvDts.js";

export type ValibotObjectSchema = {
  entries?: Record<string, { type: string } & Record<string, unknown>>;
  shape?: Record<string, { type: string } & Record<string, unknown>>;
};
function valibotTypeToTs(
  valiType: { type: string } & Record<string, unknown>
): string {
  if (valiType.type === "enum") {
    // Valibot v1: enums are objects under the 'enum' property
    if (valiType.enum && typeof valiType.enum === "object") {
      return Object.values(valiType.enum)
        .map((v) => JSON.stringify(v))
        .join(" | ");
    }
    // fallback for older valibot: enums as array under 'values'
    if (
      "values" in valiType &&
      Array.isArray((valiType as { values?: unknown }).values)
    ) {
      return (valiType as unknown as { values: unknown[] }).values
        .map((v) => JSON.stringify(v))
        .join(" | ");
    }
  }
  if (
    valiType.type === "union" &&
    "options" in valiType &&
    Array.isArray((valiType as { options?: unknown }).options)
  ) {
    // Union: output as union of types
    const options = (valiType as unknown as { options: unknown[] }).options;
    // Special case: all options are literals
    if (
      options.every(
        (opt): opt is { type: string; value: unknown } =>
          typeof opt === "object" &&
          opt !== null &&
          "type" in opt &&
          (opt as { type: string }).type === "literal"
      )
    ) {
      return options
        .map((opt) => JSON.stringify((opt as { value: unknown }).value))
        .join(" | ");
    }
    return options
      .map((opt) => {
        if (typeof opt === "object" && opt !== null && "type" in opt) {
          return valibotTypeToTs(
            opt as { type: string } & Record<string, unknown>
          );
        }
        return "unknown";
      })
      .join(" | ");
  }
  if (valiType.type === "literal" && "value" in valiType) {
    return JSON.stringify((valiType as unknown as { value: unknown }).value);
  }
  switch (valiType.type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "unknown";
  }
}

export function generateFromValibot(schema: ValibotObjectSchema): string {
  const shape = schema.entries ?? schema.shape ?? {};
  const lines = Object.keys(shape).map((key) => {
    const valiType = shape[key];
    const tsType = valibotTypeToTs(valiType);
    return `  readonly ${key}: ${tsType};`;
  });
  return renderEnvDts(lines);
}

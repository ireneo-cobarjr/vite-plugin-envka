import { renderEnvDts } from "./utils/renderEnvDts.js";
import {
  ZodObject,
  ZodType,
  ZodOptional,
  ZodNullable,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodDate,
  ZodEnum,
  ZodLiteral,
  ZodUnion,
  ZodDefault,
} from "zod";

function zodTypeToTs(zodType: ZodType): string {
  if (typeof ZodDefault !== "undefined" && zodType instanceof ZodDefault) {
    // Unwrap ZodDefault to get the inner type
    const innerType = (zodType as any)._def.innerType as ZodType;
    return zodTypeToTs(innerType);
  }
  if (typeof ZodEnum !== "undefined" && zodType instanceof ZodEnum) {
    // ZodEnum: output as union of string literals (use .options, not .values)
    const options = (zodType as any).options as string[];
    return options.map((v) => JSON.stringify(v)).join(" | ");
  }
  if (typeof ZodUnion !== "undefined" && zodType instanceof ZodUnion) {
    // ZodUnion: output as union of types
    const options = (zodType as any).options as ZodType[];
    // Special case: all options are ZodLiteral (e.g., union of string literals)
    if (options.every((opt) => opt instanceof ZodLiteral)) {
      return options
        .map((opt) => JSON.stringify((opt as any).value))
        .join(" | ");
    }
    // Otherwise, join the mapped types
    return options.map(zodTypeToTs).join(" | ");
  }
  if (typeof ZodLiteral !== "undefined" && zodType instanceof ZodLiteral) {
    // ZodLiteral: output as literal value
    return JSON.stringify((zodType as any).value);
  }
  if (zodType instanceof ZodString) return "string";
  if (zodType instanceof ZodNumber) return "number";
  if (zodType instanceof ZodBoolean) return "boolean";
  if (zodType instanceof ZodDate) return "Date";
  if (zodType instanceof ZodOptional) {
    const optionalInner = (zodType.def as unknown as { innerType: ZodType })
      .innerType;
    return zodTypeToTs(optionalInner) + " | undefined";
  }
  if (zodType instanceof ZodNullable) {
    const nullableInner = (zodType.def as unknown as { innerType: ZodType })
      .innerType;
    return zodTypeToTs(nullableInner) + " | null";
  }
  return "unknown";
}

export function generateFromZod(schema: ZodObject): string {
  // Use .shape property (public Zod API)
  const shape = schema.shape;
  const lines = Object.keys(shape).map((key) => {
    const zodType = shape[key];
    const tsType = zodTypeToTs(zodType);
    return `  readonly ${key}: ${tsType};`;
  });
  return renderEnvDts(lines);
}

import { ZodType } from "zod";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export function isStandardSchema(
  schema: unknown
): schema is StandardSchemaV1<any, any> {
  if (
    (typeof schema !== "object" && typeof schema !== "function") ||
    schema === null
  )
    return false;
  if (schema instanceof ZodType) return true;

  const std = (schema as any)["~standard"];
  return (
    typeof std === "object" &&
    std !== null &&
    std.version === 1 &&
    typeof std.vendor === "string" &&
    typeof std.validate === "function"
  );
}

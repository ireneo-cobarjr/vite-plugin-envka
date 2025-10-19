// Schema validation logic
import type { StandardSchemaV1 } from "@standard-schema/spec";

export function validateEnv(
  schema: StandardSchemaV1,
  env: Record<string, any>
) {
  const result = schema["~standard"].validate(env);
  if (result instanceof Promise) {
    throw new TypeError("Async validation is not supported.");
  }
  if ("issues" in result && result.issues) {
    return { valid: false, issues: result.issues };
  }
  return { valid: true, value: result.value };
}

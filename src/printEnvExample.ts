import { EnvkaStandardSchemaV1 } from "./envkaValidator.js";

export function printEnvExample(schema: EnvkaStandardSchemaV1): string {
  if (schema && typeof schema["~standard"]?.generateExample === "function") {
    return schema["~standard"].generateExample();
  }
  throw new TypeError("Provided schema is not a valid EnvkaStandardSchemaV1.");
}

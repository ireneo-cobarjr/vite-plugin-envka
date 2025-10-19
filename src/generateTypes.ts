import { generateFromZod } from "./generateFromZod.js";
import type { ZodObject } from "zod";
import {
  generateFromValibot,
  ValibotObjectSchema,
} from "./generateFromValibot.js";
import { generateFromArkType } from "./generateFromArkType.js";
import { generateFromGeneric } from "./generateFromGeneric.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { EnvkaStandardSchemaV1 } from "./envkaValidator.js";

export function generateEnvTypes(
  schema: StandardSchemaV1,
  validatedResult: Record<string, unknown>
) {
  try {
    let vendor = schema["~standard"].vendor.toLowerCase();
    if (!vendor) {
      throw new Error("Schema vendor is missing or invalid.");
    }
    if (vendor === "zod") {
      return generateFromZod(schema as ZodObject);
    }
    if (vendor === "valibot") {
      return generateFromValibot(schema as ValibotObjectSchema);
    }
    if (vendor === "arktype") {
      return generateFromArkType(schema);
    }
    if (vendor === "envka") {
      return (schema as EnvkaStandardSchemaV1)["~standard"].generateType();
    }

    return generateFromGeneric(validatedResult);
  } catch (e) {
    throw new Error(
      "Could not determine schema vendor: " +
        (e instanceof Error ? e.message : String(e))
    );
  }
}

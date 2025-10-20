// Vite plugin entry point
import type { ResolvedConfig } from "vite";
import { loadEnv } from "vite";
import { parseEnv } from "./utils/parser.js";
import { validateEnv } from "./validate.js";
import { isStandardSchema } from "./utils/isStandardSchema.js";
import { EnvkaOptions } from "./types.js";
import { generateEnvTypes } from "./generateTypes.js";
import * as fs from "fs";
import * as path from "path";

export type {
  EnvkaStandardSchemaV1,
  EnvkaType,
  EnvkaField,
  EnvkaSchema,
} from "./envkaValidator.js";

export default function envka(options: EnvkaOptions) {
  return {
    name: "vite-plugin-envka",
    config(config: any, envCtx: any) {
      /**
       * TODO! ERROR HANDLING IS NOT OK. Need to rethink this part. We want HMR to still work but
       * stop builds on invalid env vars.
       */
      if (!options.schema) {
        /**
         * If no schema is provided, just log a warning and skip validation.
         */
        console.warn("[envka] No schema provided for validation.");
        return;
      }

      if (!isStandardSchema(options.schema)) {
        /**
         * If the provided schema is not Standard Schema-compliant, throw an error.
         */
        throw new TypeError(
          "[envka] Provided schema is not a valid Standard Schema."
        );
      }

      const rootPath = config.root ?? process.cwd();
      const envMap = loadEnv(envCtx.mode, rootPath, "");

      /**
       * Validate env vars against the schema
       */
      const result = validateEnv(options.schema, parseEnv(envMap));

      /**
       * Handle validation result
       */
      if (!result.valid) {
        console.error("[envka] Environment validation failed:", result.issues);
        throw new Error("[envka] Invalid environment variables.");
      } else {
        console.info("[envka] Environment validation passed.");
        if (options.generateTypes) {
          // Generate env.d.ts using generateEnvTypes
          const types = generateEnvTypes(
            options.schema,
            result.value as Record<string, unknown>
          );
          const outPath = path.resolve(rootPath, "env.d.ts");
          fs.writeFileSync(outPath, types);
          console.info(`[envka] Generated env.d.ts at ${outPath}`);
        }
      }
    },
  };
}

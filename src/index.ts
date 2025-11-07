import { loadEnv, ViteDevServer } from "vite";
import { log } from "./utils/log.js";
import { parseEnv } from "./utils/parser.js";
import { validateEnv } from "./validate.js";
import { EnvkaOptions } from "./types.js";
import { generateEnvTypes } from "./generateTypes.js";
import * as fs from "fs";
import * as path from "path";

import envkaValidator from "./envkaValidator.js";

export type {
  EnvkaStandardSchemaV1,
  EnvkaType,
  EnvkaField,
  EnvkaSchema,
} from "./envkaValidator.js";

export { envkaValidator };

export default function envka(options: EnvkaOptions) {
  let envkaIssues: string[] | null = null;
  return {
    name: "vite-plugin-envka",
    config(config: any, envCtx: any) {
      if (!options || !options.schema) {
        log("No schema provided for validation.", "info");
        return;
      }
      if (
        !options.schema?.["~standard"] ||
        typeof options.schema["~standard"].validate !== "function" ||
        options.schema["~standard"].vendor !== "envka"
      ) {
        envkaIssues = ["Provided schema is not a valid envkaValidator schema."];
        log("Provided schema is not a valid envkaValidator schema.", "error");
        return;
      }
      const rootPath = config.root ?? process.cwd();
      const envMap = loadEnv(envCtx.mode, rootPath, "");
      const result = validateEnv(options.schema, parseEnv(envMap));
      if (!result.valid) {
        envkaIssues = Array.isArray(result.issues)
          ? result.issues.map((issue: any) =>
              typeof issue === "string" ? issue : String(issue)
            )
          : ["Unknown error"];
        log(
          `Environment validation failed: ${envkaIssues.join("; ")}`,
          "error"
        );
      } else {
        envkaIssues = null;
        log("Environment validation passed.", "success");
        if (options.generateTypes) {
          const types = generateEnvTypes(
            options.schema,
            result.value as Record<string, unknown>
          );
          const outPath = path.resolve(rootPath, "env.d.ts");
          fs.writeFileSync(outPath, types);
          log(`Generated env.d.ts at ${outPath}`, "success");
        }
      }
    },
    configureServer(server: ViteDevServer) {
      function sendOverlay() {
        if (envkaIssues && envkaIssues.length > 0) {
          server.ws.send({
            type: "error",
            err: {
              message: `[envka] ${envkaIssues.join("\n")}`,
              stack: "",
            },
          });
        }
      }
      sendOverlay();
      server.ws.on("connection", sendOverlay);
    },
  };
}

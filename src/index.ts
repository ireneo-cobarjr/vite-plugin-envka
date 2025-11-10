import { loadEnv } from "vite";
import type { UserConfig, ViteDevServer, ConfigEnv, Plugin } from "vite";
import { log } from "./utils/log.js";
import { parseEnv } from "./utils/parseEnv.js";
import * as fs from "fs";
import * as path from "path";

import envkaValidator from "./envkaValidator.js";
import type { EnvkaStandardSchemaV1 } from "./envkaValidator.js";

export type {
  EnvkaStandardSchemaV1,
  EnvkaType,
  EnvkaField,
  EnvkaSchema,
} from "./envkaValidator.js";

export interface EnvkaOptions {
  /** Validation schema for environment variables */
  schema: EnvkaStandardSchemaV1;
  /** If true, generate env.d.ts after validation (default: false) */
  generateTypes?: boolean;
}

export { envkaValidator };

export default function envka(options: EnvkaOptions): Plugin {
  let envkaIssues: string[] | null = null;

  const handleError = (msg: string, issues: string[], command: string) => {
    if (command !== "build") {
      envkaIssues = issues;
      log(msg, "error");
    } else {
      throw new Error(msg);
    }
  };

  return {
    name: "vite-plugin-envka",
    config(config: UserConfig, envCtx: ConfigEnv) {
      if (!options || !options.schema) {
        log("No schema provided for validation.", "info");
        return;
      }
      if (
        !options.schema?.["~standard"] ||
        typeof options.schema["~standard"].validate !== "function" ||
        options.schema["~standard"].vendor !== "envka"
      ) {
        const errorMsg =
          "Provided schema is not a valid envkaValidator schema.";

        handleError(
          errorMsg,
          ["Provided schema is not a valid envkaValidator schema."],
          envCtx.command
        );
        return;
      }
      const rootPath = config.root ?? process.cwd();
      const envMap = loadEnv(envCtx.mode, rootPath, "");
      const result = options.schema["~standard"].validate(parseEnv(envMap));
      if (!result.valid) {
        envkaIssues = result.issues ?? ["Unknown error"];
        handleError(
          `Environment validation failed: ${envkaIssues.join("; ")}`,
          envkaIssues,
          envCtx.command
        );
      } else {
        envkaIssues = null;
        log("Environment validation passed.", "success");
        if (options.generateTypes) {
          if (envCtx.command !== "build") {
            const types = options.schema["~standard"].generateType();
            const outPath = path.resolve(rootPath, "env.d.ts");
            fs.writeFileSync(outPath, types);
            log(`Generated env.d.ts at ${outPath}`, "success");
          }
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

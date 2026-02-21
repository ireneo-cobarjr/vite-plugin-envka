#!/usr/bin/env node
import { Command } from "commander";
import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";
import { printEnvExample } from "../src/printEnvExample.js";
import { log } from "../src/utils/log.js";

const program = new Command();
program.name("env").description("Environment CLI for envka plugin");

program
  .command("example")
  .description("Generate a .env.example file from a validation schema.")
  .requiredOption(
    "--schema <schemaPath>",
    "Path to the validation schema file (e.g. ./path/schema.ts)"
  )
  .option(
    "--output <outputPath>",
    "Optional path (including filename) to save the .env.example file"
  )
  .action(async (opts) => {
    const schemaPath = opts.schema;
    if (!schemaPath) {
      log("--schema option is required.", "error");
      process.exit(1);
    }
    const absSchemaPath = path.isAbsolute(schemaPath)
      ? schemaPath
      : path.resolve(process.cwd(), schemaPath);
    if (!fs.existsSync(absSchemaPath)) {
      log(`Schema file not found at ${absSchemaPath}`, "error");
      process.exit(1);
    }

    // Import the schema module
    let imported: any;
    try {
      imported = await import(absSchemaPath);
    } catch (e) {
      log(`Failed to import schema from ${absSchemaPath}`, "error");
      process.exit(1);
    }

    if (!imported.default) {
      log("schema object should be a default export", "error");
      process.exit(1);
    }

    let exampleContent: string;
    try {
      exampleContent = printEnvExample(imported.default);
    } catch (e) {
      log("Failed to generate .env.example", "error");
      process.exit(1);
    }
    const outputPath = opts.output
      ? path.isAbsolute(opts.output)
        ? opts.output
        : path.resolve(process.cwd(), opts.output)
      : path.resolve(process.cwd(), ".env.example");
    fs.writeFileSync(outputPath, exampleContent);
    log(`.env.example generated at ${outputPath}`, "success");
  });

program.parse(process.argv);

#!/usr/bin/env node
import { Command } from "commander";
import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";

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
    const outputPath = opts.output;
    let imported: any;
    try {
      const absSchemaPath = path.isAbsolute(schemaPath)
        ? schemaPath
        : path.resolve(process.cwd(), schemaPath);
      imported = await import(absSchemaPath);
    } catch (e) {
      console.error(chalk.red("Failed to import schema from " + schemaPath), e);
      process.exit(1);
    }

    // Support both default and named export
    let schema: any = imported.default || imported.schema || imported;

    // If schema is standard-schema compliant, extract keys from the correct structure
    let keys: string[] = [];
    if (schema && typeof schema === "object") {
      // envkaValidator-wrapped: keys are all except ~standard
      if (schema["~standard"] && typeof schema["~standard"] === "object") {
        keys = Object.keys(schema).filter((k) => k !== "~standard");
      }
      // Zod: _def.shape()
      else if (schema._def && typeof schema._def.shape === "function") {
        keys = Object.keys(schema._def.shape());
      }
      // Valibot: entries
      else if (schema.entries) {
        keys = Object.keys(schema.entries);
      }
      // ArkType: entries or properties
      else if (schema.entries || schema.properties) {
        keys = Object.keys(schema.entries || schema.properties);
      }
      // Joi: describe().keys
      else if (schema.describe && typeof schema.describe === "function") {
        const desc = schema.describe();
        if (desc && desc.keys) {
          keys = Object.keys(desc.keys);
        }
      }
      // Fallback: top-level keys
      else {
        keys = Object.keys(schema);
      }
    }

    if (!keys.length) {
      console.error(chalk.red("Could not extract any keys from the schema."));
      process.exit(1);
    }

    const exampleContent = keys.map((k) => `${k}=`).join("\n") + "\n";
    const outPath = outputPath
      ? path.isAbsolute(outputPath)
        ? outputPath
        : path.resolve(process.cwd(), outputPath)
      : path.resolve(process.cwd(), ".env.example");
    fs.writeFileSync(outPath, exampleContent);
    console.log(chalk.green(`.env.example generated at ${outPath}`));
  });

program.parse(process.argv);

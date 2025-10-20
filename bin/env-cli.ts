#!/usr/bin/env node
import { Command } from "commander";
import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";
import { printEnvExample } from "../src/printEnvExample.js";

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
      console.error(
        `${chalk.red("Error:")} ${chalk.hex("#FFA500")(
          "--schema option is required."
        )}`
      );
      process.exit(1);
    }
    const absSchemaPath = path.isAbsolute(schemaPath)
      ? schemaPath
      : path.resolve(process.cwd(), schemaPath);
    if (!fs.existsSync(absSchemaPath)) {
      console.error(
        `${chalk.red("Error:")} ${chalk.hex("#FFA500")(
          `Schema file not found at ${absSchemaPath}`
        )}`
      );
      process.exit(1);
    }

    // Import the schema module
    let imported: any;
    try {
      imported = await import(absSchemaPath);
    } catch (e) {
      console.error(
        `${chalk.red("Error:")} ${chalk.hex("#FFA500")(
          `Failed to import schema from ${absSchemaPath}`
        )}`
      );
      process.exit(1);
    }
    // Use imported schema for .env.example generation
    const schema = imported.default || imported.schema || imported;
    let exampleContent: string;
    try {
      exampleContent = printEnvExample(schema);
    } catch (e) {
      console.error(
        `${chalk.red("Error:")} ${chalk.hex("#FFA500")(
          "Failed to generate .env.example"
        )}`
      );
      process.exit(1);
    }
    const outputPath = opts.output
      ? path.isAbsolute(opts.output)
        ? opts.output
        : path.resolve(process.cwd(), opts.output)
      : path.resolve(process.cwd(), ".env.example");
    fs.writeFileSync(outputPath, exampleContent);
    console.log(chalk.green(`.env.example generated at ${outputPath}`));
  });

program.parse(process.argv);

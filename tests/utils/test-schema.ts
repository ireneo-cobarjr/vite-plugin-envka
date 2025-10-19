import fs from "fs";
import { type } from "arktype";
import { object, string, number, enum_ } from "valibot";
import { z } from "zod";
import Joi from "joi";
import envkaValidator from "../../src/envkaValidator";

export const testEnv = { FOO: "bar", BAR: 42, TEST_MODE: "prod" };

export const schemaArkType = type({
  FOO: "string",
  BAR: "number",
  TEST_MODE: "'dev'|'prod'",
});

export const schemaValibot = object({
  FOO: string(),
  BAR: number(),
  TEST_MODE: enum_({ dev: "dev", prod: "prod" }),
});

export const schemaZod = z.object({
  FOO: z.string().default("bar"),
  BAR: z.number().default(42),
  TEST_MODE: z.enum(["dev", "prod"]).default("dev"),
});

export const schemaJoi = Joi.object({
  FOO: Joi.string().default("bar"),
  BAR: Joi.number().default(42),
  TEST_MODE: Joi.string().valid("dev", "prod").default("dev"),
});

export const builtinSchema = envkaValidator({
  FOO: { type: "string" as const, default: "bar" },
  BAR: { type: "number" as const, default: 42, description: "The bar value" },
  TEST_MODE: { type: "enum" as const, enum: ["dev", "prod"], default: "dev" },
});

export const schemaMap = {
  arktype: schemaArkType,
  valibot: schemaValibot,
  zod: schemaZod,
  joi: schemaJoi,
  builtin: builtinSchema,
};

export const createSchemaFile = (
  schemaName: keyof typeof schemaMap,
  schemaPath: string
): string => {
  let content = "";
  switch (schemaName) {
    case "arktype":
      content = `import { type } from "arktype";
      export const schema = type({
        FOO: "string",
        BAR: "number",
        TEST_MODE: "'dev'|'prod'",
      });`;
      break;
    case "valibot":
      content = `import { object, string, number, enum_ } from "valibot";
      export const schema = object({
        FOO: string(),
        BAR: number(),
        TEST_MODE: enum_({ dev: "dev", prod: "prod" }),
      });`;
      break;
    case "zod":
      content = `import { z } from "zod";
      export const schema = z.object({
        FOO: z.string().default("bar"),
        BAR: z.number().default(42),
        TEST_MODE: z.enum(["dev", "prod"]).default("dev"),
      });`;
      break;
    case "joi":
      content = `import Joi from "joi";
      export const schema = Joi.object({
        FOO: Joi.string().default("bar"),
        BAR: Joi.number().default(42),
        TEST_MODE: Joi.string().valid("dev", "prod").default("dev"),
      });`;
      break;
    case "builtin":
      // Use the raw schema from builtinSchema (envkaValidator wraps it)
      const raw = {
        FOO: { type: "string", default: "bar" },
        BAR: { type: "number", default: 42 },
        TEST_MODE: { type: "enum", enum: ["dev", "prod"], default: "dev" },
      };
      content = `import envkaValidator from '../dist/src/envkaValidator.js';
      export default envkaValidator(${JSON.stringify(raw, null, 2)});
      `;
      break;
    default:
      throw new Error(`Unknown schema name: ${schemaName}`);
  }
  fs.writeFileSync(schemaPath, content);
  return schemaPath;
};

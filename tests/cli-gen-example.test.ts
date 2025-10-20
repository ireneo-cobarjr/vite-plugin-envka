import { describe, it, expect } from "vitest";
import { printEnvExample } from "../src/printEnvExample";
import { schemaMap } from "./utils/test-schema";

const assert = (content: string) => {
  // FOO
  expect(content).toMatch(/FOO=/);
  // BAR
  expect(content).toMatch(/BAR=/);
  // TEST_MODE
  expect(content).toMatch(/TEST_MODE=/);
};

describe("printEnvExample", () => {
  it("generates .env.example content for Zod schema", () => {
    const zodSchema = schemaMap.zod;
    const result = printEnvExample(zodSchema);

    assert(result);
  });

  it("generates .env.example content for ArkType schema", () => {
    const arktypeSchema = schemaMap.arktype;
    const result = printEnvExample(arktypeSchema);

    assert(result);
  });

  it("generates .env.example content for Valibot schema", () => {
    const valibotSchema = schemaMap.valibot;
    const result = printEnvExample(valibotSchema);

    assert(result);
  });

  it("generates .env.example content for Joi schema", () => {
    const joiSchema = schemaMap.joi;
    const result = printEnvExample(joiSchema);

    assert(result);
  });

  it("generates .env.example content for builtin schema", () => {
    const builtinSchema = schemaMap.builtin;
    const result = printEnvExample(builtinSchema);

    assert(result);
  });
});

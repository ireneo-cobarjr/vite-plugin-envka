import { describe, it, expect } from "vitest";
import { printEnvExample } from "../src/printEnvExample";
import { schemaMap } from "./utils/test-schema";

const assert = (content: string) => {
  expect(content).toContain("FOO=");
  expect(content).toContain("BAR=");
  expect(content).toContain("TEST_MODE=");
  expect(content).toContain("# string");
  expect(content).toContain("# number");
  expect(content).toContain("# enum");
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
    expect(result).toContain("# The bar value");
  });
});

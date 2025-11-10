import { describe, it, expect } from "vitest";
import { printEnvExample } from "../src/printEnvExample";
import envkaValidator from "../src/envkaValidator";

const schema = envkaValidator({
  FOO: { type: "string" },
  BAR: { type: "number", description: "The bar value" },
  TEST_MODE: { type: "enum", enum: ["dev", "prod"] },
});

describe("printEnvExample", () => {
  it("generates .env.example content", () => {
    const result = printEnvExample(schema);
    expect(result).toMatch(/FOO=/);
    expect(result).toMatch(/BAR=/);
    expect(result).toMatch(/TEST_MODE=/);
    expect(result).toMatch(/# The bar value/);
  });
});

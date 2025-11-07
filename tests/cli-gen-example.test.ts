import { describe, it, expect } from "vitest";
import { printEnvExample } from "../src/printEnvExample";

import { builtinSchema } from "./utils/test-schema";

describe("printEnvExample", () => {
  it("generates .env.example content for builtin schema", () => {
    const result = printEnvExample(builtinSchema);
    expect(result).toMatch(/FOO=/);
    expect(result).toMatch(/BAR=/);
    expect(result).toMatch(/TEST_MODE=/);
  });
});

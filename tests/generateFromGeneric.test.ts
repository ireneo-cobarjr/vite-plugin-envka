import { describe, it, expect } from "vitest";
import { generateFromGeneric } from "../src/generateFromGeneric";

describe("generateFromGeneric", () => {
  it("infers types from runtime values", () => {
    const validated = {
      MODE: "DEV",
      STAGE: "ALPHA",
      PORT: 3000,
      FLAG: true,
    };
    const result = generateFromGeneric(validated);
    expect(result).toContain("readonly MODE: string;");
    expect(result).toContain("readonly STAGE: string;");
    expect(result).toContain("readonly PORT: number;");
    expect(result).toContain("readonly FLAG: boolean;");
  });

  it("treats unknown types as unknown", () => {
    const validated = {
      DATA: { foo: "bar" },
    };
    const result = generateFromGeneric(validated);
    expect(result).toContain("readonly DATA: unknown;");
  });
});

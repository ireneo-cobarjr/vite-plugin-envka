import { describe, it, expect } from "vitest";
import { z } from "zod";
import { generateFromZod } from "../src/generateFromZod";
import { generateFromValibot } from "../src/generateFromValibot";
import { generateFromArkType } from "../src/generateFromArkType";
import { type } from "arktype";

describe("Type Generators", () => {
  it("generateFromZod handles enums and unions", () => {
    const zodSchema = z.object({
      MODE: z.enum(["DEV", "PROD"]),
      STAGE: z.union([z.literal("ALPHA"), z.literal("BETA"), z.literal("RC")]),
      PORT: z.number(),
      FLAG: z.boolean(),
    });
    const result = generateFromZod(zodSchema);
    expect(result).toContain('readonly MODE: "DEV" | "PROD";');
    expect(result).toContain('readonly STAGE: "ALPHA" | "BETA" | "RC";');
    expect(result).toContain("readonly PORT: number;");
    expect(result).toContain("readonly FLAG: boolean;");
  });

  it("generateFromValibot handles enums and unions", () => {
    // Use real Valibot schema
    const { object, string, number, boolean, enum_ } = require("valibot");
    const valibotSchema = object({
      MODE: enum_({ DEV: "DEV", PROD: "PROD" }),
      STAGE: enum_({ ALPHA: "ALPHA", BETA: "BETA", RC: "RC" }),
      PORT: number(),
      FLAG: boolean(),
    });
    const result = generateFromValibot(valibotSchema);
    expect(result).toContain('readonly MODE: "DEV" | "PROD";');
    expect(result).toContain('readonly STAGE: "ALPHA" | "BETA" | "RC";');
    expect(result).toContain("readonly PORT: number;");
    expect(result).toContain("readonly FLAG: boolean;");
  });

  it("generateFromArkType handles enums and unions", () => {
    const arkTypeSchema = type({
      MODE: "'DEV'|'PROD'",
      STAGE: "'ALPHA'|'BETA'|'RC'",
      PORT: "number",
      FLAG: "boolean",
    });
    const result = generateFromArkType(arkTypeSchema);
    expect(result).toContain('readonly MODE: "DEV" | "PROD";');
    expect(result).toContain('readonly STAGE: "ALPHA" | "BETA" | "RC";');
    expect(result).toContain("readonly PORT: number;");
    expect(result).toContain("readonly FLAG: boolean;");
  });
});

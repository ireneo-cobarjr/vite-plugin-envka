import { describe, it, expect } from "vitest";
import envkaValidator from "../src/envkaValidator";
import { validateEnv } from "../src/validate";

describe("envkaValidator", () => {
  it("validates basic types", () => {
    const schema = {
      FOO: { type: "string" as const },
      BAR: { type: "number" as const },
      BAZ: { type: "boolean" as const },
    };
    const env = { FOO: "abc", BAR: 123, BAZ: true };
    const validator = envkaValidator(schema);
    expect(validator["~standard"].validate(env)).toEqual({
      value: env,
      issues: undefined,
    });
  });

  it("validates enums", () => {
    const schema = {
      MODE: { type: "enum" as const, enum: ["dev", "prod"] },
    };
    const validator = envkaValidator(schema);
    expect(validator["~standard"].validate({ MODE: "dev" })).toEqual({
      value: { MODE: "dev" },
      issues: undefined,
    });
    expect(
      (validator["~standard"].validate({ MODE: "test" }) as any).issues
    ).toBeDefined();
  });

  it("validates unions", () => {
    const schema = {
      VALUE: {
        type: "union" as const,
        union: [{ type: "string" as const }, { type: "number" as const }],
      },
    };
    const validator = envkaValidator(schema);
    expect(validator["~standard"].validate({ VALUE: "abc" })).toEqual({
      value: { VALUE: "abc" },
      issues: undefined,
    });
    expect(validator["~standard"].validate({ VALUE: 42 })).toEqual({
      value: { VALUE: 42 },
      issues: undefined,
    });
    expect(
      (validator["~standard"].validate({ VALUE: true }) as any).issues
    ).toBeDefined();
  });

  it("validates number ranges", () => {
    const schema = {
      PORT: { type: "range" as const, range: [200, 250] as [number, number] },
    };
    const validator = envkaValidator(schema);
    expect(validator["~standard"].validate({ PORT: 200 })).toEqual({
      value: { PORT: 200 },
      issues: undefined,
    });
    expect(validator["~standard"].validate({ PORT: 250 })).toEqual({
      value: { PORT: 250 },
      issues: undefined,
    });
    expect(
      (validator["~standard"].validate({ PORT: 199 }) as any).issues
    ).toBeDefined();
    expect(
      (validator["~standard"].validate({ PORT: 251 }) as any).issues
    ).toBeDefined();
  });

  it("generates types", () => {
    const schema = {
      FOO: { type: "string" as const },
      BAR: { type: "enum" as const, enum: ["a", "b"] },
      BAZ: { type: "range" as const, range: [1, 5] as [number, number] },
      QUX: {
        type: "union" as const,
        union: [
          { type: "enum" as const, enum: [1, 2] },
          { type: "string" as const },
        ],
      },
    };
    const types = envkaValidator(schema)["~standard"].generateType();

    describe("validateEnv integration with builtin validator", () => {
      it("validates using validateEnv and envkaValidator", () => {
        const schema = {
          FOO: { type: "string" as const, default: "bar" },
          BAR: { type: "number" as const, default: 42 },
        };
        const validator = envkaValidator(schema);
        const result = validateEnv(validator, {});
        expect(result.valid).toBe(true);
        expect(result.value).toEqual({ FOO: "bar", BAR: 42 });
      });
    });
    expect(types).toContain("readonly FOO: string;");
    expect(types).toContain('readonly BAR: "a" | "b";');
    expect(types).toContain("readonly BAZ: number; // 1-5");
    expect(types).toContain("readonly QUX: 1 | 2 | string;");
  });
});

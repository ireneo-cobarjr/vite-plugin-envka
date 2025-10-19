import { describe, it, expect } from "vitest";
import envkaValidator from "../src/envkaValidator";

describe("envkaValidator default values", () => {
  it("applies default for empty string value", () => {
    const schema = {
      FOO: { type: "string" as const, default: "bar" },
    };
    const env = { FOO: "" };
    const validator = envkaValidator(schema);
    const result = validator["~standard"].validate(env);
    expect((result as any).value).toEqual({ FOO: "bar" });
  });

  it("applies default for enum if missing or empty string", () => {
    const schema = {
      MODE: { type: "enum" as const, enum: ["dev", "prod"], default: "prod" },
    };
    const validator = envkaValidator(schema);
    expect(validator["~standard"].validate({}) as any).toEqual({
      value: { MODE: "prod" },
      issues: undefined,
    });
    expect(validator["~standard"].validate({ MODE: "" }) as any).toEqual({
      value: { MODE: "prod" },
      issues: undefined,
    });
    expect(validator["~standard"].validate({ MODE: "dev" }) as any).toEqual({
      value: { MODE: "dev" },
      issues: undefined,
    });
    expect(
      (validator["~standard"].validate({ MODE: "test" }) as any).issues
    ).toBeDefined();
  });
  it("applies default for missing value", () => {
    const schema = {
      FOO: { type: "string" as const, default: "bar" },
      BAR: { type: "number" as const, default: 42 },
    };
    const env = {};
    const validator = envkaValidator(schema);
    const result = validator["~standard"].validate(env);
    expect((result as any).value).toEqual({ FOO: "bar", BAR: 42 });
  });

  it("does not override provided value", () => {
    const schema = {
      FOO: { type: "string" as const, default: "bar" },
    };
    const env = { FOO: "baz" };
    const validator = envkaValidator(schema);
    const result = validator["~standard"].validate(env);
    expect((result as any).value).toEqual({ FOO: "baz" });
  });

  it("reports error if default is invalid", () => {
    const schema = {
      FOO: { type: "number" as const, default: "not-a-number" },
    };
    const env = {};
    const validator = envkaValidator(schema);
    const result = validator["~standard"].validate(env);
    expect((result as any).issues).toBeDefined();
  });
});

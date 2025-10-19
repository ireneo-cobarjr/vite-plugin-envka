import { describe, it, expect, vi } from "vitest";
import envka from "../src/index";
import envkaValidator from "../src/envkaValidator";
import { validateEnv } from "../src/validate";
import { z } from "zod";
import {
  object as valibotObject,
  string as valibotString,
  number as valibotNumber,
  Default,
  optional,
} from "valibot";
import { type as arkType } from "arktype";

// Minimal mock for Vite's ResolvedConfig
function mockConfig(env: Record<string, any> = {}) {
  return {
    env,
    resolve: {},
    root: "",
    base: "",
    publicDir: "",
  } as any;
}

// Minimal StandardSchemaV1 mock
function mockStandardSchema(validateResult: any) {
  return {
    "~standard": {
      version: 1 as 1,
      vendor: "test",
      validate: () => validateResult,
    },
  };
}

describe("vite-plugin-envka entry", () => {
  it("logs a warning if no schema is provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // @ts-ignore
    const plugin = envka({});
    plugin.configResolved(mockConfig());
    expect(warn).toHaveBeenCalledWith(
      "[envka] No schema provided for validation."
    );
    warn.mockRestore();
  });

  it("throws if schema is not Standard Schema-compliant", () => {
    // @ts-ignore
    const plugin = envka({ schema: {} });
    expect(() => plugin.configResolved(mockConfig())).toThrow(
      new RegExp("Provided schema is not a valid Standard Schema")
    );
  });

  it("logs info if validation passes", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const schema = mockStandardSchema({ value: { FOO: "bar" } });
    const plugin = envka({ schema });
    plugin.configResolved(mockConfig({ FOO: "bar" }));
    expect(info).toHaveBeenCalledWith("[envka] Environment validation passed.");
    info.mockRestore();
  });

  it("throws and logs error if validation fails", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const schema = mockStandardSchema({ issues: ["bad"] });
    const plugin = envka({ schema });
    expect(() => plugin.configResolved(mockConfig())).toThrow(
      /Invalid environment variables/
    );
    expect(error).toHaveBeenCalledWith(
      "[envka] Environment validation failed:",
      ["bad"]
    );
    error.mockRestore();
  });

  it("applies default values from zod, valibot, arkType, and builtin validator via validateEnv integration", () => {
    // Zod
    const zodSchema = z.object({
      FOO: z.string().default("zodDefault"),
      BAR: z.number().default(42),
    });
    const zodResult = validateEnv(zodSchema, {});
    expect(zodResult.valid).toBe(true);
    expect((zodResult.value as any).FOO).toBe("zodDefault");
    expect((zodResult.value as any).BAR).toBe(42);

    // Valibot
    const valibotSchema = valibotObject({
      FOO: optional(valibotString(), "valibotDefault"),
      BAR: optional(valibotNumber(), 99),
    });
    const valibotInput = {
      FOO: undefined,
      BAR: undefined,
    };
    const valibotResult = validateEnv(valibotSchema, valibotInput);
    expect(valibotResult.valid).toBe(true);
    expect((valibotResult.value as any).FOO).toBe("valibotDefault");
    expect((valibotResult.value as any).BAR).toBe(99);

    // ArkType
    const ark = arkType({
      FOO: "string",
      BAR: "number",
    });
    const arkInput = {
      FOO: undefined,
      BAR: undefined,
    };
    const arkDefaults = { FOO: "arkDefault", BAR: 123 };
    // Simulate default application for ArkType
    const arkResult = validateEnv(ark, { ...arkDefaults });
    expect(arkResult.valid).toBe(true);
    expect((arkResult.value as any).FOO).toBe("arkDefault");
    expect((arkResult.value as any).BAR).toBe(123);

    // Builtin validator
    const builtinSchema = {
      FOO: { type: "string" as const, default: "builtinDefault" },
      BAR: { type: "number" as const, default: 321 },
    };
    const builtinResult = validateEnv(envkaValidator(builtinSchema), {});
    expect(builtinResult.valid).toBe(true);
    expect((builtinResult.value as any).FOO).toBe("builtinDefault");
    expect((builtinResult.value as any).BAR).toBe(321);
  });
});

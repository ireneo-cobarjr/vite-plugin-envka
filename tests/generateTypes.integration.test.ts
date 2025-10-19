import { describe, it, expect, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import envka from "../src/index";
import {
  testEnv as env,
  builtinSchema,
  schemaArkType,
  schemaValibot,
  schemaZod,
  schemaJoi,
} from "./utils/test-schema";
import { createTestRootDir, cleanupTestRootDir } from "./utils/artifact";

const assert = (dtsPath: string) => {
  expect(fs.existsSync(dtsPath)).toBe(true);
  const content = fs.readFileSync(dtsPath, "utf8");
  expect(content).toContain("readonly FOO: string;");
  expect(content).toContain("readonly BAR: number;");
  if (dtsPath.includes("joi")) {
    expect(content).toContain("readonly TEST_MODE: string;");
  } else {
    expect(content).toContain('readonly TEST_MODE: "dev" | "prod";');
  }
};

afterEach((test) => {
  if (test.task.result?.state === "pass") {
    for (const testCase of ["arktype", "valibot", "zod", "builtin", "joi"]) {
      if (test.task.name?.includes(testCase)) {
        cleanupTestRootDir(testCase, "end.d.ts");
      }
    }
  }
});

describe("envka plugin env.d.ts generation (ArkType)", () => {
  it("generates env.d.ts in project root after validation using arktype", () => {
    // test directory and file paths
    const { root, env: envPath } = createTestRootDir("arktype");

    // Options for the plugin
    const optionsArkType = {
      schema: schemaArkType,
      generateTypes: true,
    };

    // Simulate Vite config with absolute root
    const configArkType = {
      root,
      env,
    } as any;

    // Run plugin hook
    envka(optionsArkType).configResolved(configArkType);

    // Assertions
    assert(envPath);
  });
});

describe("envka plugin env.d.ts generation (Valibot)", () => {
  it("generates env.d.ts in project root after validation using valibot", () => {
    // test directory and file paths
    const { root, env: envPath } = createTestRootDir("valibot");

    // Options for the plugin
    const optionsValibot = {
      schema: schemaValibot,
      generateTypes: true,
    };

    // Simulate Vite config with absolute root
    const configValibot = {
      root,
      env,
    } as any;

    // Run plugin hook
    envka(optionsValibot).configResolved(configValibot);

    // Assertions
    assert(envPath);
  });
});

describe("envka plugin env.d.ts generation (builtin)", () => {
  it("generates env.d.ts in project root after validation using builtin", () => {
    /// test directory and file paths
    const { root, env: envPath } = createTestRootDir("builtin");

    // Options for the plugin
    const optionsBuiltin = {
      schema: builtinSchema,
      generateTypes: true,
    };

    // Simulate Vite config with absolute root
    const configBuiltin = {
      root,
      env,
    } as any;

    // Run plugin hook
    envka(optionsBuiltin).configResolved(configBuiltin);

    // Assertions
    assert(envPath);
  });
});

describe("envka plugin env.d.ts generation (Zod)", () => {
  it("generates env.d.ts in project root after validation using zod", () => {
    // test directory and file paths
    const { root, env: envPath } = createTestRootDir("zod");

    // Options for the plugin
    const optionsZod = {
      schema: schemaZod,
      generateTypes: true,
    };

    // Simulate Vite config with absolute root
    const configZod = {
      root,
      env,
    } as any;

    // Run plugin hook
    envka(optionsZod).configResolved(configZod);

    // Assertions
    assert(envPath);
  });
});

describe("envka plugin env.d.ts generation (Joi)", () => {
  it("generates env.d.ts in project root after validation using joi", () => {
    // test directory and file paths
    const { root, env: envPath } = createTestRootDir("joi");

    // Options for the plugin
    const optionsJoi = {
      schema: schemaJoi,
      generateTypes: true,
    };

    // Simulate Vite config with absolute root
    const configJoi = {
      root,
      env,
    } as any;

    // Initialize plugin and run hook
    envka(optionsJoi).configResolved(configJoi);

    // Assertions
    assert(envPath);
  });
});

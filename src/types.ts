// Type definitions for envka
import type { StandardSchemaV1 } from "@standard-schema/spec";

export interface EnvkaOptions {
  /** Validation schema for environment variables (Standard Schema spec) */
  schema: StandardSchemaV1;
  /** If true, generate env.d.ts after validation (default: false) */
  generateTypes?: boolean;
  /** Warn or error on unknown env vars */
  // strict?: boolean;
}

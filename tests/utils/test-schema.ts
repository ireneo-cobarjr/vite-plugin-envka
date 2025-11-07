import envkaValidator from "../../src/envkaValidator";

export const builtinSchema = envkaValidator({
  FOO: { type: "string", default: "bar" },
  BAR: { type: "number", default: 42, description: "The bar value" },
  TEST_MODE: { type: "enum", enum: ["dev", "prod"], default: "dev" },
});

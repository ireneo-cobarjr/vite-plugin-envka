import { renderEnvDts } from "./utils/renderEnvDts.js";

function jsTypeToTs(type: string): string {
  if (type === "string") return "string";
  if (type === "number") return "number";
  if (type === "boolean") return "boolean";
  return "unknown";
}

export function generateFromGeneric(validated: Record<string, any>): string {
  const keys = Object.keys(validated);
  const lines = keys.map((key) => {
    const value = validated[key];
    const tsType = jsTypeToTs(typeof value);
    return `  readonly ${key}: ${tsType};`;
  });

  return renderEnvDts(lines);
}

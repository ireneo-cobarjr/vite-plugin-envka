// Utility to render env.d.ts output for Vite
export function renderEnvDts(lines: string[]): string {
  return `/// <reference types=\"vite/client\" />\ninterface ImportMetaEnv {\n${lines.join(
    "\n"
  )}\n}\n\ninterface ImportMeta {\n  readonly env: ImportMetaEnv;\n}\n`;
}

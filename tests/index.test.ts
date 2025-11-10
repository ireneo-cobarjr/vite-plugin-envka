import { describe, it, expect, vi } from "vitest";
import envka from "../src/index";

describe("vite-plugin-envka entry", () => {
  it("logs a warning if no schema is provided (empty object)", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    // @ts-ignore
    const plugin = envka({});
    // @ts-ignore
    plugin.config({}, {});
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("No schema provided for validation.")
    );
    spy.mockRestore();
  });

  it("logs a warning if no schema is provided (no arguments)", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    // @ts-ignore
    const plugin = envka();
    // @ts-ignore
    plugin.config({}, {});
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("No schema provided for validation.")
    );
    spy.mockRestore();
  });

  it("logs an error if provided schema is invalid", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    // @ts-ignore
    const plugin = envka({ schema: {} });
    // @ts-ignore
    plugin.config({}, {});
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Provided schema is not a valid envkaValidator schema."
      )
    );
    spy.mockRestore();
  });
});

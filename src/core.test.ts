import { describe, expect, test } from "bun:test";
import { tokenize } from "./core";

describe("tokenize", () => {
  test("parses simple command", () => {
    const result = tokenize("get key");
    expect(result).toEqual({ command: "GET", args: ["key"] });
  });

  test("parses command with multiple args", () => {
    const result = tokenize("set key value 60");
    expect(result).toEqual({
      command: "SET",
      args: ["key", "value", "60"],
    });
  });

  test("handles double quotes", () => {
    const result = tokenize('set key "hello world"');
    expect(result).toEqual({
      command: "SET",
      args: ["key", "hello world"],
    });
  });

  test("handles single quotes", () => {
    const result = tokenize("set key 'hello world'");
    expect(result).toEqual({
      command: "SET",
      args: ["key", "hello world"],
    });
  });

  test("handles escaped quotes", () => {
    const result = tokenize('set key "hello \\"world\\""');
    expect(result).toEqual({
      command: "SET",
      args: ["key", 'hello "world"'],
    });
  });

  test("handles escaped spaces", () => {
    const result = tokenize("set key hello\\ world");
    expect(result).toEqual({
      command: "SET",
      args: ["key", "hello world"],
    });
  });

  test("handles extra whitespaces", () => {
    const result = tokenize("  set   key   value  ");
    expect(result).toEqual({ command: "SET", args: ["key", "value"] });
  });

  test("handles empty string", () => {
    const result = tokenize("");
    expect(result).toEqual({ command: undefined, args: [] });
  });

  test("handles mixed quotes", () => {
    const result = tokenize("set key \"val'ue\" 'val\"ue'");
    expect(result).toEqual({
      command: "SET",
      args: ["key", "val'ue", 'val"ue'],
    });
  });
});

import { describe, expect, it } from "vitest";
import { computeDiff } from "./utils";

describe("computeDiff", () => {
  it("does not duplicate suffix lines in middle diff", () => {
    const left = ["a", "x", "b"];
    const right = ["a", "b"];

    const diff = computeDiff(left, right);

    expect(diff.map((line) => line.content)).toEqual(["a", "x", "b"]);
    expect(diff.map((line) => line.type)).toEqual(["common", "remove", "common"]);
  });

  it("does not duplicate prefix lines in middle diff", () => {
    const left = ["a", "b"];
    const right = ["a", "x", "b"];

    const diff = computeDiff(left, right);

    expect(diff.map((line) => line.content)).toEqual(["a", "x", "b"]);
    expect(diff.map((line) => line.type)).toEqual(["common", "add", "common"]);
  });
});

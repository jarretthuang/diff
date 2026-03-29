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

  it("preserves a shared suffix when the right side is longer", () => {
    const left = ["keep", "tail"];
    const right = ["inserted", "keep", "tail"];

    const diff = computeDiff(left, right);

    expect(diff.map((line) => line.content)).toEqual(["inserted", "keep", "tail"]);
    expect(diff.map((line) => line.type)).toEqual(["add", "common", "common"]);
  });

  it("treats empty lines as real common lines", () => {
    const left = ["", "same"];
    const right = ["", "same"];

    const diff = computeDiff(left, right);

    expect(diff.map((line) => line.content)).toEqual(["", "same"]);
    expect(diff.map((line) => line.type)).toEqual(["common", "common"]);
  });

  it("keeps a leading empty line as common when only the middle changes", () => {
    const left = ["", "before", "tail"];
    const right = ["", "after", "tail"];

    const diff = computeDiff(left, right);

    expect(diff.map((line) => line.content)).toEqual(["", "before", "after", "tail"]);
    expect(diff.map((line) => line.type)).toEqual(["common", "remove", "add", "common"]);
  });
});

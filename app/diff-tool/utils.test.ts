import { computeDiff, compressLargeDiff } from "./utils";

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

  it("treats empty lines as equal in shared prefix and suffix", () => {
    const left = ["", "body", ""];
    const right = ["", "", ""];

    const diff = computeDiff(left, right);

    expect(diff.map((line) => line.type)).toEqual(["common", "remove", "add", "common"]);
    expect(diff.map((line) => line.content)).toEqual(["", "body", "", ""]);
  });

  it("matches suffix using right-side indexing when lengths differ", () => {
    const left = ["keep", "left-only", "tail"];
    const right = ["keep", "tail"];

    const diff = computeDiff(left, right);

    expect(diff.map((line) => line.type)).toEqual(["common", "remove", "common"]);
    expect(diff.map((line) => line.content)).toEqual(["keep", "left-only", "tail"]);
  });

  it("handles large repeated inputs while preserving the unique anchor", () => {
    const left = [
      ...Array.from({ length: 2000 }, () => "repeat"),
      "anchor-left",
      ...Array.from({ length: 2000 }, () => "repeat"),
    ];
    const right = [
      ...Array.from({ length: 2000 }, () => "repeat"),
      "anchor-right",
      ...Array.from({ length: 2000 }, () => "repeat"),
    ];

    const diff = computeDiff(left, right);

    expect(diff.some((line) => line.content === "anchor-left" && line.type === "remove")).toBe(true);
    expect(diff.some((line) => line.content === "anchor-right" && line.type === "add")).toBe(true);
  });
});

describe("compressLargeDiff", () => {
  it("keeps context around changes and collapses unchanged ranges", () => {
    const diff = [
      ...Array.from({ length: 30 }, (_, i) => ({ content: `same-${i}`, type: "common" as const })),
      { content: "removed", type: "remove" as const },
      ...Array.from({ length: 30 }, (_, i) => ({ content: `same-tail-${i}`, type: "common" as const })),
    ];

    const compressed = compressLargeDiff(diff, { maxLines: 20, contextLines: 2 });

    expect(compressed.some((line) => line.content.includes("unchanged lines omitted"))).toBe(true);
    expect(compressed.some((line) => line.content === "removed")).toBe(true);
    expect(compressed.length).toBeLessThan(diff.length);
  });

  it("collapses huge all-common diffs by preserving head and tail", () => {
    const diff = Array.from({ length: 100 }, (_, i) => ({
      content: `same-${i}`,
      type: "common" as const,
    }));

    const compressed = compressLargeDiff(diff, { maxLines: 20, contextLines: 3 });

    expect(compressed[0].content).toBe("same-0");
    expect(compressed[1].content).toBe("same-1");
    expect(compressed[2].content).toBe("same-2");
    expect(compressed[3].content).toContain("unchanged lines omitted");
    expect(compressed.at(-1)?.content).toBe("same-99");
    expect(compressed.length).toBe(7);
  });
});

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

  it("does not treat repeated lines as unique anchors", () => {
    const left = ["x", "anchor", "x", "tail"];
    const right = ["x", "anchor", "x", "tail", "added"];

    const diff = computeDiff(left, right);

    expect(diff.map((line) => line.type)).toEqual(["common", "common", "common", "common", "add"]);
    expect(diff.at(-1)?.content).toBe("added");
  });

  it("treats CRLF and LF lines as equivalent when diffing", () => {
    const left = ["const a = 1;\r", "return a;\r"];
    const right = ["const a = 1;", "return a;"];

    const diff = computeDiff(left, right);

    expect(diff.map((line) => line.type)).toEqual(["common", "common"]);
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

  it("shrinks context when initial compression is still above maxLines", () => {
    const diff = [
      ...Array.from({ length: 12 }, (_, i) => ({ content: `same-${i}`, type: "common" as const })),
      { content: "remove-a", type: "remove" as const },
      ...Array.from({ length: 12 }, (_, i) => ({ content: `mid-${i}`, type: "common" as const })),
      { content: "add-b", type: "add" as const },
      ...Array.from({ length: 12 }, (_, i) => ({ content: `tail-${i}`, type: "common" as const })),
    ];

    const compressed = compressLargeDiff(diff, { maxLines: 10, contextLines: 4 });

    expect(compressed.some((line) => line.content === "remove-a")).toBe(true);
    expect(compressed.some((line) => line.content === "add-b")).toBe(true);
    expect(compressed.some((line) => line.content.includes("unchanged lines omitted"))).toBe(true);
    expect(compressed.length).toBeLessThanOrEqual(10);
  });

  it("hard caps output when changed lines exceed maxLines", () => {
    const diff = Array.from({ length: 40 }, (_, i) => ({
      content: `changed-${i}`,
      type: (i % 2 === 0 ? "remove" : "add") as const,
    }));

    const compressed = compressLargeDiff(diff, { maxLines: 12, contextLines: 2 });

    expect(compressed.length).toBe(12);
    expect(compressed.some((line) => line.content.includes("lines omitted"))).toBe(true);
    expect(compressed[0].content).toBe("changed-0");
    expect(compressed.at(-1)?.content).toBe("changed-39");
  });
});

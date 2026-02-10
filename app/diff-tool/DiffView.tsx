import { useMemo, useState } from "react";
import { type Line } from "./types";
import { computeDiff } from "./utils";

export default function DiffView({
  left,
  right,
  unified = false,
}: {
  left: string[];
  right: string[];
  unified?: boolean;
}) {
  const [hoveredLine, setHoveredLine] = useState(-1);

  const { leftLines, rightLines, diffLines } = useMemo(() => {
    const d = computeDiff(left, right);
    const l: Line[] = d.map((diffLine) => {
      return diffLine.originLeft !== undefined
        ? {
            content: left[diffLine.originLeft],
            type: "raw",
          }
        : {
            content: diffLine.content,
            type: "void",
          };
    });
    const r: Line[] = d.map((diffLine) => {
      return diffLine.originRight !== undefined
        ? {
            content: right[diffLine.originRight],
            type: "raw",
          }
        : {
            content: diffLine.content,
            type: "void",
          };
    });
    return {
      leftLines: l,
      rightLines: r,
      diffLines: d,
    };
  }, [left, right]);

  const lineCount = leftLines.length;
  const rowHeight = "h-7"; /* single grid row height so all columns stay in sync */

  function getLineStyles(line: Line): string {
    const base =
      "flex px-3 py-1.5 items-center text-sm font-mono transition-colors duration-150 w-full rounded box-border";
    switch (line.type) {
      case "void":
        return `${base} bg-zinc-800/50 text-zinc-700`;
      case "raw":
        return `${base} bg-zinc-800/30 text-zinc-400`;
      case "common":
        return `${base} bg-amber-500/20 text-amber-200 border-l-2 border-amber-500/50`;
      case "add":
        return `${base} bg-emerald-500/25 text-emerald-200 border-l-2 border-emerald-500`;
      case "remove":
        return `${base} bg-rose-500/25 text-rose-200 border-l-2 border-rose-500`;
      default:
        return `${base} bg-zinc-800/30 text-zinc-400`;
    }
  }

  const renderLineCell = (line: Line, group: string, index: number) => (
    <div
      key={`${group}-${index}`}
      className={`${rowHeight} min-h-0 ${getLineStyles(line)} ${hoveredLine === index ? "bg-opacity-80" : ""}`}
      onMouseOver={() => setHoveredLine(index)}
      onMouseOut={() => setHoveredLine(-1)}
    >
      <div className="w-5 shrink-0 text-center text-zinc-500">
        {line.type === "add" && <span>+</span>}
        {line.type === "remove" && <span>−</span>}
      </div>
      <span
        className="flex-1 min-w-0 whitespace-nowrap"
        style={{
          color: line.type === "void" ? "transparent" : undefined,
          userSelect: line.type === "void" ? "none" : "auto",
        }}
      >
        {line.content || " "}
      </span>
    </div>
  );

  if (unified) {
    return (
      <div className="flex flex-col gap-y-0.5 w-max min-w-full">
        <div className="sticky top-0 z-10 flex bg-zinc-900 py-2 font-medium text-zinc-400 text-xs uppercase tracking-wider">
          Diff
        </div>
        {diffLines.map((line, index) =>
          renderLineCell(line, "unified", index)
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-x-6 gap-y-0.5 w-max min-w-full">
      {/* Header row */}
      <div className="sticky top-0 z-10 flex bg-zinc-900 py-2 font-medium text-zinc-400 text-xs uppercase tracking-wider">
        Left
      </div>
      <div className="sticky top-0 z-10 flex bg-zinc-900 py-2 font-medium text-zinc-400 text-xs uppercase tracking-wider">
        Diff
      </div>
      <div className="sticky top-0 z-10 flex bg-zinc-900 py-2 font-medium text-zinc-400 text-xs uppercase tracking-wider">
        Right
      </div>
      {/* Data rows: one grid row per line so all three columns share the same row height */}
      {Array.from({ length: lineCount }, (_, index) => [
        renderLineCell(leftLines[index], "left", index),
        renderLineCell(diffLines[index], "diff", index),
        renderLineCell(rightLines[index], "right", index),
      ]).flat()}
    </div>
  );
}

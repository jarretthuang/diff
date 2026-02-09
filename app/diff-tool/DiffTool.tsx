"use client";
import { useState } from "react";
import DiffView from "@/app/diff-tool/DiffView";
import { DIFF_LEFT, DIFF_RIGHT } from "./testData";

export default function DiffTool() {
  const [left, setLeft] = useState(DIFF_LEFT.join("\n"));
  const [right, setRight] = useState(DIFF_RIGHT.join("\n"));

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Input panes */}
      <div className="shrink-0 grid grid-cols-2 gap-4 px-6 py-4 border-b border-zinc-800">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Left
          </label>
          <textarea
            className="h-40 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste left text here..."
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Right
          </label>
          <textarea
            className="h-40 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste right text here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Diff output */}
      <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
          Comparison
        </div>
        <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="h-full overflow-y-auto overflow-x-auto p-4">
            <DiffView left={left.split("\n")} right={right.split("\n")} />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import DiffView from "@/app/diff-tool/DiffView";
import { DIFF_LEFT, DIFF_RIGHT } from "./testData";

export default function DiffTool() {
  const [left, setLeft] = useState(DIFF_LEFT.join("\n"));
  const [right, setRight] = useState(DIFF_RIGHT.join("\n"));
  const [showSource, setShowSource] = useState(true);

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
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Comparison
          </span>
          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-300">
              Show source
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={showSource}
              onClick={() => setShowSource((s) => !s)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                showSource ? "bg-emerald-600/80 border-emerald-500/50" : "bg-zinc-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                  showSource ? "translate-x-5" : "translate-x-0.5"
                }`}
                style={{ marginTop: 2 }}
              />
            </button>
          </label>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="h-full overflow-y-auto overflow-x-auto px-4 pb-4 pt-0">
            <DiffView
              left={left.split("\n")}
              right={right.split("\n")}
              unified={!showSource}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

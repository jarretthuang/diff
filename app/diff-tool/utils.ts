import { LineType, Line, DiffLine } from "./types";

interface CompressDiffOptions {
  maxLines?: number;
  contextLines?: number;
}

export function toLine(str: string, type: LineType): Line {
  return {
    content: str,
    type: type,
  };
}

export function compressLargeDiff(
  diff: DiffLine[],
  options: CompressDiffOptions = {}
): DiffLine[] {
  const maxLines = options.maxLines ?? 1200;
  const contextLines = options.contextLines ?? 12;

  if (diff.length <= maxLines) return diff;

  const changedIndices: number[] = [];
  for (let i = 0; i < diff.length; i++) {
    if (diff[i].type !== "common") changedIndices.push(i);
  }

  const makePlaceholder = (hiddenCount: number): DiffLine => ({
    content: `… ${hiddenCount} unchanged lines omitted …`,
    type: "common",
  });

  // If everything is common, preserve beginning and end for quick scanning.
  if (changedIndices.length === 0) {
    const head = diff.slice(0, contextLines);
    const tail = diff.slice(-contextLines);
    const hidden = Math.max(0, diff.length - head.length - tail.length);
    return hidden > 0 ? [...head, makePlaceholder(hidden), ...tail] : diff;
  }

  const ranges: Array<[number, number]> = [];
  for (const index of changedIndices) {
    const start = Math.max(0, index - contextLines);
    const end = Math.min(diff.length - 1, index + contextLines);
    const prev = ranges[ranges.length - 1];
    if (!prev || start > prev[1] + 1) {
      ranges.push([start, end]);
    } else {
      prev[1] = Math.max(prev[1], end);
    }
  }

  const result: DiffLine[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) {
      result.push(makePlaceholder(start - cursor));
    }
    result.push(...diff.slice(start, end + 1));
    cursor = end + 1;
  }

  if (cursor < diff.length) {
    result.push(makePlaceholder(diff.length - cursor));
  }

  return result;
}

export function computeDiff(left: string[], right: string[]): DiffLine[] {
  const { commonPrefix, midLeft, midRight, commonSuffix } = compareStrings(
    left,
    right
  );

  function computeInnerDiff(
    leftLines: string[],
    rightLines: string[],
    leftIndex: number,
    rightIndex: number
  ): DiffLine[] {
    const commonUniqueStrings = getUniqueStringIndexInBothSides(
      leftLines,
      rightLines
    );
    if (commonUniqueStrings === undefined) {
      return [
        ...leftLines.map((line, index) => {
          return {
            content: line,
            type: "remove",
            originLeft: leftIndex + index,
          } as DiffLine;
        }),
        ...rightLines.map((line, index) => {
          return {
            content: line,
            type: "add",
            originRight: rightIndex + index,
          } as DiffLine;
        }),
      ];
    } else {
      const [leftAnchor, rightAnchor] = commonUniqueStrings;
      return [
        ...computeInnerDiff(
          leftLines.slice(0, leftAnchor),
          rightLines.slice(0, rightAnchor),
          leftIndex,
          rightIndex
        ),
        {
          content: leftLines[leftAnchor],
          type: "common",
          originLeft: leftIndex + leftAnchor,
          originRight: rightIndex + rightAnchor,
        },
        ...computeInnerDiff(
          leftLines.slice(leftAnchor + 1),
          rightLines.slice(rightAnchor + 1),
          leftIndex + leftAnchor + 1,
          rightIndex + rightAnchor + 1
        ),
      ];
    }
  }

  return [
    ...commonPrefix.map((prefix, index) => {
      return {
        content: prefix,
        type: "common",
        originLeft: index,
        originRight: index,
      } as DiffLine;
    }),
    ...computeInnerDiff(
      midLeft,
      midRight,
      commonPrefix.length,
      commonPrefix.length
    ),
    ...commonSuffix.map((suffix, index) => {
      return {
        content: suffix,
        type: "common",
        originLeft: left.length - commonSuffix.length + index,
        originRight: right.length - commonSuffix.length + index,
      } as DiffLine;
    }),
  ];
}

function compareStrings(
  left: string[],
  right: string[]
): {
  commonPrefix: string[];
  midLeft: string[];
  midRight: string[];
  commonSuffix: string[];
} {
  let prefixEnd = 0; // exclusive
  while (prefixEnd < left.length && prefixEnd < right.length) {
    if (left[prefixEnd] === right[prefixEnd]) {
      prefixEnd++;
    } else {
      break;
    }
  }

  let suffixEnd = 0; // exclusive
  while (
    suffixEnd < left.length - prefixEnd &&
    suffixEnd < right.length - prefixEnd
  ) {
    const leftIndex = left.length - 1 - suffixEnd;
    const rightIndex = right.length - 1 - suffixEnd;
    if (left[leftIndex] === right[rightIndex]) {
      suffixEnd++;
    } else {
      break;
    }
  }

  return {
    commonPrefix: left.slice(0, prefixEnd),
    midLeft: left.slice(prefixEnd, left.length - suffixEnd),
    midRight: right.slice(prefixEnd, right.length - suffixEnd),
    commonSuffix: left.slice(left.length - suffixEnd),
  };
}

function getUniqueStringIndices(strs: string[]): Map<string, number> {
  const stats = new Map<string, { count: number; firstIndex: number }>();

  for (let i = 0; i < strs.length; i++) {
    const str = strs[i];
    const existing = stats.get(str);

    if (existing) {
      existing.count += 1;
    } else {
      stats.set(str, { count: 1, firstIndex: i });
    }
  }

  const result = new Map<string, number>();
  stats.forEach((value, key) => {
    if (value.count === 1) {
      result.set(key, value.firstIndex);
    }
  });

  return result;
}

function getUniqueStringIndexInBothSides(
  left: string[],
  right: string[]
): [number, number] | undefined {
  const uniqueStringsInLeft = getUniqueStringIndices(left);
  const uniqueStringsInRight = getUniqueStringIndices(right);
  for (const [key, value] of uniqueStringsInLeft) {
    if (uniqueStringsInRight.has(key)) {
      return [value, uniqueStringsInRight.get(key)!];
    }
  }
  return undefined;
}

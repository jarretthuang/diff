import { LineType, Line, DiffLine } from "./types";

export function toLine(str: string, type: LineType): Line {
  return {
    content: str,
    type: type,
  };
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
    const currentStr = left[prefixEnd];
    if (currentStr && currentStr === right[prefixEnd]) {
      prefixEnd++;
    } else {
      break;
    }
  }

  let suffixEnd = 0; // exclusive
  while (suffixEnd < left.length - prefixEnd && suffixEnd < right.length) {
    const currentStr = left[left.length - 1 - suffixEnd];
    if (currentStr && currentStr === right[left.length - 1 - suffixEnd]) {
      suffixEnd++;
    } else {
      break;
    }
  }

  return {
    commonPrefix: left.slice(0, prefixEnd),
    midLeft: left.slice(prefixEnd, left.length - suffixEnd + 1),
    midRight: right.slice(prefixEnd, right.length - suffixEnd + 1),
    commonSuffix: left.slice(left.length - suffixEnd),
  };
}

function getUniqueStringIndices(strs: string[]): Map<string, number> {
  const indicesMap = new Map<string, number[]>();
  for (let i = 0; i < strs.length; i++) {
    const str = strs[i];
    indicesMap.set(str, [...(indicesMap.get(str) ?? []), i]);
  }

  const result = new Map();
  indicesMap.forEach((value, key) => {
    if (value.length === 1) {
      result.set(key, value[0]);
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

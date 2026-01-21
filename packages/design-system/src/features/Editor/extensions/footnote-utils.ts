export interface FootnoteOrderingResult {
  orderedDefIndices: number[];
  missingKeys: string[];
  duplicateKeys: string[];
  refOrder: string[];
}

export function isValidFootnoteKey(key: string): boolean {
  if (!key) return false;
  return /^[A-Za-z0-9_-]+$/.test(key);
}

export function computeFootnoteOrdering(
  refKeys: string[],
  defKeys: string[]
): FootnoteOrderingResult {
  const refOrder: string[] = [];
  const refSeen = new Set<string>();
  for (const key of refKeys) {
    if (!refSeen.has(key)) {
      refSeen.add(key);
      refOrder.push(key);
    }
  }

  const defIndexMap = new Map<string, number[]>();
  defKeys.forEach((key, index) => {
    const list = defIndexMap.get(key);
    if (list) {
      list.push(index);
    } else {
      defIndexMap.set(key, [index]);
    }
  });

  const duplicateKeys: string[] = [];
  for (const [key, indices] of defIndexMap.entries()) {
    if (indices.length > 1) {
      duplicateKeys.push(key);
    }
  }

  const missingKeys: string[] = [];
  for (const key of refOrder) {
    if (!defIndexMap.has(key)) {
      missingKeys.push(key);
    }
  }

  const orderedDefIndices: number[] = [];
  const used = new Set<number>();

  for (const key of refOrder) {
    const indices = defIndexMap.get(key);
    if (indices && indices.length > 0) {
      const first = indices[0];
      orderedDefIndices.push(first);
      used.add(first);
    }
  }

  for (let i = 0; i < defKeys.length; i += 1) {
    if (!used.has(i)) {
      orderedDefIndices.push(i);
    }
  }

  return {
    orderedDefIndices,
    missingKeys,
    duplicateKeys,
    refOrder,
  };
}

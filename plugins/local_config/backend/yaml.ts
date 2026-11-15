type Mapping = Record<string, unknown>;

type Entry = {
  indent: number;
  key: string;
  rawValue: string;
};

type Block = {
  start: number;
  end: number;
};

export type Leaf = {
  path: string[];
  value: unknown;
};

const SAFE_KEY = /^[A-Za-z0-9_-]+$/u;

export function isMapping(value: unknown): value is Mapping {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseEntry(line: string): Entry | null {
  if (!line.trim() || line.trimStart().startsWith("#")) return null;
  const indent = line.match(/^ */u)?.[0].length ?? 0;
  const content = line.slice(indent).trimEnd();
  const separator = content.search(/:(?=\s|$)/u);
  if (separator < 1) return null;
  let key = content.slice(0, separator).trim();
  if (key.startsWith('"')) {
    try {
      const parsed: unknown = JSON.parse(key);
      if (typeof parsed === "string") key = parsed;
    } catch {
      return null;
    }
  }
  return {
    indent,
    key,
    rawValue: content.slice(separator + 1).trim(),
  };
}

function keyText(key: string): string {
  return SAFE_KEY.test(key) ? key : JSON.stringify(key);
}

function scalarText(value: unknown, currentRawValue = ""): string {
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new Error("YAML 数字必须是有限值");
    }
    return String(value);
  }
  if (typeof value === "string") {
    if (currentRawValue.startsWith("'")) {
      return `'${value.replaceAll("'", "''")}'`;
    }
    if (currentRawValue.startsWith('"')) return JSON.stringify(value);
    if (
      value &&
      value === value.trim() &&
      !/[\u0000-\u001f\u007f#]/u.test(value) &&
      !/:(?:\s|$)|^[-?:](?:\s|$)/u.test(value) &&
      !/^(?:true|false|null|~)$/iu.test(value) &&
      !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/iu.test(value) &&
      !/^["'&*!|>%@`{\[]/u.test(value)
    ) {
      return value;
    }
    return JSON.stringify(value);
  }
  throw new Error("图形化设置只支持字符串、数字、布尔值和空值");
}

function findEntry(
  lines: string[],
  start: number,
  end: number,
  key: string,
  indent: number,
): number {
  for (let index = start + 1; index < end; index += 1) {
    const entry = parseEntry(lines[index]!);
    if (entry?.indent === indent && entry.key === key) return index;
  }
  return -1;
}

function blockEnd(
  lines: string[],
  start: number,
  limit: number,
  parentIndent: number,
): number {
  for (let index = start + 1; index < limit; index += 1) {
    const entry = parseEntry(lines[index]!);
    if (entry !== null && entry.indent <= parentIndent) return index;
  }
  return limit;
}

function insertionIndex(lines: string[], block: Block): number {
  let index = block.end;
  while (index > block.start + 1) {
    const line = lines[index - 1]!;
    if (line.trim() && !line.trimStart().startsWith("#")) break;
    index -= 1;
  }
  return index;
}

function trailingComment(line: string): string {
  let quote: '"' | "'" | null = null;
  let escaped = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]!;
    if (quote === '"') {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quote = null;
      continue;
    }
    if (quote === "'") {
      if (character !== "'") continue;
      if (line[index + 1] === "'") {
        index += 1;
      } else {
        quote = null;
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "#" && (index === 0 || /\s/u.test(line[index - 1]!))) {
      let start = index;
      while (start > 0 && /\s/u.test(line[start - 1]!)) start -= 1;
      return line.slice(start);
    }
  }
  return "";
}

function replaceScalarLine(
  lines: string[],
  index: number,
  key: string,
  value: unknown,
): void {
  const entry = parseEntry(lines[index]!);
  if (!entry) throw new Error("无法定位 YAML 设置");
  const blockEndIndex = entry.rawValue
    ? index + 1
    : blockEnd(lines, index, lines.length, entry.indent);
  const comment = trailingComment(lines[index]!);
  lines.splice(
    index,
    blockEndIndex - index,
    `${" ".repeat(entry.indent)}${keyText(key)}: ${scalarText(value, entry.rawValue)}${comment}`,
  );
}

function ensureChildMapping(
  lines: string[],
  parent: Block,
  key: string,
  indent: number,
): Block {
  const entryIndex = findEntry(lines, parent.start, parent.end, key, indent);
  if (entryIndex < 0) {
    const insertAt = insertionIndex(lines, parent);
    lines.splice(insertAt, 0, `${" ".repeat(indent)}${keyText(key)}:`);
    return {
      start: insertAt,
      end: blockEnd(lines, insertAt, parent.end + 1, indent),
    };
  }

  const entry = parseEntry(lines[entryIndex]!)!;
  if (entry.rawValue) {
    const comment = trailingComment(lines[entryIndex]!);
    lines[entryIndex] = `${" ".repeat(indent)}${keyText(key)}:${comment}`;
  }
  return {
    start: entryIndex,
    end: blockEnd(lines, entryIndex, parent.end, indent),
  };
}

function ensureRootMapping(lines: string[], key: string): Block {
  const entryIndex = findEntry(lines, -1, lines.length, key, 0);
  if (entryIndex < 0) {
    const insertAt =
      lines.at(-1) === "" ? Math.max(0, lines.length - 1) : lines.length;
    if (insertAt > 0 && lines[insertAt - 1]!.trim()) {
      lines.splice(insertAt, 0, "");
    }
    const adjusted = insertionIndex(lines, { start: -1, end: lines.length });
    lines.splice(adjusted, 0, `${keyText(key)}:`);
    return {
      start: adjusted,
      end: blockEnd(lines, adjusted, lines.length, 0),
    };
  }
  const entry = parseEntry(lines[entryIndex]!)!;
  if (entry.rawValue) {
    const comment = trailingComment(lines[entryIndex]!);
    lines[entryIndex] = `${keyText(key)}:${comment}`;
  }
  return {
    start: entryIndex,
    end: blockEnd(lines, entryIndex, lines.length, 0),
  };
}

function setValueInParent(
  lines: string[],
  parent: Block,
  key: string,
  indent: number,
  value: unknown,
): void {
  const entryIndex = findEntry(lines, parent.start, parent.end, key, indent);
  if (entryIndex >= 0) {
    replaceScalarLine(lines, entryIndex, key, value);
    return;
  }
  const insertAt = insertionIndex(lines, parent);
  lines.splice(
    insertAt,
    0,
    `${" ".repeat(indent)}${keyText(key)}: ${scalarText(value)}`,
  );
}

export function setYamlPath(
  source: string,
  path: readonly string[],
  value: unknown,
): string {
  if (path.length < 2) throw new Error("YAML 设置路径至少需要两段");
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const lines = source.split(/\r\n|\r|\n/u);
  let parent = ensureRootMapping(lines, path[0]!);
  let indent = 0;
  for (const key of path.slice(1, -1)) {
    indent += 2;
    parent = ensureChildMapping(lines, parent, key, indent);
  }
  setValueInParent(lines, parent, path.at(-1)!, indent + 2, value);
  return lines.join(newline);
}

export function removeYamlPath(
  source: string,
  path: readonly string[],
): string {
  if (path.length < 2) throw new Error("YAML 设置路径至少需要两段");
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const lines = source.split(/\r\n|\r|\n/u);
  let parent = ensureRootMapping(lines, path[0]!);
  let indent = 0;
  for (const key of path.slice(1, -1)) {
    indent += 2;
    const index = findEntry(lines, parent.start, parent.end, key, indent);
    if (index < 0) return source;
    parent = {
      start: index,
      end: blockEnd(lines, index, parent.end, indent),
    };
  }
  const index = findEntry(
    lines,
    parent.start,
    parent.end,
    path.at(-1)!,
    indent + 2,
  );
  if (index < 0) return source;
  const end = blockEnd(lines, index, parent.end, indent + 2);
  lines.splice(index, end - index);
  return lines.join(newline);
}

/**
 * Reorder selected children of an existing mapping without rewriting or
 * reparenting the unselected entries.
 */
export function reorderYamlMappingEntries(
  source: string,
  path: readonly string[],
  orderedKeys: readonly string[],
): string {
  if (path.length === 0) throw new Error("YAML 映射路径不能为空");
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const lines = source.split(/\r\n|\r|\n/u);
  let parentStart = findEntry(lines, -1, lines.length, path[0]!, 0);
  if (parentStart < 0) throw new Error(`无法定位 YAML 映射 ${path[0]}`);
  let parentEnd = blockEnd(lines, parentStart, lines.length, 0);
  let indent = 0;
  for (const key of path.slice(1)) {
    indent += 2;
    const index = findEntry(lines, parentStart, parentEnd, key, indent);
    if (index < 0) throw new Error(`无法定位 YAML 映射 ${path.join(".")}`);
    parentStart = index;
    parentEnd = blockEnd(lines, index, parentEnd, indent);
  }

  const childIndent = indent + 2;
  const childEntries: number[] = [];
  const originalKeys: string[] = [];
  for (let index = parentStart + 1; index < parentEnd; index += 1) {
    const entry = parseEntry(lines[index]!);
    if (entry?.indent !== childIndent) continue;
    childEntries.push(index);
    originalKeys.push(entry.key);
  }

  const childStarts = childEntries.map((entryIndex, slot) => {
    let decoratedStart = entryIndex;
    const previousEntry = slot === 0 ? parentStart : childEntries[slot - 1]!;
    while (decoratedStart > previousEntry + 1) {
      const previousLine = lines[decoratedStart - 1]!;
      if (!previousLine.trim() || previousLine.trimStart().startsWith("#")) {
        decoratedStart -= 1;
      } else {
        break;
      }
    }
    return decoratedStart;
  });

  const childBlocks = new Map<string, string[]>();
  for (const [slot, start] of childStarts.entries()) {
    const end = childStarts[slot + 1] ?? parentEnd;
    childBlocks.set(originalKeys[slot]!, lines.slice(start, end));
  }
  if (new Set(orderedKeys).size !== orderedKeys.length) {
    throw new Error("YAML 映射排序键不能重复");
  }
  for (const key of orderedKeys) {
    if (!childBlocks.has(key)) {
      throw new Error(`YAML 映射 ${path.join(".")} 不包含 ${key}`);
    }
  }

  const reordered = [...orderedKeys];
  const orderedSet = new Set(orderedKeys);
  const replacement = originalKeys.flatMap(
    (key) => childBlocks.get(orderedSet.has(key) ? reordered.shift()! : key)!,
  );
  const firstChild = childStarts[0] ?? parentEnd;
  const prefix = lines.slice(parentStart + 1, firstChild);
  lines.splice(
    parentStart + 1,
    parentEnd - parentStart - 1,
    ...prefix,
    ...replacement,
  );
  return lines.join(newline);
}

export function mappingAt(
  value: unknown,
  path: readonly string[],
): Mapping | null {
  let current = value;
  for (const key of path) {
    if (!isMapping(current)) return null;
    current = current[key];
  }
  return isMapping(current) ? current : null;
}

export function flattenMapping(value: Mapping, base: string[] = []): Leaf[] {
  const result: Leaf[] = [];
  for (const [key, item] of Object.entries(value)) {
    const path = [...base, key];
    if (isMapping(item)) result.push(...flattenMapping(item, path));
    else result.push({ path, value: item });
  }
  return result;
}

export function leafMap(value: Mapping): Map<string, unknown> {
  return new Map(
    flattenMapping(value).map((entry) => [
      entry.path.join("\u0000"),
      entry.value,
    ]),
  );
}

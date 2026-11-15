export type PatternKind = "regex" | "wildcard";

const REGEX_PREFIX = /^regex:/iu;
const WILDCARD_PREFIX = /^(?:glob|wildcard):/iu;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function wildcardSource(value: string): string {
  let source = "";
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === "\\") {
      const next = value[index + 1];
      if (next === "*" || next === "?" || next === "\\") {
        source += escapeRegex(next);
        index += 1;
      } else {
        source += "\\\\";
      }
    } else if (character === "*") {
      source += ".*";
    } else if (character === "?") {
      source += ".";
    } else {
      source += escapeRegex(character);
    }
  }
  return `^${source}$`;
}

function hasUnescapedWildcard(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === "\\") {
      index += 1;
      continue;
    }
    if (character === "*" || character === "?") return true;
  }
  return false;
}

function hasRegexSyntax(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === "\\") {
      index += 1;
      continue;
    }
    if (
      character === "." ||
      character === "^" ||
      character === "$" ||
      character === "[" ||
      character === "]" ||
      character === "{" ||
      character === "}" ||
      character === "|" ||
      character === "+" ||
      character === "(" ||
      character === ")"
    )
      return true;
  }
  return false;
}

export function patternKind(value: string): PatternKind {
  const pattern = value.trim();
  if (REGEX_PREFIX.test(pattern)) return "regex";
  if (WILDCARD_PREFIX.test(pattern)) return "wildcard";
  return hasUnescapedWildcard(pattern) && !hasRegexSyntax(pattern)
    ? "wildcard"
    : "regex";
}

export function patternToRegexSource(value: string): string {
  const pattern = value.trim();
  if (REGEX_PREFIX.test(pattern)) return pattern.replace(REGEX_PREFIX, "");
  if (WILDCARD_PREFIX.test(pattern))
    return wildcardSource(pattern.replace(WILDCARD_PREFIX, ""));
  return patternKind(pattern) === "wildcard"
    ? wildcardSource(pattern)
    : pattern;
}

export function compileTextPattern(value: string): RegExp {
  return new RegExp(patternToRegexSource(value), "iu");
}

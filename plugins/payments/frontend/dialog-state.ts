export function createDialogState<Value>() {
  let snapshot: Value | null = null;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setSnapshot(
      value: Value | null | ((current: Value | null) => Value | null),
    ) {
      const next =
        typeof value === "function"
          ? (value as (current: Value | null) => Value | null)(snapshot)
          : value;
      if (Object.is(snapshot, next)) return;
      snapshot = next;
      for (const listener of listeners) listener();
    },
  };
}

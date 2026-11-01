/**
 * Generic memoization for functions of two numbers: results are cached per
 * argument pair. Written by hand, as the task forbids utility libraries.
 *
 * Stub: TDD red step, caches nothing and forwards every call.
 */
export const memoize2 =
  (fn: (a: number, b: number) => number): ((a: number, b: number) => number) =>
  (a: number, b: number): number =>
    fn(a, b);

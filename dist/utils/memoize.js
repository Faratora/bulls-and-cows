/**
 * Generic memoization for functions of two numbers: results are cached per
 * argument pair. Written by hand, as the task forbids utility libraries.
 */
export const memoize2 = (fn) => {
    const cache = new Map();
    return (a, b) => {
        const key = `${a}|${b}`;
        const hit = cache.get(key);
        if (hit !== undefined) {
            return hit;
        }
        const value = fn(a, b);
        cache.set(key, value);
        return value;
    };
};
//# sourceMappingURL=memoize.js.map
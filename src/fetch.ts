let _fetch: typeof window.fetch | undefined = undefined;

export function setFetch(fetch: typeof window.fetch) {
    _fetch = fetch;
}

export function getFetch() {
    if (_fetch === undefined) {
        throw new Error("fetch is not set");
    }
    return { fetch:_fetch };
}

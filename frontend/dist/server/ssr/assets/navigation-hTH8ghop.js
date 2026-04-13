import { a as stripBasePath, n as toBrowserNavigationHref, r as toSameOriginAppPath } from "./url-utils-BKwNM2eZ.js";
import * as React$1 from "react";
//#region node_modules/vinext/dist/client/instrumentation-client-state.js
var clientInstrumentationHooks = null;
function notifyAppRouterTransitionStart(href, navigationType) {
	clientInstrumentationHooks?.onRouterTransitionStart?.(href, navigationType);
}
//#endregion
//#region node_modules/vinext/dist/shims/readonly-url-search-params.js
var ReadonlyURLSearchParamsError = class extends Error {
	constructor() {
		super("Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams");
	}
};
/**
* Read-only URLSearchParams wrapper matching Next.js runtime behavior.
* Mutation methods remain present for instanceof/API compatibility but throw.
*/
var ReadonlyURLSearchParams = class extends URLSearchParams {
	append(_name, _value) {
		throw new ReadonlyURLSearchParamsError();
	}
	delete(_name, _value) {
		throw new ReadonlyURLSearchParamsError();
	}
	set(_name, _value) {
		throw new ReadonlyURLSearchParamsError();
	}
	sort() {
		throw new ReadonlyURLSearchParamsError();
	}
};
//#endregion
//#region node_modules/vinext/dist/shims/navigation.js
/**
* next/navigation shim
*
* App Router navigation hooks. These work on both server (RSC) and client.
* Server-side: reads from a request context set by the RSC handler.
* Client-side: reads from browser Location API and provides navigation.
*/
var _LAYOUT_SEGMENT_CTX_KEY = Symbol.for("vinext.layoutSegmentContext");
var _SERVER_INSERTED_HTML_CTX_KEY = Symbol.for("vinext.serverInsertedHTMLContext");
function getServerInsertedHTMLContext() {
	if (typeof React$1.createContext !== "function") return null;
	const globalState = globalThis;
	if (!globalState[_SERVER_INSERTED_HTML_CTX_KEY]) globalState[_SERVER_INSERTED_HTML_CTX_KEY] = React$1.createContext(null);
	return globalState[_SERVER_INSERTED_HTML_CTX_KEY] ?? null;
}
var ServerInsertedHTMLContext = getServerInsertedHTMLContext();
/**
* Get or create the layout segment context.
* Returns null in the RSC environment (createContext unavailable).
*/
function getLayoutSegmentContext() {
	if (typeof React$1.createContext !== "function") return null;
	const globalState = globalThis;
	if (!globalState[_LAYOUT_SEGMENT_CTX_KEY]) globalState[_LAYOUT_SEGMENT_CTX_KEY] = React$1.createContext({ children: [] });
	return globalState[_LAYOUT_SEGMENT_CTX_KEY] ?? null;
}
var _READONLY_SEARCH_PARAMS = Symbol("vinext.navigation.readonlySearchParams");
var _READONLY_SEARCH_PARAMS_SOURCE = Symbol("vinext.navigation.readonlySearchParamsSource");
var GLOBAL_ACCESSORS_KEY = Symbol.for("vinext.navigation.globalAccessors");
var _GLOBAL_ACCESSORS_KEY = GLOBAL_ACCESSORS_KEY;
function _getGlobalAccessors() {
	return globalThis[_GLOBAL_ACCESSORS_KEY];
}
var _serverContext = null;
var _serverInsertedHTMLCallbacks = [];
var _getServerContext = () => {
	const g = _getGlobalAccessors();
	return g ? g.getServerContext() : _serverContext;
};
var _setServerContext = (ctx) => {
	const g = _getGlobalAccessors();
	if (g) g.setServerContext(ctx);
	else _serverContext = ctx;
};
var _getInsertedHTMLCallbacks = () => {
	const g = _getGlobalAccessors();
	return g ? g.getInsertedHTMLCallbacks() : _serverInsertedHTMLCallbacks;
};
var _clearInsertedHTMLCallbacks = () => {
	const g = _getGlobalAccessors();
	if (g) g.clearInsertedHTMLCallbacks();
	else _serverInsertedHTMLCallbacks = [];
};
/**
* Register ALS-backed state accessors. Called by navigation-state.ts on import.
* @internal
*/
function _registerStateAccessors(accessors) {
	_getServerContext = accessors.getServerContext;
	_setServerContext = accessors.setServerContext;
	_getInsertedHTMLCallbacks = accessors.getInsertedHTMLCallbacks;
	_clearInsertedHTMLCallbacks = accessors.clearInsertedHTMLCallbacks;
}
/**
* Set the navigation context for the current SSR/RSC render.
* Called by the framework entry before rendering each request.
*/
function setNavigationContext(ctx) {
	_setServerContext(ctx);
}
var isServer = typeof window === "undefined";
/**
* Convert a pathname (with optional query/hash) to its .rsc URL.
* Strips trailing slashes before appending `.rsc` so that cache keys
* are consistent regardless of the `trailingSlash` config setting.
*/
function toRscUrl(href) {
	const [beforeHash] = href.split("#");
	const qIdx = beforeHash.indexOf("?");
	const pathname = qIdx === -1 ? beforeHash : beforeHash.slice(0, qIdx);
	const query = qIdx === -1 ? "" : beforeHash.slice(qIdx);
	return (pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname) + ".rsc" + query;
}
/** Get or create the shared in-memory RSC prefetch cache on window. */
function getPrefetchCache() {
	if (isServer) return /* @__PURE__ */ new Map();
	if (!window.__VINEXT_RSC_PREFETCH_CACHE__) window.__VINEXT_RSC_PREFETCH_CACHE__ = /* @__PURE__ */ new Map();
	return window.__VINEXT_RSC_PREFETCH_CACHE__;
}
/**
* Get or create the shared set of already-prefetched RSC URLs on window.
* Keyed by rscUrl so that the browser entry can clear entries when consumed.
*/
function getPrefetchedUrls() {
	if (isServer) return /* @__PURE__ */ new Set();
	if (!window.__VINEXT_RSC_PREFETCHED_URLS__) window.__VINEXT_RSC_PREFETCHED_URLS__ = /* @__PURE__ */ new Set();
	return window.__VINEXT_RSC_PREFETCHED_URLS__;
}
/**
* Evict prefetch cache entries if at capacity.
* First sweeps expired entries, then falls back to FIFO eviction.
*/
function evictPrefetchCacheIfNeeded() {
	const cache = getPrefetchCache();
	if (cache.size < 50) return;
	const now = Date.now();
	const prefetched = getPrefetchedUrls();
	for (const [key, entry] of cache) if (now - entry.timestamp >= 3e4) {
		cache.delete(key);
		prefetched.delete(key);
	}
	while (cache.size >= 50) {
		const oldest = cache.keys().next().value;
		if (oldest !== void 0) {
			cache.delete(oldest);
			prefetched.delete(oldest);
		} else break;
	}
}
/**
* Snapshot an RSC response to an ArrayBuffer for caching and replay.
* Consumes the response body and stores it with content-type and URL metadata.
*/
async function snapshotRscResponse(response) {
	return {
		buffer: await response.arrayBuffer(),
		contentType: response.headers.get("content-type") ?? "text/x-component",
		paramsHeader: response.headers.get("X-Vinext-Params"),
		url: response.url
	};
}
/**
* Prefetch an RSC response and snapshot it for later consumption.
* Stores the in-flight promise so immediate clicks can await it instead
* of firing a duplicate fetch.
* Enforces a maximum cache size to prevent unbounded memory growth on
* link-heavy pages.
*/
function prefetchRscResponse(rscUrl, fetchPromise) {
	const cache = getPrefetchCache();
	const prefetched = getPrefetchedUrls();
	const entry = { timestamp: Date.now() };
	entry.pending = fetchPromise.then(async (response) => {
		if (response.ok) entry.snapshot = await snapshotRscResponse(response);
		else {
			prefetched.delete(rscUrl);
			cache.delete(rscUrl);
		}
	}).catch(() => {
		prefetched.delete(rscUrl);
		cache.delete(rscUrl);
	}).finally(() => {
		entry.pending = void 0;
	});
	cache.set(rscUrl, entry);
	evictPrefetchCacheIfNeeded();
}
var _CLIENT_NAV_STATE_KEY = Symbol.for("vinext.clientNavigationState");
function getClientNavigationState() {
	if (isServer) return null;
	const globalState = window;
	globalState[_CLIENT_NAV_STATE_KEY] ??= {
		listeners: /* @__PURE__ */ new Set(),
		cachedSearch: window.location.search,
		cachedReadonlySearchParams: new ReadonlyURLSearchParams(window.location.search),
		cachedPathname: stripBasePath(window.location.pathname, ""),
		clientParams: {},
		clientParamsJson: "{}",
		pendingClientParams: null,
		pendingClientParamsJson: null,
		originalPushState: window.history.pushState.bind(window.history),
		originalReplaceState: window.history.replaceState.bind(window.history),
		patchInstalled: false,
		hasPendingNavigationUpdate: false,
		suppressUrlNotifyCount: 0,
		navigationSnapshotActiveCount: 0
	};
	return globalState[_CLIENT_NAV_STATE_KEY];
}
function notifyNavigationListeners() {
	const state = getClientNavigationState();
	if (!state) return;
	for (const fn of state.listeners) fn();
}
var _cachedEmptyServerSearchParams = null;
/**
* Get cached pathname snapshot for useSyncExternalStore.
* Note: Returns cached value from ClientNavigationState, not live window.location.
* The cache is updated by syncCommittedUrlStateFromLocation() after navigation commits.
* This ensures referential stability and prevents infinite re-renders.
* External pushState/replaceState while URL notifications are suppressed won't
* be visible until the next commit.
*/
function getPathnameSnapshot() {
	return getClientNavigationState()?.cachedPathname ?? "/";
}
var _cachedEmptyClientSearchParams = null;
/**
* Get cached search params snapshot for useSyncExternalStore.
* Note: Returns cached value from ClientNavigationState, not live window.location.search.
* The cache is updated by syncCommittedUrlStateFromLocation() after navigation commits.
* This ensures referential stability and prevents infinite re-renders.
* External pushState/replaceState while URL notifications are suppressed won't
* be visible until the next commit.
*/
function getSearchParamsSnapshot() {
	const cached = getClientNavigationState()?.cachedReadonlySearchParams;
	if (cached) return cached;
	if (_cachedEmptyClientSearchParams === null) _cachedEmptyClientSearchParams = new ReadonlyURLSearchParams();
	return _cachedEmptyClientSearchParams;
}
function syncCommittedUrlStateFromLocation() {
	const state = getClientNavigationState();
	if (!state) return false;
	let changed = false;
	const pathname = stripBasePath(window.location.pathname, "");
	if (pathname !== state.cachedPathname) {
		state.cachedPathname = pathname;
		changed = true;
	}
	const search = window.location.search;
	if (search !== state.cachedSearch) {
		state.cachedSearch = search;
		state.cachedReadonlySearchParams = new ReadonlyURLSearchParams(search);
		changed = true;
	}
	return changed;
}
function getServerSearchParamsSnapshot() {
	const ctx = _getServerContext();
	if (!ctx) {
		if (_cachedEmptyServerSearchParams === null) _cachedEmptyServerSearchParams = new ReadonlyURLSearchParams();
		return _cachedEmptyServerSearchParams;
	}
	const source = ctx.searchParams;
	const cached = ctx[_READONLY_SEARCH_PARAMS];
	const cachedSource = ctx[_READONLY_SEARCH_PARAMS_SOURCE];
	if (cached && cachedSource === source) return cached;
	const readonly = new ReadonlyURLSearchParams(source);
	ctx[_READONLY_SEARCH_PARAMS] = readonly;
	ctx[_READONLY_SEARCH_PARAMS_SOURCE] = source;
	return readonly;
}
var _EMPTY_PARAMS = {};
var _CLIENT_NAV_RENDER_CTX_KEY = Symbol.for("vinext.clientNavigationRenderContext");
function getClientNavigationRenderContext() {
	if (typeof React$1.createContext !== "function") return null;
	const globalState = globalThis;
	if (!globalState[_CLIENT_NAV_RENDER_CTX_KEY]) globalState[_CLIENT_NAV_RENDER_CTX_KEY] = React$1.createContext(null);
	return globalState[_CLIENT_NAV_RENDER_CTX_KEY] ?? null;
}
function useClientNavigationRenderSnapshot() {
	const ctx = getClientNavigationRenderContext();
	if (!ctx || typeof React$1.useContext !== "function") return null;
	try {
		return React$1.useContext(ctx);
	} catch {
		return null;
	}
}
function getClientParamsSnapshot() {
	return getClientNavigationState()?.clientParams ?? _EMPTY_PARAMS;
}
function getServerParamsSnapshot() {
	return _getServerContext()?.params ?? _EMPTY_PARAMS;
}
function subscribeToNavigation(cb) {
	const state = getClientNavigationState();
	if (!state) return () => {};
	state.listeners.add(cb);
	return () => {
		state.listeners.delete(cb);
	};
}
/**
* Returns the current pathname.
* Server: from request context. Client: from window.location.
*/
function usePathname() {
	if (isServer) return _getServerContext()?.pathname ?? "/";
	const renderSnapshot = useClientNavigationRenderSnapshot();
	const pathname = React$1.useSyncExternalStore(subscribeToNavigation, getPathnameSnapshot, () => _getServerContext()?.pathname ?? "/");
	if (renderSnapshot && (getClientNavigationState()?.navigationSnapshotActiveCount ?? 0) > 0) return renderSnapshot.pathname;
	return pathname;
}
/**
* Returns the current search params as a read-only URLSearchParams.
*/
function useSearchParams() {
	if (isServer) return getServerSearchParamsSnapshot();
	const renderSnapshot = useClientNavigationRenderSnapshot();
	const searchParams = React$1.useSyncExternalStore(subscribeToNavigation, getSearchParamsSnapshot, getServerSearchParamsSnapshot);
	if (renderSnapshot && (getClientNavigationState()?.navigationSnapshotActiveCount ?? 0) > 0) return renderSnapshot.searchParams;
	return searchParams;
}
/**
* Returns the dynamic params for the current route.
*/
function useParams() {
	if (isServer) return _getServerContext()?.params ?? _EMPTY_PARAMS;
	const renderSnapshot = useClientNavigationRenderSnapshot();
	const params = React$1.useSyncExternalStore(subscribeToNavigation, getClientParamsSnapshot, getServerParamsSnapshot);
	if (renderSnapshot && (getClientNavigationState()?.navigationSnapshotActiveCount ?? 0) > 0) return renderSnapshot.params;
	return params;
}
/**
* Check if a href is an external URL (any URL scheme per RFC 3986, or protocol-relative).
*/
function isExternalUrl(href) {
	return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//");
}
/**
* Check if a href is only a hash change relative to the current URL.
*/
function isHashOnlyChange(href) {
	if (typeof window === "undefined") return false;
	if (href.startsWith("#")) return true;
	try {
		const current = new URL(window.location.href);
		const next = new URL(href, window.location.href);
		return stripBasePath(current.pathname, "") === stripBasePath(next.pathname, "") && current.search === next.search && next.hash !== "";
	} catch {
		return false;
	}
}
/**
* Scroll to a hash target element, or to the top if no hash.
*/
function scrollToHash(hash) {
	if (!hash || hash === "#") {
		window.scrollTo(0, 0);
		return;
	}
	const id = hash.slice(1);
	const element = document.getElementById(id);
	if (element) element.scrollIntoView({ behavior: "auto" });
}
function withSuppressedUrlNotifications(fn) {
	const state = getClientNavigationState();
	if (!state) return fn();
	state.suppressUrlNotifyCount += 1;
	try {
		return fn();
	} finally {
		state.suppressUrlNotifyCount -= 1;
	}
}
function commitClientNavigationState() {
	if (isServer) return;
	const state = getClientNavigationState();
	if (!state) return;
	if (state.navigationSnapshotActiveCount > 0) state.navigationSnapshotActiveCount -= 1;
	const urlChanged = syncCommittedUrlStateFromLocation();
	if (state.pendingClientParams !== null && state.pendingClientParamsJson !== null) {
		state.clientParams = state.pendingClientParams;
		state.clientParamsJson = state.pendingClientParamsJson;
		state.pendingClientParams = null;
		state.pendingClientParamsJson = null;
	}
	const shouldNotify = urlChanged || state.hasPendingNavigationUpdate;
	state.hasPendingNavigationUpdate = false;
	if (shouldNotify) notifyNavigationListeners();
}
function pushHistoryStateWithoutNotify(data, unused, url) {
	withSuppressedUrlNotifications(() => {
		getClientNavigationState()?.originalPushState.call(window.history, data, unused, url);
	});
}
function replaceHistoryStateWithoutNotify(data, unused, url) {
	withSuppressedUrlNotifications(() => {
		getClientNavigationState()?.originalReplaceState.call(window.history, data, unused, url);
	});
}
/**
* Save the current scroll position into the current history state.
* Called before every navigation to enable scroll restoration on back/forward.
*
* Uses replaceHistoryStateWithoutNotify to avoid triggering the patched
* history.replaceState interception (which would cause spurious re-renders).
*/
function saveScrollPosition() {
	replaceHistoryStateWithoutNotify({
		...window.history.state ?? {},
		__vinext_scrollX: window.scrollX,
		__vinext_scrollY: window.scrollY
	}, "");
}
/**
* Restore scroll position from a history state object (used on popstate).
*
* When an RSC navigation is in flight (back/forward triggers both this
* handler and the browser entry's popstate handler which calls
* __VINEXT_RSC_NAVIGATE__), we must wait for the new content to render
* before scrolling. Otherwise the user sees old content flash at the
* restored scroll position.
*
* This handler fires before the browser entry's popstate handler (because
* navigation.ts is loaded before hydration completes), so we defer via a
* microtask to give the browser entry handler a chance to set
* __VINEXT_RSC_PENDING__. Promise.resolve() schedules a microtask
* that runs after all synchronous event listeners have completed.
*/
function restoreScrollPosition(state) {
	if (state && typeof state === "object" && "__vinext_scrollY" in state) {
		const { __vinext_scrollX: x, __vinext_scrollY: y } = state;
		Promise.resolve().then(() => {
			const pending = window.__VINEXT_RSC_PENDING__ ?? null;
			if (pending) pending.then(() => {
				requestAnimationFrame(() => {
					window.scrollTo(x, y);
				});
			});
			else requestAnimationFrame(() => {
				window.scrollTo(x, y);
			});
		});
	}
}
/**
* Navigate to a URL, handling external URLs, hash-only changes, and RSC navigation.
*/
async function navigateClientSide(href, mode, scroll) {
	let normalizedHref = href;
	if (isExternalUrl(href)) {
		const localPath = toSameOriginAppPath(href, "");
		if (localPath == null) {
			if (mode === "replace") window.location.replace(href);
			else window.location.assign(href);
			return;
		}
		normalizedHref = localPath;
	}
	const fullHref = toBrowserNavigationHref(normalizedHref, window.location.href, "");
	notifyAppRouterTransitionStart(fullHref, mode);
	if (mode === "push") saveScrollPosition();
	if (isHashOnlyChange(fullHref)) {
		const hash = fullHref.includes("#") ? fullHref.slice(fullHref.indexOf("#")) : "";
		if (mode === "replace") replaceHistoryStateWithoutNotify(null, "", fullHref);
		else pushHistoryStateWithoutNotify(null, "", fullHref);
		commitClientNavigationState();
		if (scroll) scrollToHash(hash);
		return;
	}
	const hashIdx = fullHref.indexOf("#");
	const hash = hashIdx !== -1 ? fullHref.slice(hashIdx) : "";
	if (typeof window.__VINEXT_RSC_NAVIGATE__ === "function") await window.__VINEXT_RSC_NAVIGATE__(fullHref, 0, "navigate", mode);
	else {
		if (mode === "replace") replaceHistoryStateWithoutNotify(null, "", fullHref);
		else pushHistoryStateWithoutNotify(null, "", fullHref);
		commitClientNavigationState();
	}
	if (scroll) if (hash) scrollToHash(hash);
	else window.scrollTo(0, 0);
}
var _appRouter = {
	push(href, options) {
		if (isServer) return;
		navigateClientSide(href, "push", options?.scroll !== false);
	},
	replace(href, options) {
		if (isServer) return;
		navigateClientSide(href, "replace", options?.scroll !== false);
	},
	back() {
		if (isServer) return;
		window.history.back();
	},
	forward() {
		if (isServer) return;
		window.history.forward();
	},
	refresh() {
		if (isServer) return;
		if (typeof window.__VINEXT_RSC_NAVIGATE__ === "function") window.__VINEXT_RSC_NAVIGATE__(window.location.href, 0, "refresh");
	},
	prefetch(href) {
		if (isServer) return;
		const rscUrl = toRscUrl(toBrowserNavigationHref(href, window.location.href, ""));
		const prefetched = getPrefetchedUrls();
		if (prefetched.has(rscUrl)) return;
		prefetched.add(rscUrl);
		prefetchRscResponse(rscUrl, fetch(rscUrl, {
			headers: { Accept: "text/x-component" },
			credentials: "include",
			priority: "low"
		}));
	}
};
/**
* App Router's useRouter — returns push/replace/back/forward/refresh.
* Different from Pages Router's useRouter (next/router).
*
* Returns a stable singleton: the same object reference on every call,
* matching Next.js behavior so components using referential equality
* (e.g. useMemo / useEffect deps, React.memo) don't re-render unnecessarily.
*/
function useRouter() {
	return _appRouter;
}
/**
* useServerInsertedHTML — inject HTML during SSR from client components.
*
* Used by CSS-in-JS libraries (styled-components, emotion, StyleX) to inject
* <style> tags during SSR so styles appear in the initial HTML (no FOUC).
*
* The callback is called once after each SSR render pass. The returned JSX/HTML
* is serialized and injected into the HTML stream.
*
* Usage (in a "use client" component wrapping children):
*   useServerInsertedHTML(() => {
*     const styles = sheet.getStyleElement();
*     sheet.instance.clearTag();
*     return <>{styles}</>;
*   });
*/
function useServerInsertedHTML(callback) {
	if (typeof document !== "undefined") return;
	_getInsertedHTMLCallbacks().push(callback);
}
/**
* Flush all collected useServerInsertedHTML callbacks.
* Returns an array of results (React elements or strings).
* Clears the callback list so the next render starts fresh.
*
* Called by the SSR entry after renderToReadableStream completes.
*/
function flushServerInsertedHTML() {
	const callbacks = _getInsertedHTMLCallbacks();
	const results = [];
	for (const cb of callbacks) try {
		const result = cb();
		if (result != null) results.push(result);
	} catch {}
	callbacks.length = 0;
	return results;
}
/**
* Clear all collected useServerInsertedHTML callbacks without flushing.
* Used for cleanup between requests.
*/
function clearServerInsertedHTML() {
	_clearInsertedHTMLCallbacks();
}
if (!isServer) {
	const state = getClientNavigationState();
	if (state && !state.patchInstalled) {
		state.patchInstalled = true;
		window.addEventListener("popstate", (event) => {
			if (typeof window.__VINEXT_RSC_NAVIGATE__ !== "function") {
				commitClientNavigationState();
				restoreScrollPosition(event.state);
			}
		});
		window.history.pushState = function patchedPushState(data, unused, url) {
			state.originalPushState.call(window.history, data, unused, url);
			if (state.suppressUrlNotifyCount === 0) commitClientNavigationState();
		};
		window.history.replaceState = function patchedReplaceState(data, unused, url) {
			state.originalReplaceState.call(window.history, data, unused, url);
			if (state.suppressUrlNotifyCount === 0) commitClientNavigationState();
		};
	}
}
//#endregion
export { flushServerInsertedHTML as a, navigateClientSide as c, toRscUrl as d, useParams as f, useServerInsertedHTML as g, useSearchParams as h, clearServerInsertedHTML as i, prefetchRscResponse as l, useRouter as m, ServerInsertedHTMLContext as n, getLayoutSegmentContext as o, usePathname as p, _registerStateAccessors as r, getPrefetchedUrls as s, GLOBAL_ACCESSORS_KEY as t, setNavigationContext as u };

import { i as withBasePath, n as toBrowserNavigationHref, r as toSameOriginAppPath, t as resolveRelativeHref } from "./url-utils-BKwNM2eZ.js";
import { c as navigateClientSide, d as toRscUrl, f as useParams, h as useSearchParams, l as prefetchRscResponse, m as useRouter, o as getLayoutSegmentContext, p as usePathname, s as getPrefetchedUrls } from "./navigation-hTH8ghop.js";
import { a as getDomainLocaleUrl, i as addLocalePrefix, n as appendSearchParamsToUrl, r as urlQueryToSearchParams } from "./query-DX6Sk62_.js";
import { r as normalizeRoles, t as getHomePathForRole } from "./roles-DaFiiYIE.js";
import * as React$1 from "react";
import React, { Suspense, createContext, createElement, forwardRef, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region node_modules/vinext/dist/shims/error-boundary.js
/**
* Generic ErrorBoundary used to wrap route segments with error.tsx.
* This must be a client component since error boundaries use
* componentDidCatch / getDerivedStateFromError.
*/
var ErrorBoundaryInner = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			previousPathname: props.pathname
		};
	}
	static getDerivedStateFromProps(props, state) {
		if (props.pathname !== state.previousPathname && state.error) return {
			error: null,
			previousPathname: props.pathname
		};
		return {
			error: state.error,
			previousPathname: props.pathname
		};
	}
	static getDerivedStateFromError(error) {
		if (error && typeof error === "object" && "digest" in error) {
			const digest = String(error.digest);
			if (digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;") || digest.startsWith("NEXT_REDIRECT;")) throw error;
		}
		return { error };
	}
	reset = () => {
		this.setState({ error: null });
	};
	render() {
		if (this.state.error) {
			const FallbackComponent = this.props.fallback;
			return /* @__PURE__ */ jsx(FallbackComponent, {
				error: this.state.error,
				reset: this.reset
			});
		}
		return this.props.children;
	}
};
function ErrorBoundary({ fallback, children }) {
	return /* @__PURE__ */ jsx(ErrorBoundaryInner, {
		pathname: usePathname(),
		fallback,
		children
	});
}
/**
* Inner class component that catches notFound() errors and renders the
* not-found.tsx fallback. Resets when the pathname changes (client navigation)
* so a previous notFound() doesn't permanently stick.
*
* The ErrorBoundary above re-throws notFound errors so they propagate up to this
* boundary. This must be placed above the ErrorBoundary in the component tree.
*/
var NotFoundBoundaryInner = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			notFound: false,
			previousPathname: props.pathname
		};
	}
	static getDerivedStateFromProps(props, state) {
		if (props.pathname !== state.previousPathname && state.notFound) return {
			notFound: false,
			previousPathname: props.pathname
		};
		return {
			notFound: state.notFound,
			previousPathname: props.pathname
		};
	}
	static getDerivedStateFromError(error) {
		if (error && typeof error === "object" && "digest" in error) {
			const digest = String(error.digest);
			if (digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;404")) return { notFound: true };
		}
		throw error;
	}
	render() {
		if (this.state.notFound) return this.props.fallback;
		return this.props.children;
	}
};
/**
* Wrapper that reads the current pathname and passes it to the inner class
* component. This enables automatic reset on client-side navigation.
*/
function NotFoundBoundary({ fallback, children }) {
	return /* @__PURE__ */ jsx(NotFoundBoundaryInner, {
		pathname: usePathname(),
		fallback,
		children
	});
}
//#endregion
//#region node_modules/vinext/dist/shims/layout-segment-context.js
/**
* Layout segment context provider.
*
* Must be "use client" so that Vite's RSC bundler renders this component in
* the SSR/browser environment where React.createContext is available. The RSC
* entry imports and renders LayoutSegmentProvider directly, but because of the
* "use client" boundary the actual execution happens on the SSR/client side
* where the context can be created and consumed by useSelectedLayoutSegment(s).
*
* Without "use client", this runs in the RSC environment where
* React.createContext is undefined, getLayoutSegmentContext() returns null,
* the provider becomes a no-op, and useSelectedLayoutSegments always returns [].
*
* The context is shared with navigation.ts via getLayoutSegmentContext()
* to avoid creating separate contexts in different modules.
*/
/**
* Wraps children with the layout segment context.
*
* Each layout in the App Router tree wraps its children with this provider,
* passing a map of parallel route key to segment path. The "children" key is
* always present (the default parallel route). Named parallel slots at this
* layout level add their own keys.
*
* Components inside the provider call useSelectedLayoutSegments(parallelRoutesKey)
* to read the segments for a specific parallel route.
*/
function LayoutSegmentProvider({ segmentMap, children }) {
	const ctx = getLayoutSegmentContext();
	if (!ctx) return children;
	return createElement(ctx.Provider, { value: segmentMap }, children);
}
//#endregion
//#region node_modules/vinext/dist/shims/url-safety.js
/**
* Shared URL safety utilities for Link, Form, and navigation shims.
*
* Centralizes dangerous URI scheme detection so all components and
* navigation functions use the same validation logic.
*/
/**
* Detect dangerous URI schemes that should never be navigated to.
*
* Adapted from Next.js's javascript URL detector:
* packages/next/src/client/lib/javascript-url.ts
* https://github.com/vercel/next.js/blob/canary/packages/next/src/client/lib/javascript-url.ts
*
* URL parsing ignores leading C0 control characters / spaces, and treats
* embedded tab/newline characters in the scheme as insignificant. We mirror
* that behavior here so obfuscated values like `java\nscript:` and
* `\x00javascript:` are still blocked.
*
* Vinext intentionally extends this handling to `data:` and `vbscript:` too,
* since both are also dangerous navigation targets.
*/
var LEADING_IGNORED = "[\\u0000-\\u001F \\u200B\\uFEFF]*";
var SCHEME_IGNORED = "[\\r\\n\\t]*";
function buildDangerousSchemeRegex(scheme) {
	const chars = scheme.split("").join(SCHEME_IGNORED);
	return new RegExp(`^${LEADING_IGNORED}${chars}${SCHEME_IGNORED}:`, "i");
}
var DANGEROUS_SCHEME_RES = [
	buildDangerousSchemeRegex("javascript"),
	buildDangerousSchemeRegex("data"),
	buildDangerousSchemeRegex("vbscript")
];
function isDangerousScheme(url) {
	const str = "" + url;
	return DANGEROUS_SCHEME_RES.some((re) => re.test(str));
}
//#endregion
//#region node_modules/vinext/dist/shims/i18n-context.js
var _getI18nContext = () => {
	if (globalThis.__VINEXT_DEFAULT_LOCALE__ == null && globalThis.__VINEXT_LOCALE__ == null) return null;
	return {
		locale: globalThis.__VINEXT_LOCALE__,
		locales: globalThis.__VINEXT_LOCALES__,
		defaultLocale: globalThis.__VINEXT_DEFAULT_LOCALE__,
		domainLocales: globalThis.__VINEXT_DOMAIN_LOCALES__,
		hostname: globalThis.__VINEXT_HOSTNAME__
	};
};
function getI18nContext() {
	return _getI18nContext();
}
//#endregion
//#region node_modules/vinext/dist/shims/link.js
/**
* next/link shim
*
* Renders an <a> tag with client-side navigation support.
* On click, prevents full page reload and triggers client-side
* page swap via the router's navigation system.
*/
var LinkStatusContext = createContext({ pending: false });
/** basePath from next.config.js, injected by the plugin at build time */
var __basePath = "";
function resolveHref(href) {
	if (typeof href === "string") return href;
	let url = href.pathname ?? "/";
	if (href.query) {
		const params = urlQueryToSearchParams(href.query);
		url = appendSearchParamsToUrl(url, params);
	}
	return url;
}
/**
* Prefetch a URL for faster navigation.
*
* For App Router (RSC): fetches the .rsc payload in the background and
* stores it in an in-memory cache for instant use during navigation.
* For Pages Router: injects a <link rel="prefetch"> for the page module.
*
* Uses `requestIdleCallback` (or `setTimeout` fallback) to avoid blocking
* the main thread during initial page load.
*/
function prefetchUrl(href) {
	if (typeof window === "undefined") return;
	let prefetchHref = href;
	if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")) {
		const localPath = toSameOriginAppPath(href, __basePath);
		if (localPath == null) return;
		prefetchHref = localPath;
	}
	const fullHref = toBrowserNavigationHref(prefetchHref, window.location.href, __basePath);
	const rscUrl = toRscUrl(fullHref);
	const prefetched = getPrefetchedUrls();
	if (prefetched.has(rscUrl)) return;
	prefetched.add(rscUrl);
	(window.requestIdleCallback ?? ((fn) => setTimeout(fn, 100)))(() => {
		if (typeof window.__VINEXT_RSC_NAVIGATE__ === "function") prefetchRscResponse(rscUrl, fetch(rscUrl, {
			headers: { Accept: "text/x-component" },
			credentials: "include",
			priority: "low",
			purpose: "prefetch"
		}));
		else if (window.__NEXT_DATA__?.__vinext?.pageModuleUrl) {
			const link = document.createElement("link");
			link.rel = "prefetch";
			link.href = fullHref;
			link.as = "document";
			document.head.appendChild(link);
		}
	});
}
/**
* Shared IntersectionObserver for viewport-based prefetching.
* All Link elements use the same observer to minimize resource usage.
*/
var sharedObserver = null;
var observerCallbacks = /* @__PURE__ */ new WeakMap();
function getSharedObserver() {
	if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return null;
	if (sharedObserver) return sharedObserver;
	sharedObserver = new IntersectionObserver((entries) => {
		for (const entry of entries) if (entry.isIntersecting) {
			const callback = observerCallbacks.get(entry.target);
			if (callback) {
				callback();
				sharedObserver?.unobserve(entry.target);
				observerCallbacks.delete(entry.target);
			}
		}
	}, { rootMargin: "250px" });
	return sharedObserver;
}
function getDefaultLocale() {
	if (typeof window !== "undefined") return window.__VINEXT_DEFAULT_LOCALE__;
	return getI18nContext()?.defaultLocale;
}
function getDomainLocales() {
	if (typeof window !== "undefined") return window.__NEXT_DATA__?.domainLocales;
	return getI18nContext()?.domainLocales;
}
function getCurrentHostname() {
	if (typeof window !== "undefined") return window.location.hostname;
	return getI18nContext()?.hostname;
}
function getDomainLocaleHref(href, locale) {
	return getDomainLocaleUrl(href, locale, {
		basePath: __basePath,
		currentHostname: getCurrentHostname(),
		domainItems: getDomainLocales()
	});
}
/**
* Apply locale prefix to a URL path based on the locale prop.
* - locale="fr" → prepend /fr (unless it already has a locale prefix)
* - locale={false} → use the href as-is (no locale prefix, link to default)
* - locale=undefined → use current locale (href as-is in most cases)
*/
function applyLocaleToHref(href, locale) {
	if (locale === false) return href;
	if (locale === void 0) return href;
	if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")) return href;
	const domainLocaleHref = getDomainLocaleHref(href, locale);
	if (domainLocaleHref) return domainLocaleHref;
	return addLocalePrefix(href, locale, getDefaultLocale() ?? "");
}
var Link = forwardRef(function Link({ href, as, replace = false, prefetch: prefetchProp, scroll = true, children, onClick, onNavigate, ...rest }, forwardedRef) {
	const { locale, ...restWithoutLocale } = rest;
	const resolvedHref = as ?? resolveHref(href);
	const isDangerous = typeof resolvedHref === "string" && isDangerousScheme(resolvedHref);
	const localizedHref = applyLocaleToHref(isDangerous ? "/" : resolvedHref, locale);
	const fullHref = withBasePath(localizedHref, __basePath);
	const [pending, setPending] = useState(false);
	const mountedRef = useRef(true);
	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);
	const internalRef = useRef(null);
	const shouldPrefetch = prefetchProp !== false && !isDangerous;
	const setRefs = useCallback((node) => {
		internalRef.current = node;
		if (typeof forwardedRef === "function") forwardedRef(node);
		else if (forwardedRef) forwardedRef.current = node;
	}, [forwardedRef]);
	useEffect(() => {
		if (!shouldPrefetch || typeof window === "undefined") return;
		const node = internalRef.current;
		if (!node) return;
		let hrefToPrefetch = localizedHref;
		if (localizedHref.startsWith("http://") || localizedHref.startsWith("https://") || localizedHref.startsWith("//")) {
			const localPath = toSameOriginAppPath(localizedHref, __basePath);
			if (localPath == null) return;
			hrefToPrefetch = localPath;
		}
		const observer = getSharedObserver();
		if (!observer) return;
		observerCallbacks.set(node, () => prefetchUrl(hrefToPrefetch));
		observer.observe(node);
		return () => {
			observer.unobserve(node);
			observerCallbacks.delete(node);
		};
	}, [shouldPrefetch, localizedHref]);
	const handleClick = async (e) => {
		if (onClick) onClick(e);
		if (e.defaultPrevented) return;
		if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		if (e.currentTarget.target && e.currentTarget.target !== "_self") return;
		let navigateHref = localizedHref;
		if (resolvedHref.startsWith("http://") || resolvedHref.startsWith("https://") || resolvedHref.startsWith("//")) {
			const localPath = toSameOriginAppPath(resolvedHref, __basePath);
			if (localPath == null) return;
			navigateHref = localPath;
		}
		e.preventDefault();
		const absoluteHref = resolveRelativeHref(navigateHref, window.location.href, __basePath);
		const absoluteFullHref = toBrowserNavigationHref(navigateHref, window.location.href, __basePath);
		if (onNavigate) try {
			const navUrl = new URL(absoluteFullHref, window.location.origin);
			let prevented = false;
			const navEvent = {
				url: navUrl,
				preventDefault() {
					prevented = true;
				},
				get defaultPrevented() {
					return prevented;
				}
			};
			onNavigate(navEvent);
			if (navEvent.defaultPrevented) return;
		} catch {}
		if (typeof window.__VINEXT_RSC_NAVIGATE__ === "function") {
			setPending(true);
			try {
				await navigateClientSide(navigateHref, replace ? "replace" : "push", scroll);
			} finally {
				if (mountedRef.current) setPending(false);
			}
		} else try {
			const Router = (await import("./router-DCldJtu2.js")).default;
			if (replace) await Router.replace(absoluteHref, void 0, { scroll });
			else await Router.push(absoluteHref, void 0, { scroll });
		} catch {
			if (replace) window.history.replaceState({}, "", absoluteFullHref);
			else window.history.pushState({}, "", absoluteFullHref);
			window.dispatchEvent(new PopStateEvent("popstate"));
		}
	};
	const { passHref: _p, ...anchorProps } = restWithoutLocale;
	const linkStatusValue = React.useMemo(() => ({ pending }), [pending]);
	if (isDangerous) return /* @__PURE__ */ jsx("a", {
		...anchorProps,
		children
	});
	return /* @__PURE__ */ jsx(LinkStatusContext.Provider, {
		value: linkStatusValue,
		children: /* @__PURE__ */ jsx("a", {
			ref: setRefs,
			href: fullHref,
			onClick: handleClick,
			...anchorProps,
			children
		})
	});
});
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils.js
/**
* @license lucide-react v0.479.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
	return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
//#endregion
//#region node_modules/lucide-react/dist/esm/defaultAttributes.js
/**
* @license lucide-react v0.479.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var defaultAttributes = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
};
//#endregion
//#region node_modules/lucide-react/dist/esm/Icon.js
/**
* @license lucide-react v0.479.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Icon = forwardRef(({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
	return createElement("svg", {
		ref,
		...defaultAttributes,
		width: size,
		height: size,
		stroke: color,
		strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
		className: mergeClasses("lucide", className),
		...rest
	}, [...iconNode.map(([tag, attrs]) => createElement(tag, attrs)), ...Array.isArray(children) ? children : [children]]);
});
//#endregion
//#region node_modules/lucide-react/dist/esm/createLucideIcon.js
/**
* @license lucide-react v0.479.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var createLucideIcon = (iconName, iconNode) => {
	const Component = forwardRef(({ className, ...props }, ref) => createElement(Icon, {
		ref,
		iconNode,
		className: mergeClasses(`lucide-${toKebabCase(iconName)}`, className),
		...props
	}));
	Component.displayName = `${iconName}`;
	return Component;
};
var ChartColumn = createLucideIcon("ChartColumn", [
	["path", {
		d: "M3 3v16a2 2 0 0 0 2 2h16",
		key: "c24i48"
	}],
	["path", {
		d: "M18 17V9",
		key: "2bz60n"
	}],
	["path", {
		d: "M13 17V5",
		key: "1frdt8"
	}],
	["path", {
		d: "M8 17v-3",
		key: "17ska0"
	}]
]);
var Package = createLucideIcon("Package", [
	["path", {
		d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
		key: "1a0edw"
	}],
	["path", {
		d: "M12 22V12",
		key: "d0xqtd"
	}],
	["polyline", {
		points: "3.29 7 12 12 20.71 7",
		key: "ousv84"
	}],
	["path", {
		d: "m7.5 4.27 9 5.15",
		key: "1c824w"
	}]
]);
var Users = createLucideIcon("Users", [
	["path", {
		d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
		key: "1yyitq"
	}],
	["circle", {
		cx: "9",
		cy: "7",
		r: "4",
		key: "nufk8"
	}],
	["path", {
		d: "M22 21v-2a4 4 0 0 0-3-3.87",
		key: "kshegd"
	}],
	["path", {
		d: "M16 3.13a4 4 0 0 1 0 7.75",
		key: "1da9ce"
	}]
]);
var Truck = createLucideIcon("Truck", [
	["path", {
		d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",
		key: "wrbu53"
	}],
	["path", {
		d: "M15 18H9",
		key: "1lyqi6"
	}],
	["path", {
		d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
		key: "lysw3i"
	}],
	["circle", {
		cx: "17",
		cy: "18",
		r: "2",
		key: "332jqn"
	}],
	["circle", {
		cx: "7",
		cy: "18",
		r: "2",
		key: "19iecd"
	}]
]);
var Settings = createLucideIcon("Settings", [["path", {
	d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
	key: "1qme2f"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "3",
	key: "1v7zrd"
}]]);
var LayoutDashboard = createLucideIcon("LayoutDashboard", [
	["rect", {
		width: "7",
		height: "9",
		x: "3",
		y: "3",
		rx: "1",
		key: "10lvy0"
	}],
	["rect", {
		width: "7",
		height: "5",
		x: "14",
		y: "3",
		rx: "1",
		key: "16une8"
	}],
	["rect", {
		width: "7",
		height: "9",
		x: "14",
		y: "12",
		rx: "1",
		key: "1hutg5"
	}],
	["rect", {
		width: "7",
		height: "5",
		x: "3",
		y: "16",
		rx: "1",
		key: "ldoo1y"
	}]
]);
var LogOut = createLucideIcon("LogOut", [
	["path", {
		d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
		key: "1uf3rs"
	}],
	["polyline", {
		points: "16 17 21 12 16 7",
		key: "1gabdz"
	}],
	["line", {
		x1: "21",
		x2: "9",
		y1: "12",
		y2: "12",
		key: "1uyos4"
	}]
]);
var Bell = createLucideIcon("Bell", [["path", {
	d: "M10.268 21a2 2 0 0 0 3.464 0",
	key: "vwvbt9"
}], ["path", {
	d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
	key: "11g9vi"
}]]);
var User = createLucideIcon("User", [["path", {
	d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",
	key: "975kel"
}], ["circle", {
	cx: "12",
	cy: "7",
	r: "4",
	key: "17ys0d"
}]]);
//#endregion
//#region node_modules/@radix-ui/react-compose-refs/dist/index.mjs
function setRef(ref, value) {
	if (typeof ref === "function") return ref(value);
	else if (ref !== null && ref !== void 0) ref.current = value;
}
function composeRefs(...refs) {
	return (node) => {
		let hasCleanup = false;
		const cleanups = refs.map((ref) => {
			const cleanup = setRef(ref, node);
			if (!hasCleanup && typeof cleanup == "function") hasCleanup = true;
			return cleanup;
		});
		if (hasCleanup) return () => {
			for (let i = 0; i < cleanups.length; i++) {
				const cleanup = cleanups[i];
				if (typeof cleanup == "function") cleanup();
				else setRef(refs[i], null);
			}
		};
	};
}
//#endregion
//#region node_modules/@radix-ui/react-slot/dist/index.mjs
var REACT_LAZY_TYPE = Symbol.for("react.lazy");
var use = React$1[" use ".trim().toString()];
function isPromiseLike(value) {
	return typeof value === "object" && value !== null && "then" in value;
}
function isLazyComponent(element) {
	return element != null && typeof element === "object" && "$$typeof" in element && element.$$typeof === REACT_LAZY_TYPE && "_payload" in element && isPromiseLike(element._payload);
}
/* @__NO_SIDE_EFFECTS__ */
function createSlot(ownerName) {
	const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
	const Slot2 = React$1.forwardRef((props, forwardedRef) => {
		let { children, ...slotProps } = props;
		if (isLazyComponent(children) && typeof use === "function") children = use(children._payload);
		const childrenArray = React$1.Children.toArray(children);
		const slottable = childrenArray.find(isSlottable);
		if (slottable) {
			const newElement = slottable.props.children;
			const newChildren = childrenArray.map((child) => {
				if (child === slottable) {
					if (React$1.Children.count(newElement) > 1) return React$1.Children.only(null);
					return React$1.isValidElement(newElement) ? newElement.props.children : null;
				} else return child;
			});
			return /* @__PURE__ */ jsx(SlotClone, {
				...slotProps,
				ref: forwardedRef,
				children: React$1.isValidElement(newElement) ? React$1.cloneElement(newElement, void 0, newChildren) : null
			});
		}
		return /* @__PURE__ */ jsx(SlotClone, {
			...slotProps,
			ref: forwardedRef,
			children
		});
	});
	Slot2.displayName = `${ownerName}.Slot`;
	return Slot2;
}
var Slot = /* @__PURE__ */ createSlot("Slot");
/* @__NO_SIDE_EFFECTS__ */
function createSlotClone(ownerName) {
	const SlotClone = React$1.forwardRef((props, forwardedRef) => {
		let { children, ...slotProps } = props;
		if (isLazyComponent(children) && typeof use === "function") children = use(children._payload);
		if (React$1.isValidElement(children)) {
			const childrenRef = getElementRef(children);
			const props2 = mergeProps(slotProps, children.props);
			if (children.type !== React$1.Fragment) props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
			return React$1.cloneElement(children, props2);
		}
		return React$1.Children.count(children) > 1 ? React$1.Children.only(null) : null;
	});
	SlotClone.displayName = `${ownerName}.SlotClone`;
	return SlotClone;
}
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
function isSlottable(child) {
	return React$1.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
	const overrideProps = { ...childProps };
	for (const propName in childProps) {
		const slotPropValue = slotProps[propName];
		const childPropValue = childProps[propName];
		if (/^on[A-Z]/.test(propName)) {
			if (slotPropValue && childPropValue) overrideProps[propName] = (...args) => {
				const result = childPropValue(...args);
				slotPropValue(...args);
				return result;
			};
			else if (slotPropValue) overrideProps[propName] = slotPropValue;
		} else if (propName === "style") overrideProps[propName] = {
			...slotPropValue,
			...childPropValue
		};
		else if (propName === "className") overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
	}
	return {
		...slotProps,
		...overrideProps
	};
}
function getElementRef(element) {
	let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
	let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
	if (mayWarn) return element.ref;
	getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
	mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
	if (mayWarn) return element.props.ref;
	return element.props.ref || element.ref;
}
//#endregion
//#region src/components/ui/Button.tsx
var Button = React$1.forwardRef(({ className, variant = "default", size = "default", asChild = false, type = "button", ...props }, ref) => {
	const Comp = asChild ? Slot : "button";
	let variantStyles = "bg-primary text-primary-foreground hover:bg-primary/90";
	if (variant === "outline") variantStyles = "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
	if (variant === "ghost") variantStyles = "hover:bg-accent hover:text-accent-foreground";
	if (variant === "link") variantStyles = "text-primary underline-offset-4 hover:underline";
	if (variant === "brand") variantStyles = "bg-ze-yellow text-ze-black shadow-sm font-black hover:bg-ze-yellow/90 transition-all active:scale-95";
	if (variant === "ze-dark") variantStyles = "bg-ze-black text-ze-yellow shadow-md font-black hover:bg-ze-black/90 transition-all active:scale-95";
	if (variant === "destructive") variantStyles = "bg-destructive text-destructive-foreground hover:bg-destructive/90";
	let sizeStyles = "h-11 px-6";
	if (size === "sm") sizeStyles = "h-9 rounded-md px-3 text-xs";
	if (size === "lg") sizeStyles = "h-12 rounded-xl px-10 text-base";
	if (size === "icon") sizeStyles = "h-10 w-10 px-0";
	return /* @__PURE__ */ jsx(Comp, {
		type: asChild ? void 0 : type,
		className: `inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantStyles} ${sizeStyles} ${className || ""}`,
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
//#region src/lib/auth/shared.ts
var AUTH_CHANGED_EVENT = "entregamais:auth-changed";
//#endregion
//#region src/lib/auth/browser.ts
async function getBrowserSession() {
	const response = await fetch("/api/auth/session", {
		method: "GET",
		cache: "no-store"
	});
	if (!response.ok) return null;
	return (await response.json())?.session || null;
}
//#endregion
//#region src/lib/auth/client.tsx
var AuthContext = createContext(void 0);
function AuthProvider({ children }) {
	const [session, setSession] = useState(null);
	const [status, setStatus] = useState("loading");
	const refreshSession = async () => {
		try {
			const nextSession = await getBrowserSession();
			setSession(nextSession);
			setStatus(nextSession ? "authenticated" : "unauthenticated");
			return nextSession;
		} catch {
			setSession(null);
			setStatus("unauthenticated");
			return null;
		}
	};
	useEffect(() => {
		refreshSession();
		const handleAuthChange = () => {
			refreshSession();
		};
		window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
		return () => {
			window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
		};
	}, []);
	const value = {
		data: session,
		status,
		refreshSession
	};
	return /* @__PURE__ */ jsx(AuthContext.Provider, {
		value,
		children
	});
}
function notifyAuthChanged() {
	if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
function useSession() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useSession must be used within AuthProvider");
	return {
		data: context.data,
		status: context.status,
		update: context.refreshSession
	};
}
async function signIn(provider, options = {}) {
	if (provider !== "credentials") return {
		ok: false,
		status: 400,
		error: "unsupported_provider",
		url: null
	};
	const response = await fetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(options)
	});
	if (response.ok) {
		await response.json();
		notifyAuthChanged();
	}
	return {
		ok: response.ok,
		status: response.status,
		error: response.ok ? void 0 : "credentials",
		url: null
	};
}
async function signOut(options) {
	await fetch("/api/auth/logout", { method: "POST" });
	notifyAuthChanged();
	if (options?.redirect !== false && typeof window !== "undefined") window.location.href = options?.callbackUrl || "/";
}
//#endregion
//#region src/components/layout/PortalLayout.tsx
function PortalLayout({ children, title, role }) {
	const pathname = usePathname();
	const { data: session } = useSession();
	const userRoles = normalizeRoles(session?.user?.roles || []);
	userRoles.includes("admin") || userRoles.includes("seller") || userRoles.includes("driver");
	const roleLabels = {
		admin: "Administrador",
		vendedor: "Vendedor",
		entregador: "Entregador"
	};
	const menuItems = {
		admin: [
			{
				icon: /* @__PURE__ */ jsx(LayoutDashboard, { className: "w-5 h-5" }),
				label: "Geral",
				href: "/admin"
			},
			{
				icon: /* @__PURE__ */ jsx(Users, { className: "w-5 h-5" }),
				label: "Usuários",
				href: "/admin/users"
			},
			{
				icon: /* @__PURE__ */ jsx(Package, { className: "w-5 h-5" }),
				label: "Depósitos",
				href: "/admin/vendedors"
			},
			{
				icon: /* @__PURE__ */ jsx(Truck, { className: "w-5 h-5" }),
				label: "Entregadores",
				href: "/admin/entregadors"
			},
			{
				icon: /* @__PURE__ */ jsx(User, { className: "w-5 h-5" }),
				label: "Meu Perfil",
				href: "/admin/profile"
			},
			{
				icon: /* @__PURE__ */ jsx(Settings, { className: "w-5 h-5" }),
				label: "Configurações",
				href: "/admin/settings"
			}
		],
		vendedor: [
			{
				icon: /* @__PURE__ */ jsx(LayoutDashboard, { className: "w-5 h-5" }),
				label: "Dashboard",
				href: "/vendedor"
			},
			{
				icon: /* @__PURE__ */ jsx(Package, { className: "w-5 h-5" }),
				label: "Produtos/Estoque",
				href: "/vendedor/products"
			},
			{
				icon: /* @__PURE__ */ jsx(ChartColumn, { className: "w-5 h-5" }),
				label: "Pedidos",
				href: "/vendedor/orders"
			},
			{
				icon: /* @__PURE__ */ jsx(User, { className: "w-5 h-5" }),
				label: "Perfil",
				href: "/vendedor/profile"
			},
			{
				icon: /* @__PURE__ */ jsx(Settings, { className: "w-5 h-5" }),
				label: "Meu Depósito",
				href: "/vendedor/settings"
			}
		],
		entregador: [
			{
				icon: /* @__PURE__ */ jsx(LayoutDashboard, { className: "w-5 h-5" }),
				label: "Fila de Entregas",
				href: "/entregador"
			},
			{
				icon: /* @__PURE__ */ jsx(ChartColumn, { className: "w-5 h-5" }),
				label: "Ganhos",
				href: "/entregador/earnings"
			},
			{
				icon: /* @__PURE__ */ jsx(User, { className: "w-5 h-5" }),
				label: "Meu Perfil",
				href: "/entregador/profile"
			}
		]
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col md:flex-row h-screen bg-ze-gray overflow-hidden",
		children: [/* @__PURE__ */ jsxs("aside", {
			className: "hidden md:flex w-64 bg-ze-white border-r border-ze-black/5 flex-col shrink-0",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "p-6 border-b border-ze-black/5 bg-ze-yellow shadow-sm flex items-center justify-center",
					children: /* @__PURE__ */ jsxs("div", {
						className: "text-[10px] font-black text-ze-black/40 uppercase tracking-[0.2em] text-center",
						children: ["Portal do ", role === "admin" ? "Admins" : role === "vendedor" ? "Lojista" : "Entregador"]
					})
				}),
				/* @__PURE__ */ jsx("nav", {
					className: "flex-1 p-4 space-y-1 overflow-y-auto",
					children: menuItems[role].map((item) => {
						const active = pathname === item.href;
						return /* @__PURE__ */ jsxs(Link, {
							href: item.href,
							className: `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-tight transition-all ${active ? "bg-ze-yellow text-ze-black shadow-md shadow-ze-yellow/20" : "text-ze-black/50 hover:bg-ze-gray hover:text-ze-black"}`,
							children: [/* @__PURE__ */ jsx("span", {
								className: active ? "text-ze-black" : "text-ze-black/30 group-hover:text-ze-black",
								children: item.icon
							}), item.label]
						}, item.label);
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "p-4 border-t border-slate-100",
					children: /* @__PURE__ */ jsxs(Button, {
						variant: "ghost",
						onClick: () => signOut(),
						className: "w-full flex items-center justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 py-3",
						children: [/* @__PURE__ */ jsx(LogOut, { className: "w-5 h-5" }), "Sair"]
					})
				})
			]
		}), /* @__PURE__ */ jsxs("main", {
			className: "flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "h-20 bg-white border-b border-ze-black/5 px-4 md:px-8 flex items-center justify-between shrink-0",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "text-xl md:text-2xl font-black text-ze-black uppercase tracking-tighter italic truncate pr-2",
						children: title
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 md:gap-4 shrink-0",
						children: [
							/* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "icon",
								onClick: () => signOut(),
								className: "md:hidden text-ze-red hover:bg-ze-red/10 h-10 w-10 shrink-0 border border-ze-red/10",
								title: "Sair (Limpar Sessão)",
								children: /* @__PURE__ */ jsx(LogOut, { className: "w-5 h-5" })
							}),
							/* @__PURE__ */ jsxs(Button, {
								variant: "ghost",
								size: "icon",
								className: "relative text-ze-black/40 hover:text-ze-black hover:bg-ze-yellow/10 rounded-2xl",
								children: [/* @__PURE__ */ jsx(Bell, { className: "w-5 h-5" }), /* @__PURE__ */ jsx("span", { className: "absolute top-2 right-2 w-2 h-2 bg-ze-red rounded-full border-[1.5px] border-white" })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3 pl-2 md:pl-4 border-l border-ze-black/5",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "text-right hidden sm:block",
									children: [/* @__PURE__ */ jsx("div", {
										className: "text-sm font-black text-ze-black uppercase tracking-tighter italic",
										children: session?.user?.name || (session === null ? "Desconectado" : "Carregando...")
									}), /* @__PURE__ */ jsx("div", {
										className: "text-[10px] text-ze-black/40 font-black uppercase tracking-widest leading-none",
										children: session ? roleLabels[role] || role : session === null ? "Acesso Público" : "Autenticando..."
									})]
								}), /* @__PURE__ */ jsx("div", {
									className: "w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-ze-yellow flex items-center justify-center text-lg md:text-xl shadow-inner border-2 border-ze-black/5 italic font-black text-ze-black shrink-0 transition-opacity",
									children: session?.user?.name?.charAt(0).toUpperCase() || role.charAt(0).toUpperCase()
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide",
					children: /* @__PURE__ */ jsx("div", {
						className: "max-w-7xl mx-auto h-full",
						children
					})
				}),
				/* @__PURE__ */ jsx("nav", {
					className: "md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-ze-black/5 flex justify-around items-center h-16 px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]",
					children: menuItems[role].slice(0, 4).map((item) => {
						const active = pathname === item.href;
						return /* @__PURE__ */ jsxs(Link, {
							href: item.href,
							className: `flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? "text-ze-black" : "text-ze-black/30"}`,
							children: [/* @__PURE__ */ jsx("div", {
								className: `p-1.5 rounded-xl ${active ? "bg-ze-yellow" : ""}`,
								children: item.icon
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[8px] font-black uppercase tracking-widest truncate max-w-[64px] text-center",
								children: item.label
							})]
						}, item.label);
					})
				})
			]
		})]
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}
//#endregion
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
/**
* Concatenates two arrays faster than the array spread operator.
*/
var concatArrays = (array1, array2) => {
	const combinedArray = new Array(array1.length + array2.length);
	for (let i = 0; i < array1.length; i++) combinedArray[i] = array1[i];
	for (let i = 0; i < array2.length; i++) combinedArray[array1.length + i] = array2[i];
	return combinedArray;
};
var createClassValidatorObject = (classGroupId, validator) => ({
	classGroupId,
	validator
});
var createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
	nextPart,
	validators,
	classGroupId
});
var CLASS_PART_SEPARATOR = "-";
var EMPTY_CONFLICTS = [];
var ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
var createClassGroupUtils = (config) => {
	const classMap = createClassMap(config);
	const { conflictingClassGroups, conflictingClassGroupModifiers } = config;
	const getClassGroupId = (className) => {
		if (className.startsWith("[") && className.endsWith("]")) return getGroupIdForArbitraryProperty(className);
		const classParts = className.split(CLASS_PART_SEPARATOR);
		return getGroupRecursive(classParts, classParts[0] === "" && classParts.length > 1 ? 1 : 0, classMap);
	};
	const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
		if (hasPostfixModifier) {
			const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
			const baseConflicts = conflictingClassGroups[classGroupId];
			if (modifierConflicts) {
				if (baseConflicts) return concatArrays(baseConflicts, modifierConflicts);
				return modifierConflicts;
			}
			return baseConflicts || EMPTY_CONFLICTS;
		}
		return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
	};
	return {
		getClassGroupId,
		getConflictingClassGroupIds
	};
};
var getGroupRecursive = (classParts, startIndex, classPartObject) => {
	if (classParts.length - startIndex === 0) return classPartObject.classGroupId;
	const currentClassPart = classParts[startIndex];
	const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
	if (nextClassPartObject) {
		const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
		if (result) return result;
	}
	const validators = classPartObject.validators;
	if (validators === null) return;
	const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
	const validatorsLength = validators.length;
	for (let i = 0; i < validatorsLength; i++) {
		const validatorObj = validators[i];
		if (validatorObj.validator(classRest)) return validatorObj.classGroupId;
	}
};
/**
* Get the class group ID for an arbitrary property.
*
* @param className - The class name to get the group ID for. Is expected to be string starting with `[` and ending with `]`.
*/
var getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	const content = className.slice(1, -1);
	const colonIndex = content.indexOf(":");
	const property = content.slice(0, colonIndex);
	return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
})();
/**
* Exported for testing only
*/
var createClassMap = (config) => {
	const { theme, classGroups } = config;
	return processClassGroups(classGroups, theme);
};
var processClassGroups = (classGroups, theme) => {
	const classMap = createClassPartObject();
	for (const classGroupId in classGroups) {
		const group = classGroups[classGroupId];
		processClassesRecursively(group, classMap, classGroupId, theme);
	}
	return classMap;
};
var processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
	const len = classGroup.length;
	for (let i = 0; i < len; i++) {
		const classDefinition = classGroup[i];
		processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
	}
};
var processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
	if (typeof classDefinition === "string") {
		processStringDefinition(classDefinition, classPartObject, classGroupId);
		return;
	}
	if (typeof classDefinition === "function") {
		processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
		return;
	}
	processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
};
var processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
	const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
	classPartObjectToEdit.classGroupId = classGroupId;
};
var processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
	if (isThemeGetter(classDefinition)) {
		processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
		return;
	}
	if (classPartObject.validators === null) classPartObject.validators = [];
	classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
};
var processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
	const entries = Object.entries(classDefinition);
	const len = entries.length;
	for (let i = 0; i < len; i++) {
		const [key, value] = entries[i];
		processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
	}
};
var getPart = (classPartObject, path) => {
	let current = classPartObject;
	const parts = path.split(CLASS_PART_SEPARATOR);
	const len = parts.length;
	for (let i = 0; i < len; i++) {
		const part = parts[i];
		let next = current.nextPart.get(part);
		if (!next) {
			next = createClassPartObject();
			current.nextPart.set(part, next);
		}
		current = next;
	}
	return current;
};
var isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
var createLruCache = (maxCacheSize) => {
	if (maxCacheSize < 1) return {
		get: () => void 0,
		set: () => {}
	};
	let cacheSize = 0;
	let cache = Object.create(null);
	let previousCache = Object.create(null);
	const update = (key, value) => {
		cache[key] = value;
		cacheSize++;
		if (cacheSize > maxCacheSize) {
			cacheSize = 0;
			previousCache = cache;
			cache = Object.create(null);
		}
	};
	return {
		get(key) {
			let value = cache[key];
			if (value !== void 0) return value;
			if ((value = previousCache[key]) !== void 0) {
				update(key, value);
				return value;
			}
		},
		set(key, value) {
			if (key in cache) cache[key] = value;
			else update(key, value);
		}
	};
};
var IMPORTANT_MODIFIER = "!";
var MODIFIER_SEPARATOR = ":";
var EMPTY_MODIFIERS = [];
var createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
	modifiers,
	hasImportantModifier,
	baseClassName,
	maybePostfixModifierPosition,
	isExternal
});
var createParseClassName = (config) => {
	const { prefix, experimentalParseClassName } = config;
	/**
	* Parse class name into parts.
	*
	* Inspired by `splitAtTopLevelOnly` used in Tailwind CSS
	* @see https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
	*/
	let parseClassName = (className) => {
		const modifiers = [];
		let bracketDepth = 0;
		let parenDepth = 0;
		let modifierStart = 0;
		let postfixModifierPosition;
		const len = className.length;
		for (let index = 0; index < len; index++) {
			const currentCharacter = className[index];
			if (bracketDepth === 0 && parenDepth === 0) {
				if (currentCharacter === MODIFIER_SEPARATOR) {
					modifiers.push(className.slice(modifierStart, index));
					modifierStart = index + 1;
					continue;
				}
				if (currentCharacter === "/") {
					postfixModifierPosition = index;
					continue;
				}
			}
			if (currentCharacter === "[") bracketDepth++;
			else if (currentCharacter === "]") bracketDepth--;
			else if (currentCharacter === "(") parenDepth++;
			else if (currentCharacter === ")") parenDepth--;
		}
		const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
		let baseClassName = baseClassNameWithImportantModifier;
		let hasImportantModifier = false;
		if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
			baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
			hasImportantModifier = true;
		} else if (baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)) {
			baseClassName = baseClassNameWithImportantModifier.slice(1);
			hasImportantModifier = true;
		}
		const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
		return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
	};
	if (prefix) {
		const fullPrefix = prefix + MODIFIER_SEPARATOR;
		const parseClassNameOriginal = parseClassName;
		parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
	}
	if (experimentalParseClassName) {
		const parseClassNameOriginal = parseClassName;
		parseClassName = (className) => experimentalParseClassName({
			className,
			parseClassName: parseClassNameOriginal
		});
	}
	return parseClassName;
};
/**
* Sorts modifiers according to following schema:
* - Predefined modifiers are sorted alphabetically
* - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
*/
var createSortModifiers = (config) => {
	const modifierWeights = /* @__PURE__ */ new Map();
	config.orderSensitiveModifiers.forEach((mod, index) => {
		modifierWeights.set(mod, 1e6 + index);
	});
	return (modifiers) => {
		const result = [];
		let currentSegment = [];
		for (let i = 0; i < modifiers.length; i++) {
			const modifier = modifiers[i];
			const isArbitrary = modifier[0] === "[";
			const isOrderSensitive = modifierWeights.has(modifier);
			if (isArbitrary || isOrderSensitive) {
				if (currentSegment.length > 0) {
					currentSegment.sort();
					result.push(...currentSegment);
					currentSegment = [];
				}
				result.push(modifier);
			} else currentSegment.push(modifier);
		}
		if (currentSegment.length > 0) {
			currentSegment.sort();
			result.push(...currentSegment);
		}
		return result;
	};
};
var createConfigUtils = (config) => ({
	cache: createLruCache(config.cacheSize),
	parseClassName: createParseClassName(config),
	sortModifiers: createSortModifiers(config),
	...createClassGroupUtils(config)
});
var SPLIT_CLASSES_REGEX = /\s+/;
var mergeClassList = (classList, configUtils) => {
	const { parseClassName, getClassGroupId, getConflictingClassGroupIds, sortModifiers } = configUtils;
	/**
	* Set of classGroupIds in following format:
	* `{importantModifier}{variantModifiers}{classGroupId}`
	* @example 'float'
	* @example 'hover:focus:bg-color'
	* @example 'md:!pr'
	*/
	const classGroupsInConflict = [];
	const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
	let result = "";
	for (let index = classNames.length - 1; index >= 0; index -= 1) {
		const originalClassName = classNames[index];
		const { isExternal, modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition } = parseClassName(originalClassName);
		if (isExternal) {
			result = originalClassName + (result.length > 0 ? " " + result : result);
			continue;
		}
		let hasPostfixModifier = !!maybePostfixModifierPosition;
		let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
		if (!classGroupId) {
			if (!hasPostfixModifier) {
				result = originalClassName + (result.length > 0 ? " " + result : result);
				continue;
			}
			classGroupId = getClassGroupId(baseClassName);
			if (!classGroupId) {
				result = originalClassName + (result.length > 0 ? " " + result : result);
				continue;
			}
			hasPostfixModifier = false;
		}
		const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
		const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
		const classId = modifierId + classGroupId;
		if (classGroupsInConflict.indexOf(classId) > -1) continue;
		classGroupsInConflict.push(classId);
		const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
		for (let i = 0; i < conflictGroups.length; ++i) {
			const group = conflictGroups[i];
			classGroupsInConflict.push(modifierId + group);
		}
		result = originalClassName + (result.length > 0 ? " " + result : result);
	}
	return result;
};
/**
* The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
*
* Specifically:
* - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
* - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
*
* Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
*/
var twJoin = (...classLists) => {
	let index = 0;
	let argument;
	let resolvedValue;
	let string = "";
	while (index < classLists.length) if (argument = classLists[index++]) {
		if (resolvedValue = toValue(argument)) {
			string && (string += " ");
			string += resolvedValue;
		}
	}
	return string;
};
var toValue = (mix) => {
	if (typeof mix === "string") return mix;
	let resolvedValue;
	let string = "";
	for (let k = 0; k < mix.length; k++) if (mix[k]) {
		if (resolvedValue = toValue(mix[k])) {
			string && (string += " ");
			string += resolvedValue;
		}
	}
	return string;
};
var createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
	let configUtils;
	let cacheGet;
	let cacheSet;
	let functionToCall;
	const initTailwindMerge = (classList) => {
		configUtils = createConfigUtils(createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst()));
		cacheGet = configUtils.cache.get;
		cacheSet = configUtils.cache.set;
		functionToCall = tailwindMerge;
		return tailwindMerge(classList);
	};
	const tailwindMerge = (classList) => {
		const cachedResult = cacheGet(classList);
		if (cachedResult) return cachedResult;
		const result = mergeClassList(classList, configUtils);
		cacheSet(classList, result);
		return result;
	};
	functionToCall = initTailwindMerge;
	return (...args) => functionToCall(twJoin(...args));
};
var fallbackThemeArr = [];
var fromTheme = (key) => {
	const themeGetter = (theme) => theme[key] || fallbackThemeArr;
	themeGetter.isThemeGetter = true;
	return themeGetter;
};
var arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
var arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
var fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
var colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
var shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
var imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
var isFraction = (value) => fractionRegex.test(value);
var isNumber = (value) => !!value && !Number.isNaN(Number(value));
var isInteger = (value) => !!value && Number.isInteger(Number(value));
var isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
var isTshirtSize = (value) => tshirtUnitRegex.test(value);
var isAny = () => true;
var isLengthOnly = (value) => lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
var isNever = () => false;
var isShadow = (value) => shadowRegex.test(value);
var isImage = (value) => imageRegex.test(value);
var isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
var isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
var isArbitraryValue = (value) => arbitraryValueRegex.test(value);
var isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
var isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
var isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
var isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
var isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
var isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
var isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
var isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
var isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
var isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
var isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
var isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
var isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
var isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
var isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
var getIsArbitraryValue = (value, testLabel, testValue) => {
	const result = arbitraryValueRegex.exec(value);
	if (result) {
		if (result[1]) return testLabel(result[1]);
		return testValue(result[2]);
	}
	return false;
};
var getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
	const result = arbitraryVariableRegex.exec(value);
	if (result) {
		if (result[1]) return testLabel(result[1]);
		return shouldMatchNoLabel;
	}
	return false;
};
var isLabelPosition = (label) => label === "position" || label === "percentage";
var isLabelImage = (label) => label === "image" || label === "url";
var isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
var isLabelLength = (label) => label === "length";
var isLabelNumber = (label) => label === "number";
var isLabelFamilyName = (label) => label === "family-name";
var isLabelWeight = (label) => label === "number" || label === "weight";
var isLabelShadow = (label) => label === "shadow";
var getDefaultConfig = () => {
	/**
	* Theme getters for theme variable namespaces
	* @see https://tailwindcss.com/docs/theme#theme-variable-namespaces
	*/
	const themeColor = fromTheme("color");
	const themeFont = fromTheme("font");
	const themeText = fromTheme("text");
	const themeFontWeight = fromTheme("font-weight");
	const themeTracking = fromTheme("tracking");
	const themeLeading = fromTheme("leading");
	const themeBreakpoint = fromTheme("breakpoint");
	const themeContainer = fromTheme("container");
	const themeSpacing = fromTheme("spacing");
	const themeRadius = fromTheme("radius");
	const themeShadow = fromTheme("shadow");
	const themeInsetShadow = fromTheme("inset-shadow");
	const themeTextShadow = fromTheme("text-shadow");
	const themeDropShadow = fromTheme("drop-shadow");
	const themeBlur = fromTheme("blur");
	const themePerspective = fromTheme("perspective");
	const themeAspect = fromTheme("aspect");
	const themeEase = fromTheme("ease");
	const themeAnimate = fromTheme("animate");
	/**
	* Helpers to avoid repeating the same scales
	*
	* We use functions that create a new array every time they're called instead of static arrays.
	* This ensures that users who modify any scale by mutating the array (e.g. with `array.push(element)`) don't accidentally mutate arrays in other parts of the config.
	*/
	const scaleBreak = () => [
		"auto",
		"avoid",
		"all",
		"avoid-page",
		"page",
		"left",
		"right",
		"column"
	];
	const scalePosition = () => [
		"center",
		"top",
		"bottom",
		"left",
		"right",
		"top-left",
		"left-top",
		"top-right",
		"right-top",
		"bottom-right",
		"right-bottom",
		"bottom-left",
		"left-bottom"
	];
	const scalePositionWithArbitrary = () => [
		...scalePosition(),
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleOverflow = () => [
		"auto",
		"hidden",
		"clip",
		"visible",
		"scroll"
	];
	const scaleOverscroll = () => [
		"auto",
		"contain",
		"none"
	];
	const scaleUnambiguousSpacing = () => [
		isArbitraryVariable,
		isArbitraryValue,
		themeSpacing
	];
	const scaleInset = () => [
		isFraction,
		"full",
		"auto",
		...scaleUnambiguousSpacing()
	];
	const scaleGridTemplateColsRows = () => [
		isInteger,
		"none",
		"subgrid",
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleGridColRowStartAndEnd = () => [
		"auto",
		{ span: [
			"full",
			isInteger,
			isArbitraryVariable,
			isArbitraryValue
		] },
		isInteger,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleGridColRowStartOrEnd = () => [
		isInteger,
		"auto",
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleGridAutoColsRows = () => [
		"auto",
		"min",
		"max",
		"fr",
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleAlignPrimaryAxis = () => [
		"start",
		"end",
		"center",
		"between",
		"around",
		"evenly",
		"stretch",
		"baseline",
		"center-safe",
		"end-safe"
	];
	const scaleAlignSecondaryAxis = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	];
	const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
	const scaleSizing = () => [
		isFraction,
		"auto",
		"full",
		"dvw",
		"dvh",
		"lvw",
		"lvh",
		"svw",
		"svh",
		"min",
		"max",
		"fit",
		...scaleUnambiguousSpacing()
	];
	const scaleSizingInline = () => [
		isFraction,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...scaleUnambiguousSpacing()
	];
	const scaleSizingBlock = () => [
		isFraction,
		"screen",
		"full",
		"lh",
		"dvh",
		"lvh",
		"svh",
		"min",
		"max",
		"fit",
		...scaleUnambiguousSpacing()
	];
	const scaleColor = () => [
		themeColor,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleBgPosition = () => [
		...scalePosition(),
		isArbitraryVariablePosition,
		isArbitraryPosition,
		{ position: [isArbitraryVariable, isArbitraryValue] }
	];
	const scaleBgRepeat = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }];
	const scaleBgSize = () => [
		"auto",
		"cover",
		"contain",
		isArbitraryVariableSize,
		isArbitrarySize,
		{ size: [isArbitraryVariable, isArbitraryValue] }
	];
	const scaleGradientStopPosition = () => [
		isPercent,
		isArbitraryVariableLength,
		isArbitraryLength
	];
	const scaleRadius = () => [
		"",
		"none",
		"full",
		themeRadius,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleBorderWidth = () => [
		"",
		isNumber,
		isArbitraryVariableLength,
		isArbitraryLength
	];
	const scaleLineStyle = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	];
	const scaleBlendMode = () => [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity"
	];
	const scaleMaskImagePosition = () => [
		isNumber,
		isPercent,
		isArbitraryVariablePosition,
		isArbitraryPosition
	];
	const scaleBlur = () => [
		"",
		"none",
		themeBlur,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleRotate = () => [
		"none",
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleScale = () => [
		"none",
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleSkew = () => [
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleTranslate = () => [
		isFraction,
		"full",
		...scaleUnambiguousSpacing()
	];
	return {
		cacheSize: 500,
		theme: {
			animate: [
				"spin",
				"ping",
				"pulse",
				"bounce"
			],
			aspect: ["video"],
			blur: [isTshirtSize],
			breakpoint: [isTshirtSize],
			color: [isAny],
			container: [isTshirtSize],
			"drop-shadow": [isTshirtSize],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [isAnyNonArbitrary],
			"font-weight": [
				"thin",
				"extralight",
				"light",
				"normal",
				"medium",
				"semibold",
				"bold",
				"extrabold",
				"black"
			],
			"inset-shadow": [isTshirtSize],
			leading: [
				"none",
				"tight",
				"snug",
				"normal",
				"relaxed",
				"loose"
			],
			perspective: [
				"dramatic",
				"near",
				"normal",
				"midrange",
				"distant",
				"none"
			],
			radius: [isTshirtSize],
			shadow: [isTshirtSize],
			spacing: ["px", isNumber],
			text: [isTshirtSize],
			"text-shadow": [isTshirtSize],
			tracking: [
				"tighter",
				"tight",
				"normal",
				"wide",
				"wider",
				"widest"
			]
		},
		classGroups: {
			aspect: [{ aspect: [
				"auto",
				"square",
				isFraction,
				isArbitraryValue,
				isArbitraryVariable,
				themeAspect
			] }],
			container: ["container"],
			columns: [{ columns: [
				isNumber,
				isArbitraryValue,
				isArbitraryVariable,
				themeContainer
			] }],
			"break-after": [{ "break-after": scaleBreak() }],
			"break-before": [{ "break-before": scaleBreak() }],
			"break-inside": [{ "break-inside": [
				"auto",
				"avoid",
				"avoid-page",
				"avoid-column"
			] }],
			"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
			box: [{ box: ["border", "content"] }],
			display: [
				"block",
				"inline-block",
				"inline",
				"flex",
				"inline-flex",
				"table",
				"inline-table",
				"table-caption",
				"table-cell",
				"table-column",
				"table-column-group",
				"table-footer-group",
				"table-header-group",
				"table-row-group",
				"table-row",
				"flow-root",
				"grid",
				"inline-grid",
				"contents",
				"list-item",
				"hidden"
			],
			sr: ["sr-only", "not-sr-only"],
			float: [{ float: [
				"right",
				"left",
				"none",
				"start",
				"end"
			] }],
			clear: [{ clear: [
				"left",
				"right",
				"both",
				"none",
				"start",
				"end"
			] }],
			isolation: ["isolate", "isolation-auto"],
			"object-fit": [{ object: [
				"contain",
				"cover",
				"fill",
				"none",
				"scale-down"
			] }],
			"object-position": [{ object: scalePositionWithArbitrary() }],
			overflow: [{ overflow: scaleOverflow() }],
			"overflow-x": [{ "overflow-x": scaleOverflow() }],
			"overflow-y": [{ "overflow-y": scaleOverflow() }],
			overscroll: [{ overscroll: scaleOverscroll() }],
			"overscroll-x": [{ "overscroll-x": scaleOverscroll() }],
			"overscroll-y": [{ "overscroll-y": scaleOverscroll() }],
			position: [
				"static",
				"fixed",
				"absolute",
				"relative",
				"sticky"
			],
			inset: [{ inset: scaleInset() }],
			"inset-x": [{ "inset-x": scaleInset() }],
			"inset-y": [{ "inset-y": scaleInset() }],
			start: [{
				"inset-s": scaleInset(),
				start: scaleInset()
			}],
			end: [{
				"inset-e": scaleInset(),
				end: scaleInset()
			}],
			"inset-bs": [{ "inset-bs": scaleInset() }],
			"inset-be": [{ "inset-be": scaleInset() }],
			top: [{ top: scaleInset() }],
			right: [{ right: scaleInset() }],
			bottom: [{ bottom: scaleInset() }],
			left: [{ left: scaleInset() }],
			visibility: [
				"visible",
				"invisible",
				"collapse"
			],
			z: [{ z: [
				isInteger,
				"auto",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			basis: [{ basis: [
				isFraction,
				"full",
				"auto",
				themeContainer,
				...scaleUnambiguousSpacing()
			] }],
			"flex-direction": [{ flex: [
				"row",
				"row-reverse",
				"col",
				"col-reverse"
			] }],
			"flex-wrap": [{ flex: [
				"nowrap",
				"wrap",
				"wrap-reverse"
			] }],
			flex: [{ flex: [
				isNumber,
				isFraction,
				"auto",
				"initial",
				"none",
				isArbitraryValue
			] }],
			grow: [{ grow: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			shrink: [{ shrink: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			order: [{ order: [
				isInteger,
				"first",
				"last",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"grid-cols": [{ "grid-cols": scaleGridTemplateColsRows() }],
			"col-start-end": [{ col: scaleGridColRowStartAndEnd() }],
			"col-start": [{ "col-start": scaleGridColRowStartOrEnd() }],
			"col-end": [{ "col-end": scaleGridColRowStartOrEnd() }],
			"grid-rows": [{ "grid-rows": scaleGridTemplateColsRows() }],
			"row-start-end": [{ row: scaleGridColRowStartAndEnd() }],
			"row-start": [{ "row-start": scaleGridColRowStartOrEnd() }],
			"row-end": [{ "row-end": scaleGridColRowStartOrEnd() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": scaleGridAutoColsRows() }],
			"auto-rows": [{ "auto-rows": scaleGridAutoColsRows() }],
			gap: [{ gap: scaleUnambiguousSpacing() }],
			"gap-x": [{ "gap-x": scaleUnambiguousSpacing() }],
			"gap-y": [{ "gap-y": scaleUnambiguousSpacing() }],
			"justify-content": [{ justify: [...scaleAlignPrimaryAxis(), "normal"] }],
			"justify-items": [{ "justify-items": [...scaleAlignSecondaryAxis(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...scaleAlignSecondaryAxis()] }],
			"align-content": [{ content: ["normal", ...scaleAlignPrimaryAxis()] }],
			"align-items": [{ items: [...scaleAlignSecondaryAxis(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...scaleAlignSecondaryAxis(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": scaleAlignPrimaryAxis() }],
			"place-items": [{ "place-items": [...scaleAlignSecondaryAxis(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...scaleAlignSecondaryAxis()] }],
			p: [{ p: scaleUnambiguousSpacing() }],
			px: [{ px: scaleUnambiguousSpacing() }],
			py: [{ py: scaleUnambiguousSpacing() }],
			ps: [{ ps: scaleUnambiguousSpacing() }],
			pe: [{ pe: scaleUnambiguousSpacing() }],
			pbs: [{ pbs: scaleUnambiguousSpacing() }],
			pbe: [{ pbe: scaleUnambiguousSpacing() }],
			pt: [{ pt: scaleUnambiguousSpacing() }],
			pr: [{ pr: scaleUnambiguousSpacing() }],
			pb: [{ pb: scaleUnambiguousSpacing() }],
			pl: [{ pl: scaleUnambiguousSpacing() }],
			m: [{ m: scaleMargin() }],
			mx: [{ mx: scaleMargin() }],
			my: [{ my: scaleMargin() }],
			ms: [{ ms: scaleMargin() }],
			me: [{ me: scaleMargin() }],
			mbs: [{ mbs: scaleMargin() }],
			mbe: [{ mbe: scaleMargin() }],
			mt: [{ mt: scaleMargin() }],
			mr: [{ mr: scaleMargin() }],
			mb: [{ mb: scaleMargin() }],
			ml: [{ ml: scaleMargin() }],
			"space-x": [{ "space-x": scaleUnambiguousSpacing() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": scaleUnambiguousSpacing() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: scaleSizing() }],
			"inline-size": [{ inline: ["auto", ...scaleSizingInline()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...scaleSizingInline()] }],
			"max-inline-size": [{ "max-inline": ["none", ...scaleSizingInline()] }],
			"block-size": [{ block: ["auto", ...scaleSizingBlock()] }],
			"min-block-size": [{ "min-block": ["auto", ...scaleSizingBlock()] }],
			"max-block-size": [{ "max-block": ["none", ...scaleSizingBlock()] }],
			w: [{ w: [
				themeContainer,
				"screen",
				...scaleSizing()
			] }],
			"min-w": [{ "min-w": [
				themeContainer,
				"screen",
				"none",
				...scaleSizing()
			] }],
			"max-w": [{ "max-w": [
				themeContainer,
				"screen",
				"none",
				"prose",
				{ screen: [themeBreakpoint] },
				...scaleSizing()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...scaleSizing()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...scaleSizing()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...scaleSizing()
			] }],
			"font-size": [{ text: [
				"base",
				themeText,
				isArbitraryVariableLength,
				isArbitraryLength
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				themeFontWeight,
				isArbitraryVariableWeight,
				isArbitraryWeight
			] }],
			"font-stretch": [{ "font-stretch": [
				"ultra-condensed",
				"extra-condensed",
				"condensed",
				"semi-condensed",
				"normal",
				"semi-expanded",
				"expanded",
				"extra-expanded",
				"ultra-expanded",
				isPercent,
				isArbitraryValue
			] }],
			"font-family": [{ font: [
				isArbitraryVariableFamilyName,
				isArbitraryFamilyName,
				themeFont
			] }],
			"font-features": [{ "font-features": [isArbitraryValue] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				themeTracking,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"line-clamp": [{ "line-clamp": [
				isNumber,
				"none",
				isArbitraryVariable,
				isArbitraryNumber
			] }],
			leading: [{ leading: [themeLeading, ...scaleUnambiguousSpacing()] }],
			"list-image": [{ "list-image": [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			"placeholder-color": [{ placeholder: scaleColor() }],
			"text-color": [{ text: scaleColor() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...scaleLineStyle(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				isNumber,
				"from-font",
				"auto",
				isArbitraryVariable,
				isArbitraryLength
			] }],
			"text-decoration-color": [{ decoration: scaleColor() }],
			"underline-offset": [{ "underline-offset": [
				isNumber,
				"auto",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"text-transform": [
				"uppercase",
				"lowercase",
				"capitalize",
				"normal-case"
			],
			"text-overflow": [
				"truncate",
				"text-ellipsis",
				"text-clip"
			],
			"text-wrap": [{ text: [
				"wrap",
				"nowrap",
				"balance",
				"pretty"
			] }],
			indent: [{ indent: scaleUnambiguousSpacing() }],
			"vertical-align": [{ align: [
				"baseline",
				"top",
				"middle",
				"bottom",
				"text-top",
				"text-bottom",
				"sub",
				"super",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			whitespace: [{ whitespace: [
				"normal",
				"nowrap",
				"pre",
				"pre-line",
				"pre-wrap",
				"break-spaces"
			] }],
			break: [{ break: [
				"normal",
				"words",
				"all",
				"keep"
			] }],
			wrap: [{ wrap: [
				"break-word",
				"anywhere",
				"normal"
			] }],
			hyphens: [{ hyphens: [
				"none",
				"manual",
				"auto"
			] }],
			content: [{ content: [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"bg-attachment": [{ bg: [
				"fixed",
				"local",
				"scroll"
			] }],
			"bg-clip": [{ "bg-clip": [
				"border",
				"padding",
				"content",
				"text"
			] }],
			"bg-origin": [{ "bg-origin": [
				"border",
				"padding",
				"content"
			] }],
			"bg-position": [{ bg: scaleBgPosition() }],
			"bg-repeat": [{ bg: scaleBgRepeat() }],
			"bg-size": [{ bg: scaleBgSize() }],
			"bg-image": [{ bg: [
				"none",
				{
					linear: [
						{ to: [
							"t",
							"tr",
							"r",
							"br",
							"b",
							"bl",
							"l",
							"tl"
						] },
						isInteger,
						isArbitraryVariable,
						isArbitraryValue
					],
					radial: [
						"",
						isArbitraryVariable,
						isArbitraryValue
					],
					conic: [
						isInteger,
						isArbitraryVariable,
						isArbitraryValue
					]
				},
				isArbitraryVariableImage,
				isArbitraryImage
			] }],
			"bg-color": [{ bg: scaleColor() }],
			"gradient-from-pos": [{ from: scaleGradientStopPosition() }],
			"gradient-via-pos": [{ via: scaleGradientStopPosition() }],
			"gradient-to-pos": [{ to: scaleGradientStopPosition() }],
			"gradient-from": [{ from: scaleColor() }],
			"gradient-via": [{ via: scaleColor() }],
			"gradient-to": [{ to: scaleColor() }],
			rounded: [{ rounded: scaleRadius() }],
			"rounded-s": [{ "rounded-s": scaleRadius() }],
			"rounded-e": [{ "rounded-e": scaleRadius() }],
			"rounded-t": [{ "rounded-t": scaleRadius() }],
			"rounded-r": [{ "rounded-r": scaleRadius() }],
			"rounded-b": [{ "rounded-b": scaleRadius() }],
			"rounded-l": [{ "rounded-l": scaleRadius() }],
			"rounded-ss": [{ "rounded-ss": scaleRadius() }],
			"rounded-se": [{ "rounded-se": scaleRadius() }],
			"rounded-ee": [{ "rounded-ee": scaleRadius() }],
			"rounded-es": [{ "rounded-es": scaleRadius() }],
			"rounded-tl": [{ "rounded-tl": scaleRadius() }],
			"rounded-tr": [{ "rounded-tr": scaleRadius() }],
			"rounded-br": [{ "rounded-br": scaleRadius() }],
			"rounded-bl": [{ "rounded-bl": scaleRadius() }],
			"border-w": [{ border: scaleBorderWidth() }],
			"border-w-x": [{ "border-x": scaleBorderWidth() }],
			"border-w-y": [{ "border-y": scaleBorderWidth() }],
			"border-w-s": [{ "border-s": scaleBorderWidth() }],
			"border-w-e": [{ "border-e": scaleBorderWidth() }],
			"border-w-bs": [{ "border-bs": scaleBorderWidth() }],
			"border-w-be": [{ "border-be": scaleBorderWidth() }],
			"border-w-t": [{ "border-t": scaleBorderWidth() }],
			"border-w-r": [{ "border-r": scaleBorderWidth() }],
			"border-w-b": [{ "border-b": scaleBorderWidth() }],
			"border-w-l": [{ "border-l": scaleBorderWidth() }],
			"divide-x": [{ "divide-x": scaleBorderWidth() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": scaleBorderWidth() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...scaleLineStyle(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...scaleLineStyle(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: scaleColor() }],
			"border-color-x": [{ "border-x": scaleColor() }],
			"border-color-y": [{ "border-y": scaleColor() }],
			"border-color-s": [{ "border-s": scaleColor() }],
			"border-color-e": [{ "border-e": scaleColor() }],
			"border-color-bs": [{ "border-bs": scaleColor() }],
			"border-color-be": [{ "border-be": scaleColor() }],
			"border-color-t": [{ "border-t": scaleColor() }],
			"border-color-r": [{ "border-r": scaleColor() }],
			"border-color-b": [{ "border-b": scaleColor() }],
			"border-color-l": [{ "border-l": scaleColor() }],
			"divide-color": [{ divide: scaleColor() }],
			"outline-style": [{ outline: [
				...scaleLineStyle(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"outline-w": [{ outline: [
				"",
				isNumber,
				isArbitraryVariableLength,
				isArbitraryLength
			] }],
			"outline-color": [{ outline: scaleColor() }],
			shadow: [{ shadow: [
				"",
				"none",
				themeShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			"shadow-color": [{ shadow: scaleColor() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				themeInsetShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			"inset-shadow-color": [{ "inset-shadow": scaleColor() }],
			"ring-w": [{ ring: scaleBorderWidth() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: scaleColor() }],
			"ring-offset-w": [{ "ring-offset": [isNumber, isArbitraryLength] }],
			"ring-offset-color": [{ "ring-offset": scaleColor() }],
			"inset-ring-w": [{ "inset-ring": scaleBorderWidth() }],
			"inset-ring-color": [{ "inset-ring": scaleColor() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				themeTextShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			"text-shadow-color": [{ "text-shadow": scaleColor() }],
			opacity: [{ opacity: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"mix-blend": [{ "mix-blend": [
				...scaleBlendMode(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": scaleBlendMode() }],
			"mask-clip": [{ "mask-clip": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }, "mask-no-clip"],
			"mask-composite": [{ mask: [
				"add",
				"subtract",
				"intersect",
				"exclude"
			] }],
			"mask-image-linear-pos": [{ "mask-linear": [isNumber] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": scaleMaskImagePosition() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": scaleMaskImagePosition() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": scaleColor() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": scaleColor() }],
			"mask-image-t-from-pos": [{ "mask-t-from": scaleMaskImagePosition() }],
			"mask-image-t-to-pos": [{ "mask-t-to": scaleMaskImagePosition() }],
			"mask-image-t-from-color": [{ "mask-t-from": scaleColor() }],
			"mask-image-t-to-color": [{ "mask-t-to": scaleColor() }],
			"mask-image-r-from-pos": [{ "mask-r-from": scaleMaskImagePosition() }],
			"mask-image-r-to-pos": [{ "mask-r-to": scaleMaskImagePosition() }],
			"mask-image-r-from-color": [{ "mask-r-from": scaleColor() }],
			"mask-image-r-to-color": [{ "mask-r-to": scaleColor() }],
			"mask-image-b-from-pos": [{ "mask-b-from": scaleMaskImagePosition() }],
			"mask-image-b-to-pos": [{ "mask-b-to": scaleMaskImagePosition() }],
			"mask-image-b-from-color": [{ "mask-b-from": scaleColor() }],
			"mask-image-b-to-color": [{ "mask-b-to": scaleColor() }],
			"mask-image-l-from-pos": [{ "mask-l-from": scaleMaskImagePosition() }],
			"mask-image-l-to-pos": [{ "mask-l-to": scaleMaskImagePosition() }],
			"mask-image-l-from-color": [{ "mask-l-from": scaleColor() }],
			"mask-image-l-to-color": [{ "mask-l-to": scaleColor() }],
			"mask-image-x-from-pos": [{ "mask-x-from": scaleMaskImagePosition() }],
			"mask-image-x-to-pos": [{ "mask-x-to": scaleMaskImagePosition() }],
			"mask-image-x-from-color": [{ "mask-x-from": scaleColor() }],
			"mask-image-x-to-color": [{ "mask-x-to": scaleColor() }],
			"mask-image-y-from-pos": [{ "mask-y-from": scaleMaskImagePosition() }],
			"mask-image-y-to-pos": [{ "mask-y-to": scaleMaskImagePosition() }],
			"mask-image-y-from-color": [{ "mask-y-from": scaleColor() }],
			"mask-image-y-to-color": [{ "mask-y-to": scaleColor() }],
			"mask-image-radial": [{ "mask-radial": [isArbitraryVariable, isArbitraryValue] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": scaleMaskImagePosition() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": scaleMaskImagePosition() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": scaleColor() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": scaleColor() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": scalePosition() }],
			"mask-image-conic-pos": [{ "mask-conic": [isNumber] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": scaleMaskImagePosition() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": scaleMaskImagePosition() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": scaleColor() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": scaleColor() }],
			"mask-mode": [{ mask: [
				"alpha",
				"luminance",
				"match"
			] }],
			"mask-origin": [{ "mask-origin": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }],
			"mask-position": [{ mask: scaleBgPosition() }],
			"mask-repeat": [{ mask: scaleBgRepeat() }],
			"mask-size": [{ mask: scaleBgSize() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			filter: [{ filter: [
				"",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			blur: [{ blur: scaleBlur() }],
			brightness: [{ brightness: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			contrast: [{ contrast: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				themeDropShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			"drop-shadow-color": [{ "drop-shadow": scaleColor() }],
			grayscale: [{ grayscale: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"hue-rotate": [{ "hue-rotate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			invert: [{ invert: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			saturate: [{ saturate: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			sepia: [{ sepia: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-blur": [{ "backdrop-blur": scaleBlur() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"border-collapse": [{ border: ["collapse", "separate"] }],
			"border-spacing": [{ "border-spacing": scaleUnambiguousSpacing() }],
			"border-spacing-x": [{ "border-spacing-x": scaleUnambiguousSpacing() }],
			"border-spacing-y": [{ "border-spacing-y": scaleUnambiguousSpacing() }],
			"table-layout": [{ table: ["auto", "fixed"] }],
			caption: [{ caption: ["top", "bottom"] }],
			transition: [{ transition: [
				"",
				"all",
				"colors",
				"opacity",
				"shadow",
				"transform",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				isNumber,
				"initial",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				themeEase,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			delay: [{ delay: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			animate: [{ animate: [
				"none",
				themeAnimate,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				themePerspective,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"perspective-origin": [{ "perspective-origin": scalePositionWithArbitrary() }],
			rotate: [{ rotate: scaleRotate() }],
			"rotate-x": [{ "rotate-x": scaleRotate() }],
			"rotate-y": [{ "rotate-y": scaleRotate() }],
			"rotate-z": [{ "rotate-z": scaleRotate() }],
			scale: [{ scale: scaleScale() }],
			"scale-x": [{ "scale-x": scaleScale() }],
			"scale-y": [{ "scale-y": scaleScale() }],
			"scale-z": [{ "scale-z": scaleScale() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: scaleSkew() }],
			"skew-x": [{ "skew-x": scaleSkew() }],
			"skew-y": [{ "skew-y": scaleSkew() }],
			transform: [{ transform: [
				isArbitraryVariable,
				isArbitraryValue,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: scalePositionWithArbitrary() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: scaleTranslate() }],
			"translate-x": [{ "translate-x": scaleTranslate() }],
			"translate-y": [{ "translate-y": scaleTranslate() }],
			"translate-z": [{ "translate-z": scaleTranslate() }],
			"translate-none": ["translate-none"],
			accent: [{ accent: scaleColor() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: scaleColor() }],
			"color-scheme": [{ scheme: [
				"normal",
				"dark",
				"light",
				"light-dark",
				"only-dark",
				"only-light"
			] }],
			cursor: [{ cursor: [
				"auto",
				"default",
				"pointer",
				"wait",
				"text",
				"move",
				"help",
				"not-allowed",
				"none",
				"context-menu",
				"progress",
				"cell",
				"crosshair",
				"vertical-text",
				"alias",
				"copy",
				"no-drop",
				"grab",
				"grabbing",
				"all-scroll",
				"col-resize",
				"row-resize",
				"n-resize",
				"e-resize",
				"s-resize",
				"w-resize",
				"ne-resize",
				"nw-resize",
				"se-resize",
				"sw-resize",
				"ew-resize",
				"ns-resize",
				"nesw-resize",
				"nwse-resize",
				"zoom-in",
				"zoom-out",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
			"pointer-events": [{ "pointer-events": ["auto", "none"] }],
			resize: [{ resize: [
				"none",
				"",
				"y",
				"x"
			] }],
			"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
			"scroll-m": [{ "scroll-m": scaleUnambiguousSpacing() }],
			"scroll-mx": [{ "scroll-mx": scaleUnambiguousSpacing() }],
			"scroll-my": [{ "scroll-my": scaleUnambiguousSpacing() }],
			"scroll-ms": [{ "scroll-ms": scaleUnambiguousSpacing() }],
			"scroll-me": [{ "scroll-me": scaleUnambiguousSpacing() }],
			"scroll-mbs": [{ "scroll-mbs": scaleUnambiguousSpacing() }],
			"scroll-mbe": [{ "scroll-mbe": scaleUnambiguousSpacing() }],
			"scroll-mt": [{ "scroll-mt": scaleUnambiguousSpacing() }],
			"scroll-mr": [{ "scroll-mr": scaleUnambiguousSpacing() }],
			"scroll-mb": [{ "scroll-mb": scaleUnambiguousSpacing() }],
			"scroll-ml": [{ "scroll-ml": scaleUnambiguousSpacing() }],
			"scroll-p": [{ "scroll-p": scaleUnambiguousSpacing() }],
			"scroll-px": [{ "scroll-px": scaleUnambiguousSpacing() }],
			"scroll-py": [{ "scroll-py": scaleUnambiguousSpacing() }],
			"scroll-ps": [{ "scroll-ps": scaleUnambiguousSpacing() }],
			"scroll-pe": [{ "scroll-pe": scaleUnambiguousSpacing() }],
			"scroll-pbs": [{ "scroll-pbs": scaleUnambiguousSpacing() }],
			"scroll-pbe": [{ "scroll-pbe": scaleUnambiguousSpacing() }],
			"scroll-pt": [{ "scroll-pt": scaleUnambiguousSpacing() }],
			"scroll-pr": [{ "scroll-pr": scaleUnambiguousSpacing() }],
			"scroll-pb": [{ "scroll-pb": scaleUnambiguousSpacing() }],
			"scroll-pl": [{ "scroll-pl": scaleUnambiguousSpacing() }],
			"snap-align": [{ snap: [
				"start",
				"end",
				"center",
				"align-none"
			] }],
			"snap-stop": [{ snap: ["normal", "always"] }],
			"snap-type": [{ snap: [
				"none",
				"x",
				"y",
				"both"
			] }],
			"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
			touch: [{ touch: [
				"auto",
				"none",
				"manipulation"
			] }],
			"touch-x": [{ "touch-pan": [
				"x",
				"left",
				"right"
			] }],
			"touch-y": [{ "touch-pan": [
				"y",
				"up",
				"down"
			] }],
			"touch-pz": ["touch-pinch-zoom"],
			select: [{ select: [
				"none",
				"text",
				"all",
				"auto"
			] }],
			"will-change": [{ "will-change": [
				"auto",
				"scroll",
				"contents",
				"transform",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			fill: [{ fill: ["none", ...scaleColor()] }],
			"stroke-w": [{ stroke: [
				isNumber,
				isArbitraryVariableLength,
				isArbitraryLength,
				isArbitraryNumber
			] }],
			stroke: [{ stroke: ["none", ...scaleColor()] }],
			"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }]
		},
		conflictingClassGroups: {
			overflow: ["overflow-x", "overflow-y"],
			overscroll: ["overscroll-x", "overscroll-y"],
			inset: [
				"inset-x",
				"inset-y",
				"inset-bs",
				"inset-be",
				"start",
				"end",
				"top",
				"right",
				"bottom",
				"left"
			],
			"inset-x": ["right", "left"],
			"inset-y": ["top", "bottom"],
			flex: [
				"basis",
				"grow",
				"shrink"
			],
			gap: ["gap-x", "gap-y"],
			p: [
				"px",
				"py",
				"ps",
				"pe",
				"pbs",
				"pbe",
				"pt",
				"pr",
				"pb",
				"pl"
			],
			px: ["pr", "pl"],
			py: ["pt", "pb"],
			m: [
				"mx",
				"my",
				"ms",
				"me",
				"mbs",
				"mbe",
				"mt",
				"mr",
				"mb",
				"ml"
			],
			mx: ["mr", "ml"],
			my: ["mt", "mb"],
			size: ["w", "h"],
			"font-size": ["leading"],
			"fvn-normal": [
				"fvn-ordinal",
				"fvn-slashed-zero",
				"fvn-figure",
				"fvn-spacing",
				"fvn-fraction"
			],
			"fvn-ordinal": ["fvn-normal"],
			"fvn-slashed-zero": ["fvn-normal"],
			"fvn-figure": ["fvn-normal"],
			"fvn-spacing": ["fvn-normal"],
			"fvn-fraction": ["fvn-normal"],
			"line-clamp": ["display", "overflow"],
			rounded: [
				"rounded-s",
				"rounded-e",
				"rounded-t",
				"rounded-r",
				"rounded-b",
				"rounded-l",
				"rounded-ss",
				"rounded-se",
				"rounded-ee",
				"rounded-es",
				"rounded-tl",
				"rounded-tr",
				"rounded-br",
				"rounded-bl"
			],
			"rounded-s": ["rounded-ss", "rounded-es"],
			"rounded-e": ["rounded-se", "rounded-ee"],
			"rounded-t": ["rounded-tl", "rounded-tr"],
			"rounded-r": ["rounded-tr", "rounded-br"],
			"rounded-b": ["rounded-br", "rounded-bl"],
			"rounded-l": ["rounded-tl", "rounded-bl"],
			"border-spacing": ["border-spacing-x", "border-spacing-y"],
			"border-w": [
				"border-w-x",
				"border-w-y",
				"border-w-s",
				"border-w-e",
				"border-w-bs",
				"border-w-be",
				"border-w-t",
				"border-w-r",
				"border-w-b",
				"border-w-l"
			],
			"border-w-x": ["border-w-r", "border-w-l"],
			"border-w-y": ["border-w-t", "border-w-b"],
			"border-color": [
				"border-color-x",
				"border-color-y",
				"border-color-s",
				"border-color-e",
				"border-color-bs",
				"border-color-be",
				"border-color-t",
				"border-color-r",
				"border-color-b",
				"border-color-l"
			],
			"border-color-x": ["border-color-r", "border-color-l"],
			"border-color-y": ["border-color-t", "border-color-b"],
			translate: [
				"translate-x",
				"translate-y",
				"translate-none"
			],
			"translate-none": [
				"translate",
				"translate-x",
				"translate-y",
				"translate-z"
			],
			"scroll-m": [
				"scroll-mx",
				"scroll-my",
				"scroll-ms",
				"scroll-me",
				"scroll-mbs",
				"scroll-mbe",
				"scroll-mt",
				"scroll-mr",
				"scroll-mb",
				"scroll-ml"
			],
			"scroll-mx": ["scroll-mr", "scroll-ml"],
			"scroll-my": ["scroll-mt", "scroll-mb"],
			"scroll-p": [
				"scroll-px",
				"scroll-py",
				"scroll-ps",
				"scroll-pe",
				"scroll-pbs",
				"scroll-pbe",
				"scroll-pt",
				"scroll-pr",
				"scroll-pb",
				"scroll-pl"
			],
			"scroll-px": ["scroll-pr", "scroll-pl"],
			"scroll-py": ["scroll-pt", "scroll-pb"],
			touch: [
				"touch-x",
				"touch-y",
				"touch-pz"
			],
			"touch-x": ["touch"],
			"touch-y": ["touch"],
			"touch-pz": ["touch"]
		},
		conflictingClassGroupModifiers: { "font-size": ["leading"] },
		orderSensitiveModifiers: [
			"*",
			"**",
			"after",
			"backdrop",
			"before",
			"details-content",
			"file",
			"first-letter",
			"first-line",
			"marker",
			"placeholder",
			"selection"
		]
	};
};
var twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);
//#endregion
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region src/components/ui/Card.tsx
var Card = React$1.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", {
	ref,
	className: cn("rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = React$1.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = React$1.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("h3", {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight text-slate-800", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = React$1.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("p", {
	ref,
	className: cn("text-sm text-slate-500", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = React$1.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = React$1.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
var CircleCheckBig = createLucideIcon("CircleCheckBig", [["path", {
	d: "M21.801 10A10 10 0 1 1 17 3.335",
	key: "yps3ct"
}], ["path", {
	d: "m9 11 3 3L22 4",
	key: "1pflzl"
}]]);
var CircleX = createLucideIcon("CircleX", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "m15 9-6 6",
		key: "1uzhvr"
	}],
	["path", {
		d: "m9 9 6 6",
		key: "z0biqf"
	}]
]);
var Store = createLucideIcon("Store", [
	["path", {
		d: "m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7",
		key: "ztvudi"
	}],
	["path", {
		d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",
		key: "1b2hhj"
	}],
	["path", {
		d: "M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4",
		key: "2ebpfo"
	}],
	["path", {
		d: "M2 7h20",
		key: "1fcdvo"
	}],
	["path", {
		d: "M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7",
		key: "6c3vgh"
	}]
]);
var Calendar = createLucideIcon("Calendar", [
	["path", {
		d: "M8 2v4",
		key: "1cmpym"
	}],
	["path", {
		d: "M16 2v4",
		key: "4m81vk"
	}],
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "4",
		rx: "2",
		key: "1hopcy"
	}],
	["path", {
		d: "M3 10h18",
		key: "8toen8"
	}]
]);
var FileText = createLucideIcon("FileText", [
	["path", {
		d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
		key: "1rqfz7"
	}],
	["path", {
		d: "M14 2v4a2 2 0 0 0 2 2h4",
		key: "tnqrlb"
	}],
	["path", {
		d: "M10 9H8",
		key: "b1mrlr"
	}],
	["path", {
		d: "M16 13H8",
		key: "t4e002"
	}],
	["path", {
		d: "M16 17H8",
		key: "z1uh3a"
	}]
]);
//#endregion
//#region src/lib/api.ts
async function apiFetch(url, options = {}) {
	let token;
	try {
		if (typeof window !== "undefined") token = (await getBrowserSession())?.accessToken;
	} catch (e) {}
	const headers = new Headers(options.headers);
	if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
	const res = await fetch(url, {
		...options,
		headers
	});
	const json = await res.json();
	if ("success" in json) {
		const typedJson = json;
		if (!res.ok || !typedJson.success) throw new Error(typedJson.error?.message || "API Request failed");
		return typedJson.data;
	}
	if (!res.ok) throw new Error("API Request failed");
	return json;
}
var X = createLucideIcon("X", [["path", {
	d: "M18 6 6 18",
	key: "1bl5f8"
}], ["path", {
	d: "m6 6 12 12",
	key: "d8bk6v"
}]]);
var Info = createLucideIcon("Info", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M12 16v-4",
		key: "1dtifu"
	}],
	["path", {
		d: "M12 8h.01",
		key: "e9boi3"
	}]
]);
var ArrowRight = createLucideIcon("ArrowRight", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "m12 5 7 7-7 7",
	key: "xquz4c"
}]]);
//#endregion
//#region src/components/providers/ToastProvider.tsx
var ToastContext = createContext(void 0);
function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);
	const showToast = useCallback((message, type = "success", title) => {
		const id = `${Date.now()}`;
		setToasts((prev) => [...prev, {
			id,
			message,
			type,
			title
		}]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 6e3);
	}, []);
	return /* @__PURE__ */ jsxs(ToastContext.Provider, {
		value: { showToast },
		children: [children, mounted && /* @__PURE__ */ jsx("div", {
			id: "ze-toast-container",
			className: "fixed bottom-6 right-6 z-[100000] flex flex-col gap-4 pointer-events-none",
			children: toasts.map((toast) => /* @__PURE__ */ jsxs("div", {
				className: "pointer-events-auto flex flex-col p-5 rounded-3xl border-[4px] border-ze-black bg-ze-yellow shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] min-w-[360px] max-w-[420px] transition-all duration-300",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-4 mb-4",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "mt-1 p-2 bg-ze-black text-ze-yellow rounded-2xl shadow-lg",
							children: toast.type === "success" ? /* @__PURE__ */ jsx(CircleCheckBig, { className: "h-6 w-6 stroke-[3]" }) : toast.type === "error" ? /* @__PURE__ */ jsx(X, { className: "h-6 w-6 stroke-[3]" }) : /* @__PURE__ */ jsx(Info, { className: "h-6 w-6 stroke-[3]" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex-1",
							children: [/* @__PURE__ */ jsx("h4", {
								className: "font-black text-ze-black uppercase tracking-tighter italic text-lg leading-none mb-1",
								children: toast.title || "Item Adicionado"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-bold text-ze-black/90 text-sm leading-tight uppercase",
								children: toast.message
							})]
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: () => removeToast(toast.id),
							className: "p-1 hover:bg-ze-black/10 rounded-lg transition-colors",
							children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5 stroke-[3]" })
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => removeToast(toast.id),
						className: "bg-white text-ze-black border-2 border-ze-black px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-ze-gray transition-all active:scale-95",
						children: "Escolher mais"
					}), /* @__PURE__ */ jsxs(Link, {
						href: "/cart",
						onClick: () => removeToast(toast.id),
						className: "bg-ze-black text-ze-yellow border-2 border-ze-black px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-ze-black/90 transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]",
						children: ["Ir p/ Carrinho", /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })]
					})]
				})]
			}, toast.id))
		})]
	});
}
function useToast() {
	const context = useContext(ToastContext);
	if (!context) throw new Error("useToast must be used within ToastProvider");
	return context;
}
//#endregion
//#region src/app/admin/credentialing/page.tsx
function AdminCredentialing() {
	const [activeTab, setActiveTab] = useState("sellers");
	const [sellers, setSellers] = useState([]);
	const [drivers, setDrivers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const { showToast } = useToast();
	const fetchSellers = async () => {
		try {
			setSellers((await apiFetch("/api/v1/admin/sellers")).filter((s) => s.status === "pending"));
		} catch (error) {
			showToast("Erro ao carregar lojistas", "error");
		}
	};
	const fetchDrivers = async () => {
		try {
			setDrivers((await apiFetch("/api/v1/admin/drivers")).filter((d) => d.status === "pending"));
		} catch (error) {
			showToast("Erro ao carregar entregadores", "error");
		}
	};
	const fetchData = async () => {
		setIsLoading(true);
		await Promise.all([fetchSellers(), fetchDrivers()]);
		setIsLoading(false);
	};
	useEffect(() => {
		fetchData();
	}, []);
	const handleApproveSeller = async (id) => {
		try {
			await apiFetch(`/api/v1/admin/sellers/${id}/approve`, { method: "POST" });
			showToast("Lojista aprovado com sucesso!", "success");
			setSellers((prev) => prev.filter((s) => s.id !== id));
		} catch (error) {
			showToast("Erro ao aprovar lojista", "error");
		}
	};
	const handleApproveDriver = async (id) => {
		try {
			await apiFetch(`/api/v1/admin/drivers/${id}/approve`, { method: "POST" });
			showToast("Entregador aprovado com sucesso!", "success");
			setDrivers((prev) => prev.filter((d) => d.id !== id));
		} catch (error) {
			showToast("Erro ao aprovar entregador", "error");
		}
	};
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Central de Credenciamento",
		role: "admin",
		children: /* @__PURE__ */ jsxs("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col md:flex-row md:items-end justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-black text-slate-800 uppercase tracking-tighter",
						children: "Solicitações Pendentes"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 text-sm",
						children: "Analise e aprove novos parceiros para a plataforma."
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex bg-slate-100 p-1 rounded-2xl",
					children: [/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("sellers"),
						className: `px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "sellers" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`,
						children: [
							"Lojistas (",
							sellers.length,
							")"
						]
					}), /* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("drivers"),
						className: `px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "drivers" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`,
						children: [
							"Entregadores (",
							drivers.length,
							")"
						]
					})]
				})]
			}), isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 gap-4 animate-pulse",
				children: [1, 2].map((i) => /* @__PURE__ */ jsx("div", { className: "h-32 bg-slate-100 rounded-3xl" }, i))
			}) : (activeTab === "sellers" ? sellers : drivers).length === 0 ? /* @__PURE__ */ jsx(Card, {
				className: "border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50",
				children: /* @__PURE__ */ jsxs(CardContent, {
					className: "p-12 text-center",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm",
						children: activeTab === "sellers" ? /* @__PURE__ */ jsx(Store, { className: "w-8 h-8 text-slate-300" }) : /* @__PURE__ */ jsx(Truck, { className: "w-8 h-8 text-slate-300" })
					}), /* @__PURE__ */ jsxs("p", {
						className: "text-slate-500 font-bold uppercase tracking-widest text-xs",
						children: [
							"Nenhuma solicitação de ",
							activeTab === "sellers" ? "lojista" : "entregador",
							" pendente."
						]
					})]
				})
			}) : /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 gap-4",
				children: activeTab === "sellers" ? sellers.map((seller) => /* @__PURE__ */ jsx(Card, {
					className: "border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-3xl group",
					children: /* @__PURE__ */ jsx(CardContent, {
						className: "p-6",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row md:items-center justify-between gap-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ jsx("div", {
									className: "w-14 h-14 bg-brand-amber/10 rounded-2xl flex items-center justify-center text-brand-amber shadow-inner",
									children: /* @__PURE__ */ jsx(Store, { className: "w-7 h-7" })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
									className: "text-lg font-black text-slate-800 uppercase tracking-tight",
									children: seller.name
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap gap-4 mt-1",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1.5 text-xs font-bold text-slate-400",
										children: [
											/* @__PURE__ */ jsx(FileText, { className: "w-3.5 h-3.5" }),
											" CNPJ: ",
											seller.document
										]
									}), /* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1.5 text-xs font-bold text-slate-400",
										children: [
											/* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" }),
											" ",
											new Date(seller.created_at).toLocaleDateString("pt-BR")
										]
									})]
								})] })]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsxs(Button, {
									variant: "ghost",
									className: "text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl",
									children: [/* @__PURE__ */ jsx(CircleX, { className: "w-5 h-5 mr-2" }), " Recusar"]
								}), /* @__PURE__ */ jsxs(Button, {
									onClick: () => handleApproveSeller(seller.id),
									className: "bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 px-6 font-bold",
									children: [/* @__PURE__ */ jsx(CircleCheckBig, { className: "w-5 h-5 mr-2" }), " Aprovar"]
								})]
							})]
						})
					})
				}, seller.id)) : drivers.map((driver) => /* @__PURE__ */ jsx(Card, {
					className: "border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-3xl group",
					children: /* @__PURE__ */ jsx(CardContent, {
						className: "p-6",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row md:items-center justify-between gap-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ jsx("div", {
									className: "w-14 h-14 bg-brand-teal/10 rounded-2xl flex items-center justify-center text-brand-teal shadow-inner",
									children: /* @__PURE__ */ jsx(Truck, { className: "w-7 h-7" })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
									className: "text-lg font-black text-slate-800 uppercase tracking-tight",
									children: driver.edges?.user?.name || "Entregador"
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap gap-4 mt-1",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1.5 text-xs font-bold text-slate-400",
										children: [
											/* @__PURE__ */ jsx(FileText, { className: "w-3.5 h-3.5" }),
											" Veículo: ",
											driver.vehicle_type || "N/A"
										]
									}), /* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1.5 text-xs font-bold text-slate-400",
										children: [
											/* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" }),
											" ",
											new Date(driver.created_at).toLocaleDateString("pt-BR")
										]
									})]
								})] })]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsxs(Button, {
									variant: "ghost",
									className: "text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl",
									children: [/* @__PURE__ */ jsx(CircleX, { className: "w-5 h-5 mr-2" }), " Recusar"]
								}), /* @__PURE__ */ jsxs(Button, {
									onClick: () => handleApproveDriver(driver.id),
									className: "bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 px-6 font-bold",
									children: [/* @__PURE__ */ jsx(CircleCheckBig, { className: "w-5 h-5 mr-2" }), " Aprovar"]
								})]
							})]
						})
					})
				}, driver.id))
			})]
		})
	});
}
var Search = createLucideIcon("Search", [["circle", {
	cx: "11",
	cy: "11",
	r: "8",
	key: "4ej97u"
}], ["path", {
	d: "m21 21-4.3-4.3",
	key: "1qie3q"
}]]);
//#endregion
//#region src/components/ui/Input.tsx
var Input = React$1.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ jsx("input", {
		type,
		className: cn("flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
//#endregion
//#region src/components/ui/Badge.tsx
function Badge({ className, variant = "default", ...props }) {
	let variantStyles = "bg-slate-900 text-slate-50 hover:bg-slate-900/80";
	if (variant === "secondary") variantStyles = "bg-slate-100 text-slate-900 hover:bg-slate-100/80";
	if (variant === "destructive") variantStyles = "bg-brand-pink text-white hover:bg-brand-pink/80";
	if (variant === "outline") variantStyles = "text-slate-950 border border-slate-200";
	if (variant === "success") variantStyles = "bg-emerald-500 text-white hover:bg-emerald-500/80";
	if (variant === "warning") variantStyles = "bg-brand-amber text-slate-900 hover:bg-brand-amber/80";
	return /* @__PURE__ */ jsx("div", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2", variantStyles, className),
		...props
	});
}
//#endregion
//#region src/app/admin/entregadors/page.tsx
function AdminDrivers() {
	const [drivers, setDrivers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	useEffect(() => {
		async function fetchDrivers() {
			try {
				setDrivers(await apiFetch("/api/v1/admin/drivers"));
			} catch (error) {
				console.error("Erro ao carregar entregadores:", error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchDrivers();
	}, []);
	const filteredDrivers = drivers.filter((d) => d.edges?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.edges?.user?.email.toLowerCase().includes(searchTerm.toLowerCase()));
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Frota de Entregadores",
		role: "admin",
		children: /* @__PURE__ */ jsxs("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-black text-slate-800 uppercase tracking-tighter",
						children: "Gestão de Entregadores"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 text-sm",
						children: "Monitore e gerencie os heróis da rodada."
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative w-full md:w-96",
					children: [/* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }), /* @__PURE__ */ jsx(Input, {
						placeholder: "Buscar por nome ou e-mail...",
						value: searchTerm,
						onChange: (e) => setSearchTerm(e.target.value),
						className: "pl-12 h-12 rounded-2xl border-slate-200 focus:border-ze-yellow"
					})]
				})]
			}), isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse",
				children: [
					1,
					2,
					3,
					4
				].map((i) => /* @__PURE__ */ jsx("div", { className: "h-32 bg-slate-100 rounded-3xl" }, i))
			}) : filteredDrivers.length === 0 ? /* @__PURE__ */ jsx(Card, {
				className: "border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50",
				children: /* @__PURE__ */ jsx(CardContent, {
					className: "p-12 text-center",
					children: /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 font-bold uppercase tracking-widest text-xs",
						children: "Nenhum entregador encontrado."
					})
				})
			}) : /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: filteredDrivers.map((driver) => /* @__PURE__ */ jsx(Card, {
					className: "border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-3xl group",
					children: /* @__PURE__ */ jsxs(CardContent, {
						className: "p-6",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between mb-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ jsx("div", {
									className: "w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center text-brand-teal",
									children: /* @__PURE__ */ jsx(Truck, { className: "w-6 h-6" })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
									className: "text-lg font-black text-slate-800 uppercase tracking-tight truncate max-w-[150px]",
									children: driver.edges?.user?.name || "Entregador"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-xs font-bold text-slate-400 truncate max-w-[150px]",
									children: driver.edges?.user?.email
								})] })]
							}), /* @__PURE__ */ jsx(Badge, {
								className: `${driver.status === "online" ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400"} font-black uppercase text-[9px] tracking-widest px-2.5 py-0.5 rounded-full`,
								children: driver.status === "online" ? "Disponível" : "Offline"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-2 gap-4 mt-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] font-black uppercase tracking-widest text-slate-300",
									children: "Veículo"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-sm font-bold text-slate-600 uppercase italic",
									children: driver.vehicle_type || "N/A"
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-end",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] font-black uppercase tracking-widest text-slate-300",
									children: "Parceiro desde"
								}), /* @__PURE__ */ jsx("span", {
									className: "flex items-center gap-1.5 text-sm font-bold text-slate-500",
									children: new Date(driver.created_at).toLocaleDateString("pt-BR")
								})]
							})]
						})]
					})
				}, driver.id))
			})]
		})
	});
}
var DollarSign = createLucideIcon("DollarSign", [["line", {
	x1: "12",
	x2: "12",
	y1: "2",
	y2: "22",
	key: "7eqyqh"
}], ["path", {
	d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
	key: "1b0p4s"
}]]);
var ArrowUpRight = createLucideIcon("ArrowUpRight", [["path", {
	d: "M7 7h10v10",
	key: "1tivn9"
}], ["path", {
	d: "M7 17 17 7",
	key: "1vkiza"
}]]);
var TrendingUp = createLucideIcon("TrendingUp", [["polyline", {
	points: "22 7 13.5 15.5 8.5 10.5 2 17",
	key: "126l90"
}], ["polyline", {
	points: "16 7 22 7 22 13",
	key: "kwv8wd"
}]]);
//#endregion
//#region src/app/admin/page.tsx
function AdminDashboard() {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		async function loadStats() {
			try {
				setData(await apiFetch("/api/v1/admin/dashboard"));
			} catch (error) {
				console.error("Erro ao carregar dashboard:", error);
			} finally {
				setIsLoading(false);
			}
		}
		loadStats();
	}, []);
	const stats = [
		{
			label: "Total de Vendas",
			value: `R$ ${(data?.total_sales || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
			icon: /* @__PURE__ */ jsx(DollarSign, { className: "w-6 h-6 text-emerald-500" }),
			trend: "+0%",
			color: "emerald"
		},
		{
			label: "Novos Usuários",
			value: data?.new_users.toString() || "0",
			icon: /* @__PURE__ */ jsx(Users, { className: "w-6 h-6 text-brand-sky" }),
			trend: "+0%",
			color: "sky"
		},
		{
			label: "Lojistas Ativos",
			value: data?.active_sellers.toString() || "0",
			icon: /* @__PURE__ */ jsx(Store, { className: "w-6 h-6 text-brand-amber" }),
			trend: "+0%",
			color: "amber"
		},
		{
			label: "Entregadores",
			value: data?.total_drivers.toString() || "0",
			icon: /* @__PURE__ */ jsx(Truck, { className: "w-6 h-6 text-brand-teal" }),
			trend: "+0%",
			color: "teal"
		}
	];
	const sellersCount = data?.pending_sellers_count || 0;
	if (isLoading) return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Dashboard Geral",
		role: "admin",
		children: /* @__PURE__ */ jsx("div", {
			className: "flex items-center justify-center h-64",
			children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-ze-yellow" })
		})
	});
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Dashboard Geral",
		role: "admin",
		children: /* @__PURE__ */ jsxs("div", {
			className: "space-y-8",
			children: [/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
				children: stats.map((stat, i) => /* @__PURE__ */ jsxs(Card, {
					className: "border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group",
					children: [/* @__PURE__ */ jsx("div", { className: `h-1 w-full bg-brand-${stat.color || "teal"}` }), /* @__PURE__ */ jsxs(CardContent, {
						className: "p-6",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between mb-4",
								children: [/* @__PURE__ */ jsx("div", {
									className: `p-3 rounded-2xl bg-opacity-10 bg-brand-${stat.color || "teal"}`,
									children: stat.icon
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg",
									children: [/* @__PURE__ */ jsx(TrendingUp, { className: "w-3 h-3" }), stat.trend]
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "text-2xl font-black text-slate-800 mb-1",
								children: stat.value
							}),
							/* @__PURE__ */ jsx("div", {
								className: "text-sm font-medium text-slate-400",
								children: stat.label
							})
						]
					})]
				}, i))
			}), /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
				children: [/* @__PURE__ */ jsx(Card, {
					className: "lg:col-span-2 border-slate-100 shadow-sm",
					children: /* @__PURE__ */ jsxs(CardContent, {
						className: "p-6",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between mb-6",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-slate-800",
								children: "Crescimento da Plataforma"
							}), /* @__PURE__ */ jsxs("button", {
								className: "text-sm text-brand-teal font-medium hover:underline flex items-center gap-1",
								children: ["Ver Relatório ", /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-4 h-4" })]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "h-[300px] w-full bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm font-medium",
							children: "Gráfico de Vendas e Usuários"
						})]
					})
				}), /* @__PURE__ */ jsx(Card, {
					className: "border-slate-100 shadow-sm",
					children: /* @__PURE__ */ jsxs(CardContent, {
						className: "p-6",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-slate-800 mb-6",
							children: "Alertas do Sistema"
						}), /* @__PURE__ */ jsx("div", {
							className: "space-y-4",
							children: [
								{
									text: `${sellersCount} novos lojistas aguardando aprovação`,
									type: "warning",
									link: "/admin/credentialing"
								},
								{
									text: "Servidor Keycloak operando em 85% de carga",
									type: "info"
								},
								{
									text: "Erro detectado no serviço de entregas",
									type: "error"
								}
							].map((alert, i) => /* @__PURE__ */ jsx(Link, {
								href: alert.link || "#",
								className: "block group/alert",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover/alert:border-brand-teal transition-all",
									children: [/* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${alert.type === "warning" ? "bg-amber-400" : alert.type === "error" ? "bg-red-400" : "bg-brand-sky"}` }), /* @__PURE__ */ jsx("span", {
										className: "text-sm font-medium text-slate-600 group-hover/alert:text-brand-teal transition-colors",
										children: alert.text
									})]
								})
							}, i))
						})]
					})
				})]
			})]
		})
	});
}
//#endregion
//#region src/components/profile/ProfileForm.tsx
function ProfileForm({ role, endpoint }) {
	const [profile, setProfile] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState(null);
	const apiEndpoint = endpoint || `/api/v1/${role === "customer" ? "user" : role}/profile`;
	useEffect(() => {
		async function loadProfile() {
			try {
				setProfile(await apiFetch(apiEndpoint));
			} catch (error) {
				console.error("Erro ao carregar perfil:", error);
				setMessage({
					type: "error",
					text: "Não foi possível carregar os dados do perfil."
				});
			} finally {
				setIsLoading(false);
			}
		}
		loadProfile();
	}, [apiEndpoint]);
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!profile) return;
		setIsSaving(true);
		setMessage(null);
		try {
			await apiFetch(apiEndpoint, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(profile)
			});
			setMessage({
				type: "success",
				text: "Perfil atualizado com sucesso!"
			});
		} catch (error) {
			console.error("Erro ao salvar perfil:", error);
			setMessage({
				type: "error",
				text: "Ocorreu um erro ao salvar as alterações."
			});
		} finally {
			setIsSaving(false);
		}
	};
	const handleChange = (e) => {
		const { name, value } = e.target;
		setProfile((prev) => prev ? {
			...prev,
			[name]: value
		} : null);
	};
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "flex items-center justify-center p-12",
		children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-ze-yellow" })
	});
	if (!profile && !isLoading) return /* @__PURE__ */ jsx("div", {
		className: "p-8 text-center bg-white rounded-3xl border-2 border-ze-black/5",
		children: /* @__PURE__ */ jsx("p", {
			className: "font-bold text-ze-black/60 uppercase text-sm tracking-widest",
			children: "Nenhum dado encontrado"
		})
	});
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-6 md:grid-cols-2",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx("label", {
							className: "text-xs font-black uppercase tracking-widest text-ze-black/40 px-1",
							children: "Nome Completo"
						}), /* @__PURE__ */ jsx(Input, {
							name: "name",
							value: profile?.name || "",
							onChange: handleChange,
							placeholder: "Seu nome",
							className: "h-14 rounded-2xl border-2 border-ze-black/5 focus:border-ze-yellow transition-all font-bold px-4",
							required: true
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx("label", {
							className: "text-xs font-black uppercase tracking-widest text-ze-black/40 px-1",
							children: "E-mail"
						}), /* @__PURE__ */ jsx(Input, {
							name: "email",
							type: "email",
							value: profile?.email || "",
							onChange: handleChange,
							placeholder: "seu@email.com",
							className: "h-14 rounded-2xl border-2 border-ze-black/5 focus:border-ze-yellow transition-all font-bold px-4 bg-ze-gray/30",
							disabled: true
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx("label", {
							className: "text-xs font-black uppercase tracking-widest text-ze-black/40 px-1",
							children: "Telefone"
						}), /* @__PURE__ */ jsx(Input, {
							name: "phone",
							value: profile?.phone || "",
							onChange: handleChange,
							placeholder: "(00) 00000-0000",
							className: "h-14 rounded-2xl border-2 border-ze-black/5 focus:border-ze-yellow transition-all font-bold px-4"
						})]
					}),
					role === "vendedor" && /* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx("label", {
							className: "text-xs font-black uppercase tracking-widest text-ze-black/40 px-1",
							children: "Nome do Depósito"
						}), /* @__PURE__ */ jsx(Input, {
							name: "seller_name",
							value: profile?.seller_name || "",
							onChange: handleChange,
							placeholder: "Nome da Loja",
							className: "h-14 rounded-2xl border-2 border-ze-black/5 focus:border-ze-yellow transition-all font-bold px-4"
						})]
					}),
					role === "entregador" && /* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx("label", {
							className: "text-xs font-black uppercase tracking-widest text-ze-black/40 px-1",
							children: "Veículo"
						}), /* @__PURE__ */ jsx(Input, {
							name: "vehicle",
							value: profile?.vehicle || "",
							onChange: handleChange,
							placeholder: "Ex: Moto, Bicicleta",
							className: "h-14 rounded-2xl border-2 border-ze-black/5 focus:border-ze-yellow transition-all font-bold px-4"
						})]
					})
				]
			}),
			message && /* @__PURE__ */ jsx("div", {
				className: `p-4 rounded-2xl font-bold text-sm ${message.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`,
				children: message.text
			}),
			/* @__PURE__ */ jsx("div", {
				className: "pt-4",
				children: /* @__PURE__ */ jsx(Button, {
					type: "submit",
					disabled: isSaving,
					className: "w-full md:w-auto px-12 h-14 rounded-2xl font-black uppercase tracking-widest bg-ze-yellow text-ze-black hover:bg-ze-yellow/90 shadow-xl shadow-ze-yellow/20 transition-all disabled:opacity-50",
					children: isSaving ? "Salvando..." : "Salvar Alterações"
				})
			})
		]
	});
}
//#endregion
//#region src/app/admin/profile/page.tsx
function AdminProfilePage() {
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Meu Perfil",
		role: "admin",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-4xl mx-auto",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-8",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-xs font-black uppercase tracking-[0.25em] text-ze-red",
						children: "Configurações de Conta"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-2 text-4xl font-black uppercase tracking-tighter text-ze-black italic",
						children: "Editar Perfil"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-3 text-sm font-bold text-ze-black/60 max-w-xl",
						children: "Mantenha suas informações administrativas atualizadas para garantir a segurança e eficiência da plataforma."
					})
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "bg-white rounded-[2.5rem] border-2 border-ze-black/5 p-6 md:p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.02)]",
				children: /* @__PURE__ */ jsx(ProfileForm, { role: "admin" })
			})]
		})
	});
}
var Shield = createLucideIcon("Shield", [["path", {
	d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
	key: "oel41y"
}]]);
var Database = createLucideIcon("Database", [
	["ellipse", {
		cx: "12",
		cy: "5",
		rx: "9",
		ry: "3",
		key: "msslwz"
	}],
	["path", {
		d: "M3 5V19A9 3 0 0 0 21 19V5",
		key: "1wlel7"
	}],
	["path", {
		d: "M3 12A9 3 0 0 0 21 12",
		key: "mv7ke4"
	}]
]);
var Globe = createLucideIcon("Globe", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
		key: "13o1zl"
	}],
	["path", {
		d: "M2 12h20",
		key: "9i4pu4"
	}]
]);
//#endregion
//#region src/app/admin/settings/page.tsx
function AdminSettings() {
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Configurações do Sistema",
		role: "admin",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-4xl space-y-8",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-black text-slate-800 uppercase tracking-tighter",
						children: "Painel de Controle"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 text-sm",
						children: "Ajuste os parâmetros fundamentais da plataforma EntregaMais."
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-6",
					children: [
						{
							title: "Segurança",
							icon: /* @__PURE__ */ jsx(Shield, { className: "w-5 h-5" }),
							description: "Políticas de senha, 2FA e logs de acesso."
						},
						{
							title: "Notificações",
							icon: /* @__PURE__ */ jsx(Bell, { className: "w-5 h-5" }),
							description: "Configuração de alertas do sistema e e-mails."
						},
						{
							title: "Dados e Backup",
							icon: /* @__PURE__ */ jsx(Database, { className: "w-5 h-5" }),
							description: "Manutenção do banco de dados e exportação."
						},
						{
							title: "Regionalização",
							icon: /* @__PURE__ */ jsx(Globe, { className: "w-5 h-5" }),
							description: "Cidades ativas e moedas suportadas."
						}
					].map((section, i) => /* @__PURE__ */ jsx(Card, {
						className: "border-slate-100 shadow-sm hover:shadow-md transition-all rounded-3xl group cursor-pointer bg-white",
						children: /* @__PURE__ */ jsx(CardContent, {
							className: "p-6",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-start gap-4",
								children: [/* @__PURE__ */ jsx("div", {
									className: "w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-ze-yellow group-hover:text-ze-black transition-all",
									children: section.icon
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
									className: "text-lg font-black text-slate-800 uppercase tracking-tight",
									children: section.title
								}), /* @__PURE__ */ jsx("p", {
									className: "text-xs font-bold text-slate-400 mt-1 leading-relaxed",
									children: section.description
								})] })]
							})
						})
					}, i))
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden",
					children: [/* @__PURE__ */ jsx("div", { className: "h-1 w-full bg-ze-yellow" }), /* @__PURE__ */ jsxs(CardContent, {
						className: "p-8",
						children: [
							/* @__PURE__ */ jsxs("h3", {
								className: "text-xl font-black text-slate-800 uppercase tracking-tighter mb-6 flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(Settings, { className: "w-6 h-6" }), " Parâmetros Gerais"]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-6",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-sm font-black text-slate-700 uppercase tracking-tight",
										children: "Manutenção Programada"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs font-bold text-slate-400",
										children: "Ativa o modo de manutenção para todos os usuários."
									})] }), /* @__PURE__ */ jsx("div", {
										className: "w-12 h-6 bg-slate-200 rounded-full relative",
										children: /* @__PURE__ */ jsx("div", { className: "absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" })
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-sm font-black text-slate-700 uppercase tracking-tight",
										children: "Taxa de Serviço Padrão"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs font-bold text-slate-400",
										children: "Porcentagem cobrada sobre cada pedido concluído."
									})] }), /* @__PURE__ */ jsx("div", {
										className: "text-lg font-black text-brand-teal",
										children: "12%"
									})]
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-8 flex justify-end",
								children: /* @__PURE__ */ jsx(Button, {
									className: "bg-ze-black text-ze-yellow hover:bg-ze-black/90 rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-xs",
									children: "Salvar Alterações"
								})
							})
						]
					})]
				})
			]
		})
	});
}
var Mail = createLucideIcon("Mail", [["rect", {
	width: "20",
	height: "16",
	x: "2",
	y: "4",
	rx: "2",
	key: "18n3k1"
}], ["path", {
	d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
	key: "1ocrg3"
}]]);
var Phone = createLucideIcon("Phone", [["path", {
	d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
	key: "foiqr5"
}]]);
//#endregion
//#region src/app/admin/users/page.tsx
function AdminUsers() {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	useEffect(() => {
		async function fetchUsers() {
			try {
				setUsers(await apiFetch("/api/v1/admin/users"));
			} catch (error) {
				console.error("Erro ao carregar usuários:", error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchUsers();
	}, []);
	const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Gestão de Usuários",
		role: "admin",
		children: /* @__PURE__ */ jsxs("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-black text-slate-800 uppercase tracking-tighter",
						children: "Base de Usuários"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 text-sm",
						children: "Visualize e gerencie todos os clientes da plataforma."
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative w-full md:w-96",
					children: [/* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }), /* @__PURE__ */ jsx(Input, {
						placeholder: "Buscar por nome ou e-mail...",
						value: searchTerm,
						onChange: (e) => setSearchTerm(e.target.value),
						className: "pl-12 h-12 rounded-2xl border-slate-200 focus:border-ze-yellow"
					})]
				})]
			}), isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 gap-4 animate-pulse",
				children: [
					1,
					2,
					3,
					4,
					5
				].map((i) => /* @__PURE__ */ jsx("div", { className: "h-24 bg-slate-100 rounded-3xl" }, i))
			}) : filteredUsers.length === 0 ? /* @__PURE__ */ jsx(Card, {
				className: "border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50",
				children: /* @__PURE__ */ jsx(CardContent, {
					className: "p-12 text-center",
					children: /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 font-bold uppercase tracking-widest text-xs",
						children: "Nenhum usuário encontrado."
					})
				})
			}) : /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 gap-4",
				children: filteredUsers.map((user) => /* @__PURE__ */ jsx(Card, {
					className: "border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-3xl group",
					children: /* @__PURE__ */ jsx(CardContent, {
						className: "p-6",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ jsx("div", {
									className: "w-12 h-12 bg-brand-sky/10 rounded-2xl flex items-center justify-center text-brand-sky",
									children: /* @__PURE__ */ jsx(User, { className: "w-6 h-6" })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
									className: "text-lg font-black text-slate-800 uppercase tracking-tight",
									children: user.name
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap gap-4 mt-1",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1.5 text-xs font-bold text-slate-400",
										children: [
											/* @__PURE__ */ jsx(Mail, { className: "w-3.5 h-3.5" }),
											" ",
											user.email
										]
									}), user.phone && /* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1.5 text-xs font-bold text-slate-400",
										children: [
											/* @__PURE__ */ jsx(Phone, { className: "w-3.5 h-3.5" }),
											" ",
											user.phone
										]
									})]
								})] })]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-6",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col items-end",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-[10px] font-black uppercase tracking-widest text-slate-300",
										children: "Cadastro"
									}), /* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1.5 text-xs font-bold text-slate-500",
										children: [
											/* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" }),
											" ",
											new Date(user.created_at).toLocaleDateString("pt-BR")
										]
									})]
								}), /* @__PURE__ */ jsx("div", {
									className: `px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === "active" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`,
									children: user.status === "active" ? "Ativo" : "Inativo"
								})]
							})]
						})
					})
				}, user.id))
			})]
		})
	});
}
var MapPin = createLucideIcon("MapPin", [["path", {
	d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
	key: "1r0f0z"
}], ["circle", {
	cx: "12",
	cy: "10",
	r: "3",
	key: "ilqhr7"
}]]);
var Star = createLucideIcon("Star", [["path", {
	d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
	key: "r04s7s"
}]]);
//#endregion
//#region src/app/admin/vendedors/page.tsx
function AdminSellers() {
	const [sellers, setSellers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	useEffect(() => {
		async function fetchSellers() {
			try {
				setSellers(await apiFetch("/api/v1/admin/sellers"));
			} catch (error) {
				console.error("Erro ao carregar lojistas:", error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchSellers();
	}, []);
	const filteredSellers = sellers.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Depósitos Parceiros",
		role: "admin",
		children: /* @__PURE__ */ jsxs("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-black text-slate-800 uppercase tracking-tighter",
						children: "Gestão de Depósitos"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 text-sm",
						children: "Monitore e gerencie os pontos de venda da plataforma."
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative w-full md:w-96",
					children: [/* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }), /* @__PURE__ */ jsx(Input, {
						placeholder: "Buscar por nome do depósito...",
						value: searchTerm,
						onChange: (e) => setSearchTerm(e.target.value),
						className: "pl-12 h-12 rounded-2xl border-slate-200 focus:border-ze-yellow"
					})]
				})]
			}), isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse",
				children: [
					1,
					2,
					3,
					4,
					5,
					6
				].map((i) => /* @__PURE__ */ jsx("div", { className: "h-48 bg-slate-100 rounded-3xl" }, i))
			}) : filteredSellers.length === 0 ? /* @__PURE__ */ jsx(Card, {
				className: "border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50",
				children: /* @__PURE__ */ jsx(CardContent, {
					className: "p-12 text-center",
					children: /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 font-bold uppercase tracking-widest text-xs",
						children: "Nenhum depósito encontrado."
					})
				})
			}) : /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
				children: filteredSellers.map((seller) => /* @__PURE__ */ jsx(Card, {
					className: "border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-[2rem] bg-white group",
					children: /* @__PURE__ */ jsxs(CardContent, {
						className: "p-6",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-start justify-between mb-4",
								children: [/* @__PURE__ */ jsx("div", {
									className: "w-12 h-12 bg-brand-amber/10 rounded-2xl flex items-center justify-center text-brand-amber",
									children: /* @__PURE__ */ jsx(Store, { className: "w-6 h-6" })
								}), /* @__PURE__ */ jsx(Badge, {
									className: `${seller.status === "active" ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-amber-50 text-amber-500 border-amber-100"} font-black uppercase text-[9px] tracking-widest px-2.5 py-0.5 rounded-full border`,
									children: seller.status === "active" ? "Ativo" : "Pendente"
								})]
							}),
							/* @__PURE__ */ jsx("h3", {
								className: "text-lg font-black text-slate-800 uppercase tracking-tight group-hover:text-brand-teal transition-colors truncate",
								children: seller.name
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1",
								children: [
									/* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5" }),
									" ",
									seller.city,
									", ",
									seller.state
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-6 pt-4 border-t border-slate-50 flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center text-amber-400 bg-amber-50 px-2 py-0.5 rounded-lg text-xs font-black",
									children: [
										/* @__PURE__ */ jsx(Star, { className: "w-3.5 h-3.5 mr-1 fill-current" }),
										" ",
										(seller.rating || 5).toFixed(1)
									]
								}), /* @__PURE__ */ jsx("button", {
									className: "text-[10px] font-black uppercase tracking-widest text-brand-teal hover:underline",
									children: "Ver Detalhes"
								})]
							})
						]
					})
				}, seller.id))
			})]
		})
	});
}
var ChevronRight = createLucideIcon("ChevronRight", [["path", {
	d: "m9 18 6-6-6-6",
	key: "mthhwq"
}]]);
var CircleHelp = createLucideIcon("CircleHelp", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",
		key: "1u773s"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]);
var MessageCircle = createLucideIcon("MessageCircle", [["path", {
	d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z",
	key: "vv11sd"
}]]);
var ShieldCheck = createLucideIcon("ShieldCheck", [["path", {
	d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
	key: "oel41y"
}], ["path", {
	d: "m9 12 2 2 4-4",
	key: "dzmm74"
}]]);
//#endregion
//#region src/app/ajuda/[slug]/page.tsx
function HelpPage() {
	const { slug } = useParams();
	const page = {
		"fale-conosco": {
			title: "Fale Conosco",
			subtitle: "Estamos aqui para você",
			icon: MessageCircle,
			questions: [{
				q: "Quais são os canais de atendimento?",
				a: "Você pode nos contatar via chat no app, e-mail suporte@entregamais.com ou telefone 0800-ZE-MAIS."
			}, {
				q: "Qual o horário de funcionamento do suporte?",
				a: "Nosso suporte funciona todos os dias, das 08h às 02h da manhã."
			}]
		},
		"duvidas-frequentes": {
			title: "Dúvidas Frequentes",
			subtitle: "FAQ",
			icon: CircleHelp,
			questions: [
				{
					q: "Como cancelar um pedido?",
					a: "Você pode cancelar diretamente pelo app enquanto o status for 'Pendente'. Após isso, entre em contato via chat."
				},
				{
					q: "Quais as formas de pagamento?",
					a: "Aceitamos cartões de crédito, débito, pix e vale-refeição diretamente no aplicativo."
				},
				{
					q: "Como alterar meu endereço?",
					a: "Acesse seu perfil ou mude o endereço diretamente no seletor de localização na home."
				}
			]
		},
		"politica-de-entrega": {
			title: "Política de Entrega",
			subtitle: "Como entregamos",
			icon: Truck,
			questions: [{
				q: "Qual o tempo médio de entrega?",
				a: "Nossa meta é entregar em até 25 minutos para áreas urbanas centrais."
			}, {
				q: "Cobramos taxa de entrega?",
				a: "Muitos dos nossos parceiros oferecem frete grátis para pedidos acima de um valor mínimo."
			}]
		},
		"termos-de-uso": {
			title: "Termos de Uso",
			subtitle: "Regras da plataforma",
			icon: FileText,
			questions: [{
				q: "Uso de dados",
				a: "Seus dados são protegidos e utilizados apenas para processar seus pedidos e melhorar sua experiência."
			}, {
				q: "Idade Mínima",
				a: "A venda de bebidas alcoólicas é proibida para menores de 18 anos. Verificamos o documento na entrega."
			}]
		},
		"privacidade": {
			title: "Privacidade",
			subtitle: "Seus dados seguros",
			icon: ShieldCheck,
			questions: [{
				q: "LGPD",
				a: "Estamos em total conformidade com a Lei Geral de Proteção de Dados."
			}, {
				q: "Compartilhamento",
				a: "Não vendemos seus dados para terceiros."
			}]
		}
	}[slug] || {
		title: "Central de Ajuda",
		subtitle: "Atendimento EntregaMais",
		icon: CircleHelp,
		questions: [{
			q: "Em breve",
			a: "Estamos preparando mais conteúdos informativos para você."
		}]
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50",
		children: [/* @__PURE__ */ jsx("div", {
			className: "bg-ze-yellow py-16 md:py-24 relative overflow-hidden",
			children: /* @__PURE__ */ jsxs("div", {
				className: "container mx-auto px-6 relative z-10",
				children: [/* @__PURE__ */ jsxs(Link, {
					href: "/",
					className: "inline-flex items-center text-ze-black hover:opacity-70 mb-8 transition-all text-sm font-black uppercase tracking-widest",
					children: [
						"Home ",
						/* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 mx-1" }),
						" Ajuda"
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col md:flex-row items-start md:items-center gap-6",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-16 h-16 bg-ze-black rounded-2xl flex items-center justify-center shadow-2xl",
						children: /* @__PURE__ */ jsx(page.icon, { className: "w-8 h-8 text-ze-yellow" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Badge, {
						className: "bg-ze-black text-white font-black uppercase tracking-[0.2em] mb-3",
						children: page.subtitle
					}), /* @__PURE__ */ jsx("h1", {
						className: "text-4xl md:text-6xl font-black text-ze-black italic uppercase tracking-tighter",
						children: page.title
					})] })]
				})]
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "container mx-auto px-6 py-20",
			children: /* @__PURE__ */ jsxs("div", {
				className: "max-w-3xl mx-auto space-y-6",
				children: [page.questions.map((item, i) => /* @__PURE__ */ jsxs("div", {
					className: "bg-white p-8 rounded-3xl border-2 border-ze-black/5 shadow-sm hover:border-ze-yellow transition-all",
					children: [/* @__PURE__ */ jsxs("h3", {
						className: "text-lg font-black text-ze-black uppercase tracking-tight mb-4 flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("span", {
							className: "w-6 h-6 rounded-full bg-ze-yellow flex items-center justify-center text-[10px] shrink-0",
							children: "?"
						}), item.q]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-600 font-bold leading-relaxed italic border-l-4 border-ze-yellow/20 pl-4 ml-3",
						children: item.a
					})]
				}, i)), /* @__PURE__ */ jsxs("div", {
					className: "mt-20 p-10 bg-ze-black rounded-[3rem] text-center space-y-6",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "text-2xl font-black text-white uppercase italic tracking-tighter",
							children: "Não resolveu sua dúvida?"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-white/60 font-bold",
							children: "Nosso time está pronto para te ajudar agora."
						}),
						/* @__PURE__ */ jsx(Button, {
							className: "bg-ze-yellow text-ze-black hover:bg-white font-black uppercase tracking-widest px-10 h-14 rounded-2xl shadow-xl transform hover:scale-105 transition-all",
							children: "Abrir Chat de Suporte"
						})
					]
				})]
			})
		})]
	});
}
//#endregion
//#region src/components/layout/AuthLayout.tsx
function AuthLayout({ children, title, subtitle, role }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen grid lg:grid-cols-2",
		children: [/* @__PURE__ */ jsxs("div", {
			className: `hidden lg:flex flex-col justify-between p-12 ${{
				admin: "bg-ze-black",
				vendedor: "bg-ze-yellow",
				entregador: "bg-ze-yellow",
				customer: "bg-ze-yellow"
			}[role]} ${{
				admin: "text-ze-yellow",
				vendedor: "text-ze-black",
				entregador: "text-ze-black",
				customer: "text-ze-black"
			}[role]} relative overflow-hidden`,
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "relative z-10",
					children: [/* @__PURE__ */ jsxs("h1", {
						className: "text-6xl font-black leading-none mb-6 uppercase italic tracking-tighter",
						children: [
							"Entregando ",
							/* @__PURE__ */ jsx("br", {}),
							"gelada no preço ",
							/* @__PURE__ */ jsx("br", {}),
							"de supermercado."
						]
					}), /* @__PURE__ */ jsx("p", {
						className: `text-xl ${role === "admin" ? "text-ze-yellow/70" : "text-ze-black/70"} max-w-md font-bold`,
						children: role === "vendedor" ? "Leve seu depósito para o digital e venda mais bebidas." : role === "entregador" ? "Seja o herói da rodada: entregue bebidas geladas em minutos." : "Sua bebida favorita, onde você estiver, sempre gelada."
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: `absolute -bottom-10 -right-10 opacity-10 ${role === "admin" ? "text-ze-yellow" : "text-ze-black"}`,
					children: /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 24 24",
						fill: "currentColor",
						className: "w-[500px] h-[500px]",
						children: /* @__PURE__ */ jsx("path", { d: "M17 22H7a2 2 0 0 1-2-2V7l2-3V2h6v2l2 3v13a2 2 0 0 1-2 2Z" })
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative z-10 flex items-center gap-6",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex -space-x-4",
						children: [
							1,
							2,
							3,
							4
						].map((i) => /* @__PURE__ */ jsx("div", {
							className: `w-12 h-12 rounded-full border-4 ${role === "admin" ? "border-ze-yellow/20" : "border-ze-black/20"} inline-block bg-ze-gray overflow-hidden`,
							children: /* @__PURE__ */ jsx("div", {
								className: "w-full h-full bg-ze-gray flex items-center justify-center text-lg",
								children: i % 2 === 0 ? "🍺" : "🥤"
							})
						}, i))
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-sm font-black uppercase tracking-widest",
						children: [
							"+10k ",
							role === "vendedor" ? "Depósitos" : role === "entregador" ? "Entregadores" : "Parceiros",
							" ativos"
						]
					})]
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "flex items-center justify-center p-8 bg-ze-white",
			children: /* @__PURE__ */ jsxs("div", {
				className: "w-full max-w-md space-y-8",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-4xl font-black text-ze-black tracking-tighter uppercase italic",
							children: title
						}), /* @__PURE__ */ jsx("p", {
							className: "text-ze-black/60 font-bold",
							children: subtitle
						})]
					}),
					/* @__PURE__ */ jsx(Card, {
						className: "border-4 border-ze-black shadow-[12px_12px_0px_0px_rgba(34,34,34,1)] rounded-3xl overflow-hidden",
						children: /* @__PURE__ */ jsx(CardContent, {
							className: "p-10 bg-white",
							children
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "text-center",
						children: /* @__PURE__ */ jsxs("p", {
							className: "text-sm text-ze-black/40 font-bold uppercase tracking-widest",
							children: [
								"Ao continuar, você concorda com nossos ",
								/* @__PURE__ */ jsx("br", {}),
								/* @__PURE__ */ jsx(Link, {
									href: "/terms",
									className: "text-ze-black underline decoration-ze-yellow decoration-4 underline-offset-4 hover:text-ze-red transition-colors",
									children: "Termos de Serviço"
								}),
								" e ",
								/* @__PURE__ */ jsx(Link, {
									href: "/privacy",
									className: "text-ze-black underline decoration-ze-yellow decoration-4 underline-offset-4 hover:text-ze-red transition-colors",
									children: "Política de Privacidade"
								}),
								"."
							]
						})
					})
				]
			})
		})]
	});
}
//#endregion
//#region src/components/ui/Label.tsx
var Label = React$1.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("label", {
	ref,
	className: cn("text-sm font-bold leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block", className),
	...props
}));
Label.displayName = "Label";
//#endregion
//#region src/app/auth/login/admin/page.tsx
function AdminLogin() {
	useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			if ((await signIn("credentials", {
				email,
				password,
				role: "admin",
				redirect: false
			}))?.ok) setTimeout(() => {
				window.location.href = "/admin/credentialing";
			}, 100);
			else setError("Acesso negado. Suas chaves de segurança não coincidem com os registros mestre.");
		} catch (err) {
			console.error("Fatal login error:", err);
			setError(`Instabilidade no cofre digital: ${err.message || "Erro desconhecido"}`);
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsx(AuthLayout, {
		role: "admin",
		title: "Acesso Restrito",
		subtitle: "Portal de administração do EntregaMais.",
		children: /* @__PURE__ */ jsxs("form", {
			className: "space-y-6",
			onSubmit: handleLogin,
			children: [
				error && /* @__PURE__ */ jsx("div", {
					className: "bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 italic",
					children: error
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "email",
						children: "E-mail de Administrador"
					}), /* @__PURE__ */ jsx(Input, {
						id: "email",
						name: "email",
						type: "email",
						placeholder: "admin@entregamaisshop.com",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						required: true,
						className: "h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-slate-800 focus:ring-slate-800/10 font-mono"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "password",
						children: "Chave de Acesso"
					}), /* @__PURE__ */ jsx(Input, {
						id: "password",
						name: "password",
						type: "password",
						placeholder: "••••••••",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						required: true,
						className: "h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-slate-800 focus:ring-slate-800/10"
					})]
				}),
				/* @__PURE__ */ jsxs(Button, {
					type: "submit",
					disabled: loading,
					className: "w-full h-14 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all text-lg group",
					children: [loading ? "Validando..." : "Entrar no Sistema", /* @__PURE__ */ jsx(ShieldCheck, { className: "w-5 h-5 ml-2 group-hover:scale-110 transition-transform" })]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "text-center pt-8",
					children: /* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
						children: "Uso restrito a colaboradores autorizados"
					})
				})
			]
		})
	});
}
//#endregion
//#region src/app/auth/login/customer/page.tsx
function CustomerLogin() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			if ((await signIn("credentials", {
				email,
				password,
				role: "customer",
				redirect: false
			}))?.ok) {
				const callbackUrl = searchParams.get("callbackUrl") || "/";
				router.push(callbackUrl);
			} else if (email.includes("admin@")) setError("Contas administrativas devem acessar pelo Portal do Administrador.");
			else setError("Ops! Credenciais inválidas. Verifique seu e-mail e senha para voltar à festa.");
		} catch (err) {
			setError("Parece que o freezer travou! Tivemos um problema técnico. Tente de novo.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsx(AuthLayout, {
		role: "customer",
		title: "Entrar na Roda",
		subtitle: "Sua bebida gelada a um clique de distância.",
		children: /* @__PURE__ */ jsxs("form", {
			className: "space-y-6",
			onSubmit: handleLogin,
			children: [
				error && /* @__PURE__ */ jsx("div", {
					className: "bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100",
					children: error
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "email",
						children: "E-mail"
					}), /* @__PURE__ */ jsx(Input, {
						id: "email",
						name: "email",
						type: "email",
						placeholder: "voce@exemplo.com",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						required: true,
						className: "h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-ze-yellow focus:ring-ze-yellow/10"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "password",
							children: "Senha"
						}), /* @__PURE__ */ jsx(Link, {
							href: "/auth/forgot-password",
							title: "Esqueci minha senha",
							className: "text-xs font-bold text-ze-black/60 hover:underline",
							children: "Esqueceu?"
						})]
					}), /* @__PURE__ */ jsx(Input, {
						id: "password",
						name: "password",
						type: "password",
						placeholder: "••••••••",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						required: true,
						className: "h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-ze-yellow focus:ring-ze-yellow/10"
					})]
				}),
				/* @__PURE__ */ jsxs(Button, {
					type: "submit",
					disabled: loading,
					className: "w-full h-14 bg-ze-yellow text-ze-black font-black rounded-2xl shadow-lg shadow-ze-yellow/20 hover:bg-ze-yellow/90 transition-all text-lg group",
					children: [loading ? "Entrando..." : "Entrar Agora", /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" })]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "text-center pt-2",
					children: /* @__PURE__ */ jsxs("p", {
						className: "text-sm font-medium text-slate-500",
						children: [
							"Ainda não tem conta? ",
							/* @__PURE__ */ jsx("br", {}),
							/* @__PURE__ */ jsx(Link, {
								href: "/register/customer",
								className: "text-ze-black font-black hover:underline underline-offset-4 decoration-ze-yellow decoration-2",
								children: "Crie sua conta"
							})
						]
					})
				})
			]
		})
	});
}
//#endregion
//#region src/app/auth/login/entregador/page.tsx
function DriverLogin() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			if ((await signIn("credentials", {
				email,
				password,
				role: "entregador",
				redirect: false
			}))?.ok) router.push("/entregador/dashboard");
			else if (email.includes("admin@")) setError("Contas administrativas devem acessar pelo Portal do Administrador.");
			else setError("Dados de acesso não conferem. Verifique seu e-mail de parceiro e sua senha.");
		} catch (err) {
			setError("Sem sinal com a central de rotas. Verifique sua conexão e tente logar novamente.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsx(AuthLayout, {
		role: "entregador",
		title: "Portal do Entregador",
		subtitle: "Entre para começar suas entregas de hoje.",
		children: /* @__PURE__ */ jsxs("form", {
			className: "space-y-6",
			onSubmit: handleLogin,
			children: [
				error && /* @__PURE__ */ jsx("div", {
					className: "bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100",
					children: error
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "email",
						children: "E-mail"
					}), /* @__PURE__ */ jsx(Input, {
						id: "email",
						name: "email",
						type: "email",
						placeholder: "entregador@example.com",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						required: true,
						className: "h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-brand-coral focus:ring-brand-coral/10"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "password",
							children: "Senha de Acesso"
						}), /* @__PURE__ */ jsx(Link, {
							href: "/auth/forgot-password",
							title: "Esqueci minha senha",
							className: "text-xs font-bold text-brand-coral hover:underline",
							children: "Esqueceu?"
						})]
					}), /* @__PURE__ */ jsx(Input, {
						id: "password",
						name: "password",
						type: "password",
						placeholder: "••••••••",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						required: true,
						className: "h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-brand-coral focus:ring-brand-coral/10"
					})]
				}),
				/* @__PURE__ */ jsxs(Button, {
					type: "submit",
					disabled: loading,
					className: "w-full h-14 bg-brand-coral text-white font-black rounded-2xl shadow-lg shadow-brand-coral/20 hover:bg-brand-coral/90 transition-all text-lg group",
					children: [loading ? "Entrando..." : "Começar Agora", /* @__PURE__ */ jsx(Truck, { className: "w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "text-center pt-8 border-t border-slate-50",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-sm font-medium text-slate-500 mb-4",
						children: "Ainda não é um parceiro EntregaMais?"
					}), /* @__PURE__ */ jsx(Link, {
						href: "/auth/signup/entregador",
						children: /* @__PURE__ */ jsx(Button, {
							variant: "outline",
							className: "w-full h-12 rounded-xl border-slate-200 text-brand-coral font-bold hover:bg-brand-coral/5 border-2 group",
							children: "Cadastrar para Entregar"
						})
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/app/auth/login/vendedor/page.tsx
function SellerLogin() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			if ((await signIn("credentials", {
				email,
				password,
				role: "vendedor",
				redirect: false
			}))?.ok) router.push("/vendedor/dashboard");
			else if (email.includes("admin@")) setError("Contas administrativas devem acessar pelo Portal do Administrador.");
			else setError("Dados incorretos. Verifique e-mail e senha para gerenciar sua loja.");
		} catch (err) {
			setError("Erro ao conectar com a central de lojistas. Tente novamente em instantes.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsx(AuthLayout, {
		role: "vendedor",
		title: "Login do Lojista",
		subtitle: "Acesse seu painel para gerenciar sua loja.",
		children: /* @__PURE__ */ jsxs("form", {
			className: "space-y-6",
			onSubmit: handleLogin,
			children: [
				error && /* @__PURE__ */ jsx("div", {
					className: "bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100",
					children: error
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "email",
						children: "E-mail Corporativo"
					}), /* @__PURE__ */ jsx(Input, {
						id: "email",
						name: "email",
						type: "email",
						placeholder: "vendas@sualoja.com",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						required: true,
						className: "h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-brand-teal focus:ring-brand-teal/10"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "password",
							children: "Senha"
						}), /* @__PURE__ */ jsx(Link, {
							href: "/auth/forgot-password",
							title: "Esqueci minha senha",
							className: "text-xs font-bold text-brand-teal hover:underline",
							children: "Esqueceu?"
						})]
					}), /* @__PURE__ */ jsx(Input, {
						id: "password",
						name: "password",
						type: "password",
						placeholder: "••••••••",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						required: true,
						className: "h-12 px-4 rounded-xl border-slate-200 shadow-sm focus:border-brand-teal focus:ring-brand-teal/10"
					})]
				}),
				/* @__PURE__ */ jsxs(Button, {
					type: "submit",
					disabled: loading,
					className: "w-full h-14 bg-brand-teal text-white font-black rounded-2xl shadow-lg shadow-brand-teal/20 hover:bg-brand-teal/90 transition-all text-lg group",
					children: [loading ? "Entrando..." : "Entrar no Painel", /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative py-4",
					children: [/* @__PURE__ */ jsx("div", {
						className: "absolute inset-0 flex items-center",
						children: /* @__PURE__ */ jsx("div", { className: "w-full border-t border-slate-100" })
					}), /* @__PURE__ */ jsx("div", {
						className: "relative flex justify-center text-xs uppercase",
						children: /* @__PURE__ */ jsx("span", {
							className: "bg-white px-4 text-slate-400 font-bold tracking-widest",
							children: "Ou continue com"
						})
					})]
				}),
				/* @__PURE__ */ jsxs(Button, {
					variant: "outline",
					className: "w-full h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 gap-2",
					children: [/* @__PURE__ */ jsx("svg", {
						className: "w-5 h-5",
						viewBox: "0 0 24 24",
						"aria-hidden": "true",
						children: /* @__PURE__ */ jsx("path", {
							fill: "currentColor",
							d: "M12 11h8.5c.1.7.2 1.4.2 2.1 0 5.2-3.5 8.9-8.7 8.9C7.1 22 3 17.9 3 13s4.1-9 9-9c2.4 0 4.5.9 6.1 2.3l-2.7 2.7c-1-1-2.2-1.5-3.4-1.5-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c3 0 4.7-2.1 5.1-3.6H12v-2.3z"
						})
					}), "Google"]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "text-center pt-2",
					children: /* @__PURE__ */ jsxs("p", {
						className: "text-sm font-medium text-slate-500",
						children: [
							"Ainda não tem uma loja? ",
							/* @__PURE__ */ jsx("br", {}),
							/* @__PURE__ */ jsx(Link, {
								href: "/auth/signup/vendedor",
								className: "text-brand-teal font-black hover:underline",
								children: "Solicite sua conta"
							})
						]
					})
				})
			]
		})
	});
}
var Smartphone = createLucideIcon("Smartphone", [["rect", {
	width: "14",
	height: "20",
	x: "5",
	y: "2",
	rx: "2",
	ry: "2",
	key: "1yt0o3"
}], ["path", {
	d: "M12 18h.01",
	key: "mhygvu"
}]]);
//#endregion
//#region src/app/auth/signup/entregador/page.tsx
function DriverSignUp() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [vehicleType, setVehicleType] = useState("Moto");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					email,
					phone,
					vehicleType,
					password,
					role: "entregador"
				})
			});
			if (!response.ok) {
				setError((await response.json()).message || "Nao foi possivel concluir seu cadastro.");
				return;
			}
			router.push("/auth/login/entregador");
		} catch {
			setError("A central de rotas nao respondeu. Tente novamente em instantes.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsx(AuthLayout, {
		role: "entregador",
		title: "Ganhe com a Gente",
		subtitle: "Faça seu cadastro e comece a entregar na sua região.",
		children: /* @__PURE__ */ jsxs("form", {
			className: "space-y-4",
			onSubmit: handleSubmit,
			children: [
				error && /* @__PURE__ */ jsx("div", {
					className: "bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100",
					children: error
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "fullname",
						children: "Nome Completo"
					}), /* @__PURE__ */ jsx(Input, {
						id: "fullname",
						name: "name",
						placeholder: "Seu Nome",
						className: "h-11 rounded-xl",
						value: name,
						onChange: (e) => setName(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 gap-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "email",
							children: "E-mail"
						}), /* @__PURE__ */ jsx(Input, {
							id: "email",
							name: "email",
							type: "email",
							placeholder: "nome@exemplo.com",
							className: "h-11 rounded-xl",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							required: true
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "phone",
							children: "Celular (WhatsApp)"
						}), /* @__PURE__ */ jsx(Input, {
							id: "phone",
							name: "phone",
							placeholder: "(11) 99999-9999",
							className: "h-11 rounded-xl",
							value: phone,
							onChange: (e) => setPhone(e.target.value),
							required: true
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "vehicle",
						children: "Veículo"
					}), /* @__PURE__ */ jsxs("select", {
						id: "vehicle",
						name: "vehicleType",
						value: vehicleType,
						onChange: (e) => setVehicleType(e.target.value),
						className: "w-full h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium focus:ring-2 focus:ring-brand-coral/10 bg-white outline-none",
						children: [
							/* @__PURE__ */ jsx("option", { children: "Moto" }),
							/* @__PURE__ */ jsx("option", { children: "Carro" }),
							/* @__PURE__ */ jsx("option", { children: "Bicicleta" }),
							/* @__PURE__ */ jsx("option", { children: "Caminhão (Leve)" })
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "password",
						children: "Criar Senha"
					}), /* @__PURE__ */ jsx(Input, {
						id: "password",
						name: "password",
						type: "password",
						placeholder: "Use a senha atual se este e-mail ja tiver conta",
						className: "h-11 rounded-xl",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "py-4 bg-brand-amber/5 rounded-[1.5rem] p-4 border border-brand-amber/10 space-y-3",
					children: [
						"Flexibilidade de horários total",
						"Receba seus ganhos semanalmente",
						"Suporte exclusivo 24/7"
					].map((text, i) => /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 text-xs font-bold text-slate-600",
						children: [/* @__PURE__ */ jsx(CircleCheckBig, { className: "w-4 h-4 text-brand-amber fill-brand-amber/10" }), text]
					}, i))
				}),
				/* @__PURE__ */ jsxs(Button, {
					type: "submit",
					disabled: loading,
					className: "w-full h-14 bg-brand-coral text-white font-black rounded-2xl shadow-lg shadow-brand-coral/20 hover:bg-brand-coral/90 transition-all text-lg group",
					children: [loading ? "Liberando acesso..." : "Cadastrar para Entregar", /* @__PURE__ */ jsx(Smartphone, { className: "w-5 h-5 ml-2 group-hover:scale-110 transition-transform" })]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "text-center pt-2",
					children: /* @__PURE__ */ jsxs("p", {
						className: "text-sm font-medium text-slate-500",
						children: ["Já é um parceiro? ", /* @__PURE__ */ jsx(Link, {
							href: "/auth/login/entregador",
							className: "text-brand-coral font-black hover:underline",
							children: "Entrar Agora"
						})]
					})
				})
			]
		})
	});
}
//#endregion
//#region src/app/auth/signup/vendedor/page.tsx
function SellerSignUp() {
	const router = useRouter();
	const [storeName, setStoreName] = useState("");
	const [cnpj, setCnpj] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: storeName,
					storeName,
					cnpj,
					email,
					phone,
					password,
					role: "vendedor"
				})
			});
			if (!response.ok) {
				setError((await response.json()).message || "Nao foi possivel concluir seu credenciamento.");
				return;
			}
			router.push("/auth/login/vendedor");
		} catch {
			setError("A central de parceiros nao respondeu. Tente novamente em instantes.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsx(AuthLayout, {
		role: "vendedor",
		title: "Seja um Parceiro",
		subtitle: "Cadastre sua loja e comece a vender em minutos.",
		children: /* @__PURE__ */ jsxs("form", {
			className: "space-y-4",
			onSubmit: handleSubmit,
			children: [
				error && /* @__PURE__ */ jsx("div", {
					className: "bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100",
					children: error
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 gap-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "store-name",
							children: "Nome da Loja"
						}), /* @__PURE__ */ jsx(Input, {
							id: "store-name",
							name: "storeName",
							placeholder: "Sua Loja S.A",
							className: "h-11 rounded-xl",
							value: storeName,
							onChange: (e) => setStoreName(e.target.value),
							required: true
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "cnpj",
							children: "CNPJ"
						}), /* @__PURE__ */ jsx(Input, {
							id: "cnpj",
							name: "cnpj",
							placeholder: "00.000.000/0001-00",
							className: "h-11 rounded-xl",
							value: cnpj,
							onChange: (e) => setCnpj(e.target.value),
							required: true
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "email",
						children: "E-mail Comercial"
					}), /* @__PURE__ */ jsx(Input, {
						id: "email",
						name: "email",
						type: "email",
						placeholder: "contato@loja.com",
						className: "h-11 rounded-xl",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "phone",
						children: "WhatsApp de Vendas"
					}), /* @__PURE__ */ jsx(Input, {
						id: "phone",
						name: "phone",
						placeholder: "(11) 99999-9999",
						className: "h-11 rounded-xl",
						value: phone,
						onChange: (e) => setPhone(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "password",
						children: "Criar Senha"
					}), /* @__PURE__ */ jsx(Input, {
						id: "password",
						name: "password",
						type: "password",
						placeholder: "Use a senha atual se este e-mail ja tiver conta",
						className: "h-11 rounded-xl",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "py-2 space-y-3",
					children: [
						"Visibilidade para milhares de clientes",
						"Gestão simplificada de estoque e pedidos",
						"Relatórios de vendas em tempo real"
					].map((text, i) => /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 text-xs font-medium text-slate-500",
						children: [/* @__PURE__ */ jsx(CircleCheckBig, { className: "w-3.5 h-3.5 text-emerald-500" }), text]
					}, i))
				}),
				/* @__PURE__ */ jsxs(Button, {
					type: "submit",
					disabled: loading,
					className: "w-full h-14 bg-brand-teal text-white font-black rounded-2xl shadow-lg shadow-brand-teal/20 hover:bg-brand-teal/90 transition-all text-lg group",
					children: [loading ? "Liberando acesso..." : "Solicitar Credenciamento", /* @__PURE__ */ jsx(Store, { className: "w-5 h-5 ml-2 group-hover:scale-110 transition-transform" })]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "text-center pt-2",
					children: /* @__PURE__ */ jsxs("p", {
						className: "text-sm font-medium text-slate-500",
						children: ["Já é um parceiro? ", /* @__PURE__ */ jsx(Link, {
							href: "/auth/login/vendedor",
							className: "text-brand-teal font-black hover:underline",
							children: "Entrar no Painel"
						})]
					})
				})
			]
		})
	});
}
var Trash2 = createLucideIcon("Trash2", [
	["path", {
		d: "M3 6h18",
		key: "d0wm0j"
	}],
	["path", {
		d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
		key: "4alrt4"
	}],
	["path", {
		d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
		key: "v07s0e"
	}],
	["line", {
		x1: "10",
		x2: "10",
		y1: "11",
		y2: "17",
		key: "1uufr5"
	}],
	["line", {
		x1: "14",
		x2: "14",
		y1: "11",
		y2: "17",
		key: "xtxkd"
	}]
]);
var ShoppingBag = createLucideIcon("ShoppingBag", [
	["path", {
		d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z",
		key: "hou9p0"
	}],
	["path", {
		d: "M3 6h18",
		key: "d0wm0j"
	}],
	["path", {
		d: "M16 10a4 4 0 0 1-8 0",
		key: "1ltviw"
	}]
]);
//#endregion
//#region src/lib/CartContext.tsx
var CartContext = createContext(void 0);
function CartProvider({ children }) {
	const { status } = useSession();
	const [items, setItems] = useState([]);
	const [mounted, setMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const isAuthenticated = status === "authenticated";
	useEffect(() => {
		const loadCart = async () => {
			if (status === "loading") return;
			if (isAuthenticated) try {
				const cart = await apiFetch("/api/v1/cart");
				if (cart.items) setItems(cart.items.map((it) => ({
					id: it.id,
					product_id: it.product_id,
					name: it.product?.name || "Produto",
					price: it.unit_price,
					seller_id: it.product?.seller_id || "",
					seller_name: "",
					quantity: it.quantity,
					image: it.product?.image_url
				})));
				const savedLocal = localStorage.getItem("@Entregamais:cart");
				if (savedLocal) {
					const localItems = JSON.parse(savedLocal);
					if (localItems.length > 0) {
						for (const item of localItems) await apiFetch("/api/v1/cart/items", {
							method: "POST",
							body: JSON.stringify({
								product_id: item.product_id,
								quantity: item.quantity
							})
						});
						localStorage.removeItem("@Entregamais:cart");
						const refreshed = await apiFetch("/api/v1/cart");
						if (refreshed.items) setItems(refreshed.items.map((it) => ({
							id: it.id,
							product_id: it.product_id,
							name: it.product?.name,
							price: it.unit_price,
							seller_id: it.product?.seller_id,
							quantity: it.quantity
						})));
					}
				}
			} catch (e) {
				console.error("Erro ao carregar carrinho do DB:", e);
			}
			else {
				const saved = localStorage.getItem("@Entregamais:cart");
				if (saved) setItems(JSON.parse(saved));
			}
			setIsLoading(false);
			setMounted(true);
		};
		loadCart();
	}, [status, isAuthenticated]);
	useEffect(() => {
		if (mounted && !isAuthenticated) localStorage.setItem("@Entregamais:cart", JSON.stringify(items));
	}, [
		items,
		mounted,
		isAuthenticated
	]);
	const addItem = async (item, quantity = 1) => {
		setItems((prev) => {
			if (prev.find((i) => i.product_id === item.product_id)) return prev.map((i) => i.product_id === item.product_id ? {
				...i,
				quantity: i.quantity + quantity
			} : i);
			return [...prev, {
				...item,
				quantity
			}];
		});
		if (isAuthenticated) try {
			await apiFetch("/api/v1/cart/items", {
				method: "POST",
				body: JSON.stringify({
					product_id: item.product_id,
					quantity
				})
			});
		} catch (e) {
			console.error("Erro ao persistir item no DB:", e);
		}
	};
	const removeItem = async (product_id) => {
		const dbId = items.find((i) => i.product_id === product_id)?.id;
		setItems((prev) => prev.filter((i) => i.product_id !== product_id));
		if (isAuthenticated && dbId) try {
			await apiFetch(`/api/v1/cart/items/${dbId}`, { method: "DELETE" });
		} catch (e) {
			console.error("Erro ao remover item do DB:", e);
		}
	};
	const updateQuantity = async (product_id, delta) => {
		const item = items.find((i) => i.product_id === product_id);
		if (!item) return;
		const newQ = Math.max(1, item.quantity + delta);
		const dbId = item.id;
		setItems((prev) => prev.map((i) => i.product_id === product_id ? {
			...i,
			quantity: newQ
		} : i));
		if (isAuthenticated && dbId) try {
			await apiFetch(`/api/v1/cart/items/${dbId}`, {
				method: "PUT",
				body: JSON.stringify({ quantity: newQ })
			});
		} catch (e) {
			console.error("Erro ao atualizar quantidade no DB:", e);
		}
	};
	const clearCart = async () => {
		setItems([]);
		if (isAuthenticated) {}
	};
	const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
	const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
	return /* @__PURE__ */ jsx(CartContext.Provider, {
		value: {
			items,
			addItem,
			removeItem,
			updateQuantity,
			clearCart,
			subtotal,
			totalItems,
			isLoading
		},
		children
	});
}
function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		console.warn("useCart was called outside of a CartProvider. Returning default empty state.");
		return {
			items: [],
			addItem: async () => {},
			removeItem: async () => {},
			updateQuantity: async () => {},
			clearCart: async () => {},
			subtotal: 0,
			totalItems: 0,
			isLoading: false
		};
	}
	return context;
}
//#endregion
//#region src/app/cart/page.tsx
function CartPage() {
	const { items, subtotal, updateQuantity, removeItem } = useCart();
	const router = useRouter();
	const { status } = useSession();
	const fee = items.length > 0 ? 7.9 : 0;
	const total = subtotal + fee;
	const handleCheckout = () => {
		if (items.length === 0) return;
		if (status !== "authenticated") {
			router.push(`/auth/login/customer?callbackUrl=${encodeURIComponent("/checkout")}`);
			return;
		}
		router.push("/checkout");
	};
	return /* @__PURE__ */ jsxs("main", {
		className: "container mx-auto px-4 py-8 pb-32 max-w-5xl",
		children: [/* @__PURE__ */ jsxs("h1", {
			className: "text-3xl md:text-5xl font-black text-ze-black mb-6 md:mb-8 flex items-center uppercase italic tracking-tighter drop-shadow-sm",
			children: [/* @__PURE__ */ jsx(ShoppingBag, { className: "mr-3 h-8 w-8 md:h-12 md:w-12 text-ze-black fill-ze-yellow" }), "Sua Rodada"]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
			children: [/* @__PURE__ */ jsx("div", {
				className: "lg:col-span-2 space-y-4",
				children: items.length > 0 ? items.map((item) => /* @__PURE__ */ jsx(Card, {
					className: "overflow-hidden border-2 border-ze-black/10 rounded-2xl md:rounded-3xl bg-white shadow-sm hover:border-ze-yellow transition-colors group",
					children: /* @__PURE__ */ jsxs(CardContent, {
						className: "p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 md:gap-4 w-full sm:w-auto",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-16 h-16 md:w-20 md:h-20 bg-ze-gray rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl md:text-4xl group-hover:scale-105 transition-transform",
								children: item.name.toLowerCase().includes("cerveja") || item.name.toLowerCase().includes("chopp") ? "🍺" : item.name.toLowerCase().includes("vinho") ? "🍷" : item.name.toLowerCase().includes("destilado") || item.name.toLowerCase().includes("whisky") || item.name.toLowerCase().includes("gin") ? "🥃" : item.name.toLowerCase().includes("gelo") ? "🧊" : item.name.toLowerCase().includes("petisco") ? "🥨" : "🥤"
							}), /* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("h3", {
									className: "font-black text-base md:text-xl text-ze-black uppercase tracking-tight leading-none mb-1",
									children: item.name
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-[10px] md:text-xs font-bold text-ze-black/40 uppercase tracking-widest",
									children: item.seller_name
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "font-black text-lg md:text-xl text-ze-red mt-1 md:mt-2",
									children: ["R$ ", item.price.toFixed(2).replace(".", ",")]
								})
							] })]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 md:gap-4 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center border-2 border-ze-black rounded-xl bg-white overflow-hidden shadow-sm h-10",
								children: [
									/* @__PURE__ */ jsx("button", {
										onClick: () => updateQuantity(item.product_id, -1),
										className: "px-3 md:px-4 py-2 font-black text-ze-black hover:bg-ze-yellow transition-colors text-base md:text-lg focus:outline-none",
										children: "-"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "flex-1 h-full flex items-center justify-center font-black text-ze-black bg-ze-yellow border-x-2 border-ze-black min-w-[2.5rem] md:min-w-[3rem] text-center text-sm md:text-base",
										children: item.quantity
									}),
									/* @__PURE__ */ jsx("button", {
										onClick: () => updateQuantity(item.product_id, 1),
										className: "px-3 md:px-4 py-2 font-black text-ze-black hover:bg-ze-yellow transition-colors text-base md:text-lg focus:outline-none",
										children: "+"
									})
								]
							}), /* @__PURE__ */ jsx(Button, {
								onClick: () => removeItem(item.product_id),
								variant: "ghost",
								size: "icon",
								className: "text-ze-black/20 hover:text-ze-red hover:bg-ze-red/10 rounded-xl w-10 h-10 md:w-12 md:h-12",
								children: /* @__PURE__ */ jsx(Trash2, { className: "h-5 w-5 md:h-6 md:w-6" })
							})]
						})]
					})
				}, item.product_id)) : /* @__PURE__ */ jsxs("div", {
					className: "text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-ze-black/10",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "text-6xl mb-4 opacity-50 grayscale",
							children: "🛍️"
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "text-2xl font-black text-ze-black uppercase italic tracking-tighter",
							children: "Sua rodada está vazia"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-ze-black/40 mt-2 font-bold uppercase tracking-widest text-sm",
							children: "Navegue pelos depósitos e garanta a gelada."
						}),
						/* @__PURE__ */ jsx(Button, {
							onClick: () => router.push("/"),
							variant: "ze-dark",
							className: "mt-8 rounded-2xl h-14 font-black tracking-widest uppercase shadow-lg",
							children: "Procurar Bebidas"
						})
					]
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "lg:col-span-1",
				children: /* @__PURE__ */ jsx(Card, {
					className: "sticky top-24 border-2 border-ze-black shadow-[6px_6px_0px_#1B1B1B] md:shadow-[8px_8px_0px_#1B1B1B] rounded-[2rem] md:rounded-3xl bg-ze-yellow overflow-hidden",
					children: /* @__PURE__ */ jsxs(CardContent, {
						className: "p-4 md:p-6",
						children: [
							/* @__PURE__ */ jsx("h3", {
								className: "text-xl md:text-2xl font-black text-ze-black mb-6 md:mb-8 uppercase italic tracking-tighter bg-white inline-block px-3 md:px-4 py-1 md:py-1.5 rounded-xl border-2 border-ze-black -rotate-2",
								children: "Resumo"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-3 md:space-y-4 text-[10px] md:text-sm font-bold text-ze-black/60 mb-6 md:mb-8 uppercase tracking-widest",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex justify-between items-center bg-white/50 p-2.5 md:p-3 rounded-xl border border-ze-black/10",
										children: [/* @__PURE__ */ jsx("span", { children: "Subtotal" }), /* @__PURE__ */ jsxs("span", {
											className: "text-ze-black",
											children: ["R$ ", subtotal.toFixed(2).replace(".", ",")]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex justify-between items-center bg-white/50 p-2.5 md:p-3 rounded-xl border border-ze-black/10",
										children: [/* @__PURE__ */ jsx("span", { children: "Entrega" }), /* @__PURE__ */ jsxs("span", {
											className: "text-ze-black",
											children: ["R$ ", fee.toFixed(2).replace(".", ",")]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "pt-4 md:pt-6 border-t-2 md:border-t-4 border-ze-black mt-4 md:mt-6 flex justify-between items-center bg-white px-3 md:px-4 py-3 md:py-4 rounded-xl md:rounded-2xl",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-black text-ze-black text-base md:text-lg uppercase italic tracking-tighter",
											children: "Total"
										}), /* @__PURE__ */ jsxs("span", {
											className: "font-black text-2xl md:text-3xl text-ze-black tracking-tighter",
											children: ["R$ ", total.toFixed(2).replace(".", ",")]
										})]
									})
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mb-4 md:mb-6",
								children: /* @__PURE__ */ jsx(Input, {
									placeholder: "CUPOM",
									className: "mb-2 h-12 md:h-14 border-2 border-ze-black focus-visible:ring-0 rounded-xl md:rounded-2xl font-black uppercase tracking-widest placeholder:text-ze-black/20 text-center"
								})
							}),
							/* @__PURE__ */ jsxs(Button, {
								onClick: handleCheckout,
								disabled: items.length === 0,
								variant: "ze-dark",
								size: "lg",
								className: "w-full h-14 md:h-16 text-base md:text-lg font-black uppercase italic tracking-tighter shadow-xl group border-2 border-ze-black rounded-xl md:rounded-2xl disabled:opacity-50",
								children: ["Finalizar", /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-2 transition-transform" })]
							})
						]
					})
				})
			})]
		})]
	});
}
var CreditCard = createLucideIcon("CreditCard", [["rect", {
	width: "20",
	height: "14",
	x: "2",
	y: "5",
	rx: "2",
	key: "ynyp8z"
}], ["line", {
	x1: "2",
	x2: "22",
	y1: "10",
	y2: "10",
	key: "1b3vmo"
}]]);
var Banknote = createLucideIcon("Banknote", [
	["rect", {
		width: "20",
		height: "12",
		x: "2",
		y: "6",
		rx: "2",
		key: "9lu3g6"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "2",
		key: "1c9p78"
	}],
	["path", {
		d: "M6 12h.01M18 12h.01",
		key: "113zkx"
	}]
]);
var ChevronLeft = createLucideIcon("ChevronLeft", [["path", {
	d: "m15 18-6-6 6-6",
	key: "1wnfg3"
}]]);
var Clock = createLucideIcon("Clock", [["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}], ["polyline", {
	points: "12 6 12 12 16 14",
	key: "68esgv"
}]]);
var Check = createLucideIcon("Check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]);
//#endregion
//#region node_modules/vinext/dist/shims/image-config.js
/**
* Convert a glob pattern (with `*` and `**`) to a RegExp.
*
* For hostnames, segments are separated by `.`:
*   - `*` matches a single segment (no dots): [^.]+
*   - `**` matches any number of segments: .+
*
* For pathnames, segments are separated by `/`:
*   - `*` matches a single segment (no slashes): [^/]+
*   - `**` matches any number of segments (including empty): .*
*
* Literal characters are escaped for regex safety.
*/
function globToRegex(pattern, separator) {
	let regexStr = "^";
	const doubleStar = separator === "." ? ".+" : ".*";
	const singleStar = separator === "." ? "[^.]+" : "[^/]+";
	const parts = pattern.split("**");
	for (let i = 0; i < parts.length; i++) {
		if (i > 0) regexStr += doubleStar;
		const subParts = parts[i].split("*");
		for (let j = 0; j < subParts.length; j++) {
			if (j > 0) regexStr += singleStar;
			regexStr += subParts[j].replace(/[.+?^${}()|[\]\\]/g, "\\$&");
		}
	}
	regexStr += "$";
	return new RegExp(regexStr);
}
/**
* Check whether a URL matches a single remote pattern.
* Follows the same semantics as Next.js's matchRemotePattern().
*/
function matchRemotePattern(pattern, url) {
	if (pattern.protocol !== void 0) {
		if (pattern.protocol.replace(/:$/, "") !== url.protocol.replace(/:$/, "")) return false;
	}
	if (pattern.port !== void 0) {
		if (pattern.port !== url.port) return false;
	}
	if (!globToRegex(pattern.hostname, ".").test(url.hostname)) return false;
	if (pattern.search !== void 0) {
		if (pattern.search !== url.search) return false;
	}
	if (!globToRegex(pattern.pathname ?? "**", "/").test(url.pathname)) return false;
	return true;
}
/**
* Check whether a URL matches any configured remote pattern or legacy domain.
*/
function hasRemoteMatch(domains, remotePatterns, url) {
	return domains.some((domain) => url.hostname === domain) || remotePatterns.some((p) => matchRemotePattern(p, url));
}
//#endregion
//#region node_modules/@unpic/react/dist/chunk-VTEFGNYT.mjs
var nestedKeys = /* @__PURE__ */ new Set(["style"]);
var fixedMap = {
	srcset: "srcSet",
	fetchpriority: "use" in React$1 ? "fetchPriority" : "fetchpriority"
};
var camelize = (key) => {
	if (key.startsWith("data-") || key.startsWith("aria-")) return key;
	return fixedMap[key] || key.replace(/-./g, (suffix) => suffix[1].toUpperCase());
};
function camelizeProps(props) {
	return Object.fromEntries(Object.entries(props).map(([k, v]) => [camelize(k), nestedKeys.has(k) && v && typeof v !== "string" ? camelizeProps(v) : v]));
}
//#endregion
//#region node_modules/@unpic/core/dist/chunk-7DG3H6KO.mjs
var getSizes = (width, layout) => {
	if (!width || !layout) return;
	switch (layout) {
		case `constrained`: return `(min-width: ${width}px) ${width}px, 100vw`;
		case `fixed`: return `${width}px`;
		case `fullWidth`: return `100vw`;
		default: return;
	}
};
var pixelate = (value) => value || value === 0 ? `${value}px` : void 0;
var getStyle = ({ width, height, aspectRatio, layout, objectFit = "cover", background }) => {
	const styleEntries = [["object-fit", objectFit]];
	if (background?.startsWith("https:") || background?.startsWith("http:") || background?.startsWith("data:") || background?.startsWith("/")) {
		styleEntries.push(["background-image", `url(${background})`]);
		styleEntries.push(["background-size", "cover"]);
		styleEntries.push(["background-repeat", "no-repeat"]);
	} else styleEntries.push(["background", background]);
	if (layout === "fixed") {
		styleEntries.push(["width", pixelate(width)]);
		styleEntries.push(["height", pixelate(height)]);
	}
	if (layout === "constrained") {
		styleEntries.push(["max-width", pixelate(width)]);
		styleEntries.push(["max-height", pixelate(height)]);
		styleEntries.push(["aspect-ratio", aspectRatio ? `${aspectRatio}` : void 0]);
		styleEntries.push(["width", "100%"]);
	}
	if (layout === "fullWidth") {
		styleEntries.push(["width", "100%"]);
		styleEntries.push(["aspect-ratio", aspectRatio ? `${aspectRatio}` : void 0]);
		styleEntries.push(["height", pixelate(height)]);
	}
	return Object.fromEntries(styleEntries.filter(([, value]) => value));
};
var DEFAULT_RESOLUTIONS = [
	6016,
	5120,
	4480,
	3840,
	3200,
	2560,
	2048,
	1920,
	1668,
	1280,
	1080,
	960,
	828,
	750,
	640
];
var LOW_RES_WIDTH = 24;
var getBreakpoints = ({ width, layout, resolutions = DEFAULT_RESOLUTIONS }) => {
	if (layout === "fullWidth") return resolutions;
	if (!width) return [];
	const doubleWidth = width * 2;
	if (layout === "fixed") return [width, doubleWidth];
	if (layout === "constrained") return [
		width,
		doubleWidth,
		...resolutions.filter((w) => w < doubleWidth)
	];
	return [];
};
var getSrcSetEntries = ({ src, width, layout = "constrained", height, aspectRatio, breakpoints, format }) => {
	breakpoints ||= getBreakpoints({
		width,
		layout
	});
	return breakpoints.sort((a, b) => a - b).map((bp) => {
		let transformedHeight;
		if (height && aspectRatio) transformedHeight = Math.round(bp / aspectRatio);
		return {
			url: src,
			width: bp,
			height: transformedHeight,
			format
		};
	});
};
var getSrcSet = (options) => {
	let { src, transformer, operations } = options;
	if (!transformer) return "";
	return getSrcSetEntries(options).map(({ url: _, ...transform }) => {
		return `${transformer(src, {
			...operations,
			...transform
		}, options.options)?.toString()} ${transform.width}w`;
	}).join(",\n");
};
function transformSharedProps({ width, height, priority, layout = "constrained", aspectRatio, ...props }) {
	width = width && Number(width) || void 0;
	height = height && Number(height) || void 0;
	if (priority) {
		props.loading ||= "eager";
		props.fetchpriority ||= "high";
	} else {
		props.loading ||= "lazy";
		props.decoding ||= "async";
	}
	if (props.alt === "") props.role ||= "presentation";
	if (aspectRatio) {
		if (width) if (height) {} else height = Math.round(width / aspectRatio);
		else if (height) width = Math.round(height * aspectRatio);
		else if (layout !== "fullWidth") {}
	} else if (width && height) aspectRatio = width / height;
	else if (layout !== "fullWidth") {}
	return {
		width,
		height,
		aspectRatio,
		layout,
		...props
	};
}
function transformBaseImageProps(props) {
	let { src, transformer, background, layout, objectFit, breakpoints, width, height, aspectRatio, unstyled, operations, options, ...transformedProps } = transformSharedProps(props);
	if (transformer && background === "auto") {
		const lowResHeight = aspectRatio ? Math.round(LOW_RES_WIDTH / aspectRatio) : void 0;
		const lowResImage = transformer(src, {
			width: LOW_RES_WIDTH,
			height: lowResHeight
		}, options);
		if (lowResImage) background = lowResImage.toString();
	}
	const styleProps = {
		width,
		height,
		aspectRatio,
		layout,
		objectFit,
		background
	};
	transformedProps.sizes ||= getSizes(width, layout);
	if (!unstyled) transformedProps.style = {
		...getStyle(styleProps),
		...transformedProps.style
	};
	if (transformer) {
		transformedProps.srcset = getSrcSet({
			src,
			width,
			height,
			aspectRatio,
			layout,
			breakpoints,
			transformer,
			operations,
			options
		});
		const transformed = transformer(src, {
			...operations,
			width,
			height
		}, options);
		if (transformed) src = transformed;
		if (layout === "fullWidth" || layout === "constrained") {
			width = void 0;
			height = void 0;
		}
	}
	return {
		...transformedProps,
		src: src?.toString(),
		width,
		height
	};
}
function normalizeImageType(type) {
	if (!type) return {};
	if (type.startsWith("image/")) return {
		format: type.slice(6),
		mimeType: type
	};
	return {
		format: type,
		mimeType: `image/${type === "jpg" ? "jpeg" : type}`
	};
}
function transformBaseSourceProps({ media, type, ...props }) {
	let { src, transformer, layout, breakpoints, width, height, aspectRatio, sizes, loading, decoding, operations, options, ...rest } = transformSharedProps(props);
	if (!transformer) return {};
	const { format, mimeType } = normalizeImageType(type);
	sizes ||= getSizes(width, layout);
	const srcset = getSrcSet({
		src,
		width,
		height,
		aspectRatio,
		layout,
		breakpoints,
		transformer,
		format,
		operations,
		options
	});
	const transformed = transformer(src, {
		...operations,
		width,
		height
	}, options);
	if (transformed) src = transformed;
	const returnObject = {
		...rest,
		sizes,
		srcset
	};
	if (media) returnObject.media = media;
	if (mimeType) returnObject.type = mimeType;
	return returnObject;
}
//#endregion
//#region node_modules/unpic/esm/data/domains.js
var domains_default = {
	"images.ctfassets.net": "contentful",
	"cdn.builder.io": "builder.io",
	"images.prismic.io": "imgix",
	"www.datocms-assets.com": "imgix",
	"cdn.sanity.io": "imgix",
	"images.unsplash.com": "imgix",
	"cdn.shopify.com": "shopify",
	"s7d1.scene7.com": "scene7",
	"ip.keycdn.com": "keycdn",
	"assets.caisy.io": "bunny",
	"images.contentstack.io": "contentstack",
	"ucarecdn.com": "uploadcare",
	"imagedelivery.net": "cloudflare_images",
	"wsrv.nl": "wsrv"
};
//#endregion
//#region node_modules/unpic/esm/data/subdomains.js
var subdomains_default = {
	"imgix.net": "imgix",
	"wp.com": "wordpress",
	"files.wordpress.com": "wordpress",
	"b-cdn.net": "bunny",
	"storyblok.com": "storyblok",
	"kc-usercontent.com": "kontent.ai",
	"cloudinary.com": "cloudinary",
	"kxcdn.com": "keycdn",
	"imgeng.in": "imageengine",
	"imagekit.io": "imagekit",
	"cloudimg.io": "cloudimage",
	"ucarecdn.com": "uploadcare",
	"supabase.co": "supabase",
	"graphassets.com": "hygraph"
};
//#endregion
//#region node_modules/unpic/esm/data/paths.js
var paths_default = {
	"/cdn-cgi/image/": "cloudflare",
	"/cdn-cgi/imagedelivery/": "cloudflare_images",
	"/_next/image": "nextjs",
	"/_vercel/image": "vercel",
	"/is/image": "scene7",
	"/_ipx/": "ipx",
	"/_image": "astro",
	"/.netlify/images": "netlify",
	"/storage/v1/object/public/": "supabase",
	"/storage/v1/render/image/public/": "supabase",
	"/v1/storage/buckets/": "appwrite"
};
//#endregion
//#region node_modules/unpic/esm/src/utils.js
function roundIfNumeric(value) {
	if (!value) return value;
	const num = Number(value);
	if (isNaN(num)) return value;
	return Math.round(num);
}
/**
* Given a URL object, returns path and query params
*/
var toRelativeUrl = (url) => {
	const { pathname, search } = url;
	return `${pathname}${search}`;
};
/**
* Returns a URL string that may be relative or absolute
*/
var toCanonicalUrlString = (url) => {
	return url.hostname === "n" ? toRelativeUrl(url) : url.toString();
};
/**
* Normalises a URL object or string URL to a URL object.
*/
var toUrl = (url, base) => {
	return typeof url === "string" ? new URL(url, base ?? "http://n/") : url;
};
/**
* Escapes a string, even if it's URL-safe
*/
var escapeChar = (text) => text === " " ? "+" : "%" + text.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
var stripLeadingSlash = (str) => str?.startsWith("/") ? str.slice(1) : str;
var stripTrailingSlash = (str) => str?.endsWith("/") ? str.slice(0, -1) : str;
var addTrailingSlash = (str) => str?.endsWith("/") ? str : `${str}/`;
/**
* Creates a formatter given an operation joiner and key/value joiner
*/
var createFormatter = (kvSeparator, paramSeparator) => {
	const encodedValueJoiner = escapeChar(kvSeparator);
	const encodedOperationJoiner = escapeChar(paramSeparator);
	function escape(value) {
		return encodeURIComponent(value).replaceAll(kvSeparator, encodedValueJoiner).replaceAll(paramSeparator, encodedOperationJoiner);
	}
	function format(key, value) {
		return `${escape(key)}${kvSeparator}${escape(String(value))}`;
	}
	return (operations) => {
		return (Array.isArray(operations) ? operations : Object.entries(operations)).flatMap(([key, value]) => {
			if (value === void 0 || value === null) return [];
			if (Array.isArray(value)) return value.map((v) => format(key, v));
			return format(key, value);
		}).join(paramSeparator);
	};
};
/**
* Creates a parser given an operation joiner and key/value joiner
*/
var createParser = (kvSeparator, paramSeparator) => {
	if (kvSeparator === "=" && paramSeparator === "&") return queryParser;
	return (url) => {
		const urlString = url.toString();
		return Object.fromEntries(urlString.split(paramSeparator).map((pair) => {
			const [key, value] = pair.split(kvSeparator);
			return [decodeURI(key), decodeURI(value)];
		}));
	};
};
/**
* Clamp width and height, maintaining aspect ratio
*/
function clampDimensions(operations, maxWidth = 4e3, maxHeight = 4e3) {
	let { width, height } = operations;
	width = Number(width) || void 0;
	height = Number(height) || void 0;
	if (width && width > maxWidth) {
		if (height) height = Math.round(height * maxWidth / width);
		width = maxWidth;
	}
	if (height && height > maxHeight) {
		if (width) width = Math.round(width * maxHeight / height);
		height = maxHeight;
	}
	return {
		width,
		height
	};
}
function extractFromURL(url) {
	const parsedUrl = toUrl(url);
	const operations = Object.fromEntries(parsedUrl.searchParams.entries());
	for (const key in [
		"width",
		"height",
		"quality"
	]) {
		const value = operations[key];
		if (value) {
			const newVal = Number(value);
			if (!isNaN(newVal)) operations[key] = newVal;
		}
	}
	parsedUrl.search = "";
	return {
		operations,
		src: toCanonicalUrlString(parsedUrl)
	};
}
function normaliseOperations({ keyMap = {}, formatMap = {}, defaults = {} }, operations) {
	if (operations.format && operations.format in formatMap) operations.format = formatMap[operations.format];
	if (operations.width) operations.width = roundIfNumeric(operations.width);
	if (operations.height) operations.height = roundIfNumeric(operations.height);
	for (const k in keyMap) {
		if (!Object.prototype.hasOwnProperty.call(keyMap, k)) continue;
		const key = k;
		if (keyMap[key] === false) {
			delete operations[key];
			continue;
		}
		if (keyMap[key] && operations[key]) {
			operations[keyMap[key]] = operations[key];
			delete operations[key];
		}
	}
	for (const k in defaults) {
		if (!Object.prototype.hasOwnProperty.call(defaults, k)) continue;
		const key = k;
		const value = defaults[key];
		if (!operations[key] && value !== void 0) {
			if (keyMap[key] === false) continue;
			const resolvedKey = keyMap[key] ?? key;
			if (resolvedKey in operations) continue;
			operations[resolvedKey] = value;
		}
	}
	return operations;
}
var invertMap = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
function denormaliseOperations({ keyMap = {}, formatMap = {}, defaults = {} }, operations) {
	const ops = normaliseOperations({
		keyMap: invertMap(keyMap),
		formatMap: invertMap(formatMap),
		defaults
	}, operations);
	if (ops.width) ops.width = roundIfNumeric(ops.width);
	if (ops.height) ops.height = roundIfNumeric(ops.height);
	const q = Number(ops.quality);
	if (!isNaN(q)) ops.quality = q;
	return ops;
}
var queryParser = (url) => {
	const parsedUrl = toUrl(url);
	return Object.fromEntries(parsedUrl.searchParams.entries());
};
function createOperationsGenerator({ kvSeparator = "=", paramSeparator = "&", ...options } = {}) {
	const formatter = createFormatter(kvSeparator, paramSeparator);
	return (operations) => {
		return formatter(normaliseOperations(options, operations));
	};
}
function createOperationsParser({ kvSeparator = "=", paramSeparator = "&", defaults: _, ...options } = {}) {
	const parser = createParser(kvSeparator, paramSeparator);
	return (url) => {
		return denormaliseOperations(options, url ? parser(url) : {});
	};
}
function createOperationsHandlers(config) {
	return {
		operationsGenerator: createOperationsGenerator(config),
		operationsParser: createOperationsParser(config)
	};
}
function paramToBoolean(value) {
	if (value === void 0 || value === null) return;
	try {
		return Boolean(JSON.parse(value?.toString()));
	} catch {
		return Boolean(value);
	}
}
var removeUndefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== void 0));
function createExtractAndGenerate(extract, generate) {
	return ((src, operations, options) => {
		const base = extract(src, options);
		if (!base) return generate(src, operations, options);
		return generate(base.src, {
			...base.operations,
			...removeUndefined(operations)
		}, {
			...base.options,
			...options
		});
	});
}
//#endregion
//#region node_modules/unpic/esm/src/detect.js
var cdnDomains = new Map(Object.entries(domains_default));
var cdnSubdomains = Object.entries(subdomains_default);
var cdnPaths = Object.entries(paths_default);
/**
* Detects the image CDN provider for a given URL.
*/
function getProviderForUrl(url) {
	return getProviderForUrlByDomain(url) || getProviderForUrlByPath(url);
}
function getProviderForUrlByDomain(url) {
	if (typeof url === "string" && !url.startsWith("https://")) return false;
	const { hostname } = toUrl(url);
	const cdn = cdnDomains.get(hostname);
	if (cdn) return cdn;
	return cdnSubdomains.find(([subdomain]) => hostname.endsWith(subdomain))?.[1] || false;
}
/**
* Gets the image CDN provider for a given URL by its path.
*/
function getProviderForUrlByPath(url) {
	const { pathname } = toUrl(url);
	return cdnPaths.find(([path]) => pathname.startsWith(path))?.[1] || false;
}
//#endregion
//#region node_modules/unpic/esm/src/providers/appwrite.js
var VIEW_URL_SUFFIX = "/view?";
var PREVIEW_URL_SUFFIX = "/preview?";
var { operationsGenerator: operationsGenerator$25, operationsParser: operationsParser$20 } = createOperationsHandlers({
	keyMap: { format: "output" },
	kvSeparator: "=",
	paramSeparator: "&"
});
var generate$26 = (src, modifiers) => {
	const url = toUrl(src.toString().replace(VIEW_URL_SUFFIX, PREVIEW_URL_SUFFIX));
	const projectParam = url.searchParams.get("project") ?? "";
	url.search = operationsGenerator$25(modifiers);
	url.searchParams.append("project", projectParam);
	return toCanonicalUrlString(url);
};
var extract$26 = (url) => {
	if (getProviderForUrlByPath(url) !== "appwrite") return null;
	const parsedUrl = toUrl(url);
	const operations = operationsParser$20(parsedUrl);
	delete operations.project;
	const projectParam = parsedUrl.searchParams.get("project") ?? "";
	parsedUrl.search = "";
	parsedUrl.searchParams.append("project", projectParam);
	return {
		src: parsedUrl.href,
		operations
	};
};
var transform$27 = createExtractAndGenerate(extract$26, generate$26);
//#endregion
//#region node_modules/unpic/esm/src/providers/astro.js
var DEFAULT_ENDPOINT = "/_image";
var { operationsParser: operationsParser$19, operationsGenerator: operationsGenerator$24 } = createOperationsHandlers({
	keyMap: {
		format: "f",
		width: "w",
		height: "h",
		quality: "q"
	},
	defaults: { fit: "cover" }
});
var generate$25 = (src, modifiers, options) => {
	const url = toUrl(`${stripTrailingSlash(options?.baseUrl ?? "")}${options?.endpoint ?? DEFAULT_ENDPOINT}`);
	url.search = operationsGenerator$24(modifiers);
	url.searchParams.set("href", src.toString());
	return toCanonicalUrlString(url);
};
var extract$25 = (url) => {
	const parsedUrl = toUrl(url);
	const src = parsedUrl.searchParams.get("href");
	if (!src) return null;
	parsedUrl.searchParams.delete("href");
	return {
		src,
		operations: operationsParser$19(parsedUrl),
		options: { baseUrl: parsedUrl.origin }
	};
};
var transform$26 = (src, operations, options = {}) => {
	if (toUrl(src).pathname !== (options?.endpoint ?? DEFAULT_ENDPOINT)) return generate$25(src, operations, options);
	const base = extract$25(src);
	if (!base) return generate$25(src, operations, options);
	options.baseUrl ??= base.options.baseUrl;
	return generate$25(base.src, {
		...base.operations,
		...operations
	}, options);
};
//#endregion
//#region node_modules/unpic/esm/src/providers/builder.io.js
var operationsGenerator$23 = createOperationsGenerator({ defaults: {
	fit: "cover",
	format: "webp",
	sharp: true
} });
var extract$24 = extractFromURL;
var generate$24 = (src, modifiers) => {
	const operations = operationsGenerator$23(modifiers);
	const url = toUrl(src);
	url.search = operations;
	return toCanonicalUrlString(url);
};
var transform$25 = createExtractAndGenerate(extract$24, generate$24);
//#endregion
//#region node_modules/unpic/esm/src/providers/bunny.js
var operationsGenerator$22 = createOperationsGenerator({ keyMap: { format: "output" } });
var extract$23 = extractFromURL;
var generate$23 = (src, modifiers) => {
	const operations = operationsGenerator$22(modifiers);
	const url = toUrl(src);
	url.search = operations;
	return toCanonicalUrlString(url);
};
var extractAndGenerate$1 = createExtractAndGenerate(extract$23, generate$23);
var transform$24 = (src, operations) => {
	const { width, height } = operations;
	if (width && height) operations.aspect_ratio ??= `${Math.round(Number(width))}:${Math.round(Number(height))}`;
	return extractAndGenerate$1(src, operations);
};
//#endregion
//#region node_modules/unpic/esm/src/providers/cloudflare.js
var { operationsGenerator: operationsGenerator$21, operationsParser: operationsParser$18 } = createOperationsHandlers({
	keyMap: { "format": "f" },
	defaults: {
		format: "auto",
		fit: "cover"
	},
	formatMap: { jpg: "jpeg" },
	kvSeparator: "=",
	paramSeparator: ","
});
var generate$22 = (src, operations, options) => {
	const modifiers = operationsGenerator$21(operations);
	const url = toUrl(options?.domain ? `https://${options.domain}` : "/");
	url.pathname = `/cdn-cgi/image/${modifiers}/${stripLeadingSlash(src.toString())}`;
	return toCanonicalUrlString(url);
};
var extract$22 = (url, options) => {
	if (getProviderForUrlByPath(url) !== "cloudflare") return null;
	const parsedUrl = toUrl(url);
	const [, , , modifiers, ...src] = parsedUrl.pathname.split("/");
	const operations = operationsParser$18(modifiers);
	return {
		src: toCanonicalUrlString(toUrl(src.join("/"))),
		operations,
		options: { domain: options?.domain ?? (parsedUrl.hostname === "n" ? void 0 : parsedUrl.hostname) }
	};
};
var transform$23 = createExtractAndGenerate(extract$22, generate$22);
//#endregion
//#region node_modules/unpic/esm/src/providers/cloudflare_images.js
var cloudflareImagesRegex = /https?:\/\/(?<host>[^\/]+)\/cdn-cgi\/imagedelivery\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/g;
var imagedeliveryRegex = /https?:\/\/(?<host>imagedelivery.net)\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/g;
var { operationsGenerator: operationsGenerator$20, operationsParser: operationsParser$17 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		format: "f"
	},
	defaults: { fit: "cover" },
	kvSeparator: "=",
	paramSeparator: ","
});
function formatUrl(options, transformations) {
	const { host, accountHash, imageId } = options;
	if (!host || !accountHash || !imageId) throw new Error("Missing required Cloudflare Images options");
	return [
		"https:/",
		...host === "imagedelivery.net" ? [host] : [
			host,
			"cdn-cgi",
			"imagedelivery"
		],
		accountHash,
		imageId,
		transformations
	].filter(Boolean).join("/");
}
var generate$21 = (_src, operations, options = {}) => {
	return toCanonicalUrlString(toUrl(formatUrl(options, operationsGenerator$20(operations))));
};
var extract$21 = (url) => {
	const parsedUrl = toUrl(url);
	const matches = [...parsedUrl.toString().matchAll(cloudflareImagesRegex), ...parsedUrl.toString().matchAll(imagedeliveryRegex)];
	if (!matches[0]?.groups) return null;
	const { host, accountHash, imageId, transformations } = matches[0].groups;
	const operations = operationsParser$17(transformations || "");
	const options = {
		host,
		accountHash,
		imageId
	};
	return {
		src: formatUrl(options),
		operations,
		options
	};
};
var transform$22 = (src, operations, options = {}) => {
	const extracted = extract$21(src);
	if (!extracted) throw new Error("Invalid Cloudflare Images URL");
	const newOperations = {
		...extracted.operations,
		...operations
	};
	return generate$21(extracted.src, newOperations, {
		...extracted.options,
		...options
	});
};
//#endregion
//#region node_modules/unpic/esm/src/providers/cloudimage.js
var { operationsGenerator: operationsGenerator$19, operationsParser: operationsParser$16 } = createOperationsHandlers({
	keyMap: {
		format: "force_format",
		width: "w",
		height: "h",
		quality: "q"
	},
	defaults: { org_if_sml: 1 }
});
var generate$20 = (src, modifiers = {}, { token } = {}) => {
	if (!token) throw new Error("Token is required for Cloudimage URLs" + src);
	let srcString = src.toString();
	srcString = srcString.replace(/^https?:\/\//, "");
	if (srcString.includes("?")) {
		modifiers.ci_url_encoded = 1;
		srcString = encodeURIComponent(srcString);
	}
	const operations = operationsGenerator$19(modifiers);
	const url = new URL(`https://${token}.cloudimg.io/`);
	url.pathname = srcString;
	url.search = operations;
	return url.toString();
};
var extract$20 = (src, options = {}) => {
	const url = toUrl(src);
	if (getProviderForUrl(url) !== "cloudimage") return null;
	const operations = operationsParser$16(url);
	let originalSrc = url.pathname;
	if (operations.ci_url_encoded) {
		originalSrc = decodeURIComponent(originalSrc);
		delete operations.ci_url_encoded;
	}
	options.token ??= url.hostname.replace(".cloudimg.io", "");
	return {
		src: `${url.protocol}/${originalSrc}`,
		operations,
		options
	};
};
var transform$21 = createExtractAndGenerate(extract$20, generate$20);
//#endregion
//#region node_modules/unpic/esm/src/providers/cloudinary.js
var publicRegex = /https?:\/\/(?<host>res\.cloudinary\.com)\/(?<cloudName>[a-zA-Z0-9-]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>(?:[^\s\/]+\/)*[^\s\/]+(?:\.[a-zA-Z0-9]+)?)$/;
var privateRegex = /https?:\/\/(?<host>(?<cloudName>[a-zA-Z0-9-]+)-res\.cloudinary\.com|[a-zA-Z0-9.-]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>(?:[^\s\/]+\/)*[^\s\/]+(?:\.[a-zA-Z0-9]+)?)$/;
var { operationsGenerator: operationsGenerator$18, operationsParser: operationsParser$15 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		format: "f",
		quality: "q"
	},
	defaults: {
		format: "auto",
		c: "lfill"
	},
	kvSeparator: "_",
	paramSeparator: ","
});
function formatCloudinaryUrl({ host, cloudName, assetType, deliveryType, signature, transformations, version, id }) {
	return [
		"https:/",
		host,
		host === "res.cloudinary.com" ? cloudName : void 0,
		assetType,
		deliveryType,
		signature,
		transformations,
		version,
		id
	].filter(Boolean).join("/");
}
function parseCloudinaryUrl(url) {
	let matches = url.toString().match(publicRegex);
	if (!matches?.length) matches = url.toString().match(privateRegex);
	if (!matches?.length) return null;
	return matches.groups || {};
}
var transform$20 = (src, operations) => {
	const group = parseCloudinaryUrl(src.toString());
	if (!group) return src.toString();
	group.transformations = operationsGenerator$18({
		...operationsParser$15(group.transformations || ""),
		...operations
	});
	return formatCloudinaryUrl(group);
};
//#endregion
//#region node_modules/unpic/esm/src/providers/contentful.js
var operationsGenerator$17 = createOperationsGenerator({
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q"
	},
	defaults: { fit: "fill" }
});
var generate$19 = (src, modifiers) => {
	const operations = operationsGenerator$17(modifiers);
	const url = new URL(src);
	url.search = operations;
	return toCanonicalUrlString(url);
};
var extractAndGenerate = createExtractAndGenerate(extractFromURL, generate$19);
var transform$19 = (src, operations) => {
	const { width, height } = clampDimensions(operations, 4e3, 4e3);
	return extractAndGenerate(src, {
		...operations,
		width,
		height
	});
};
//#endregion
//#region node_modules/unpic/esm/src/providers/contentstack.js
var operationsGenerator$16 = createOperationsGenerator({ defaults: {
	auto: "webp",
	disable: "upscale"
} });
var generate$18 = (src, operations, { baseURL = "https://images.contentstack.io/" } = {}) => {
	if (operations.width && operations.height) operations.fit ??= "crop";
	const modifiers = operationsGenerator$16(operations);
	const url = toUrl(src);
	if (url.hostname === "n") {
		url.protocol = "https:";
		url.hostname = new URL(baseURL).hostname;
	}
	url.search = modifiers;
	return toCanonicalUrlString(url);
};
var extract$18 = (url) => {
	const { src, operations } = extractFromURL(url) ?? {};
	if (!operations || !src) return null;
	const { origin } = toUrl(url);
	return {
		src,
		operations,
		options: { baseURL: origin }
	};
};
var transform$18 = createExtractAndGenerate(extract$18, generate$18);
//#endregion
//#region node_modules/unpic/esm/src/providers/directus.js
var operationsGenerator$15 = createOperationsGenerator({ defaults: {
	withoutEnlargement: true,
	fit: "cover"
} });
var generate$17 = (src, operations) => {
	if (Array.isArray(operations.transforms)) operations.transforms = JSON.stringify(operations.transforms);
	const modifiers = operationsGenerator$15(operations);
	const url = toUrl(src);
	url.search = modifiers;
	return toCanonicalUrlString(url);
};
var extract$17 = (url) => {
	const base = extractFromURL(url);
	if (base?.operations?.transforms && typeof base.operations.transforms === "string") try {
		base.operations.transforms = JSON.parse(base.operations.transforms);
	} catch {
		return null;
	}
	return base;
};
var transform$17 = createExtractAndGenerate(extract$17, generate$17);
//#endregion
//#region node_modules/unpic/esm/src/providers/hygraph.js
var hygraphRegex = /https:\/\/(?<region>[a-z0-9-]+)\.graphassets\.com\/(?<envId>[a-zA-Z0-9]+)(?:\/(?<transformations>.*?))?\/(?<handle>[a-zA-Z0-9]+)$/;
var { operationsGenerator: operationsGenerator$14, operationsParser: operationsParser$14 } = createOperationsHandlers({
	keyMap: {
		width: "width",
		height: "height",
		format: "format"
	},
	defaults: {
		format: "auto",
		fit: "crop"
	}
});
var extract$16 = (url) => {
	const matches = toUrl(url).toString().match(hygraphRegex);
	if (!matches?.groups) return null;
	const { region, envId, handle, transformations } = matches.groups;
	const operations = {};
	if (transformations) transformations.split("/").forEach((part) => {
		const [operation, params] = part.split("=");
		if (operation === "resize" && params) params.split(",").forEach((param) => {
			const [key, value] = param.split(":");
			if (key === "width" || key === "height") operations[key] = Number(value);
			else if (key === "fit") operations.fit = value;
		});
		else if (operation === "output" && params) params.split(",").forEach((param) => {
			const [key, value] = param.split(":");
			if (key === "format") operations.format = value;
		});
		else if (operation === "auto_image") operations.format = "auto";
	});
	return {
		src: `https://${region}.graphassets.com/${envId}/${handle}`,
		operations,
		options: {
			region,
			envId,
			handle
		}
	};
};
var generate$16 = (src, operations, options = {}) => {
	const extracted = extract$16(src);
	if (!extracted) throw new Error("Invalid Hygraph URL");
	const { region, envId, handle } = {
		...extracted.options,
		...options
	};
	const transforms = [];
	if (operations.width || operations.height) {
		const resize = [];
		if (operations.width && operations.height) resize.push("fit:crop");
		else if (operations.fit) resize.push(`fit:${operations.fit}`);
		if (operations.width) resize.push(`width:${operations.width}`);
		if (operations.height) resize.push(`height:${operations.height}`);
		if (resize.length) transforms.push(`resize=${resize.join(",")}`);
	}
	if (operations.format === "auto" || !operations.format && !extracted.operations.format) transforms.push("auto_image");
	else if (operations.format) transforms.push(`output=format:${operations.format}`);
	return toCanonicalUrlString(toUrl(`${`https://${region}.graphassets.com/${envId}`}${transforms.length > 0 ? "/" + transforms.join("/") : ""}/${handle}`));
};
var transform$16 = createExtractAndGenerate(extract$16, generate$16);
//#endregion
//#region node_modules/unpic/esm/src/providers/imageengine.js
var { operationsGenerator: operationsGenerator$13, operationsParser: operationsParser$13 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		format: "f"
	},
	defaults: { m: "cropbox" },
	kvSeparator: "_",
	paramSeparator: "/"
});
var generate$15 = (src, operations) => {
	const modifiers = operationsGenerator$13(operations);
	const url = toUrl(src);
	url.searchParams.set("imgeng", modifiers);
	return toCanonicalUrlString(url);
};
var extract$15 = (url) => {
	const parsedUrl = toUrl(url);
	const imgeng = parsedUrl.searchParams.get("imgeng");
	if (!imgeng) return null;
	const operations = operationsParser$13(imgeng);
	parsedUrl.searchParams.delete("imgeng");
	return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
};
var transform$15 = createExtractAndGenerate(extract$15, generate$15);
//#endregion
//#region node_modules/unpic/esm/src/providers/imagekit.js
var { operationsGenerator: operationsGenerator$12, operationsParser: operationsParser$12 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		format: "f",
		quality: "q"
	},
	defaults: {
		c: "maintain_ratio",
		fo: "auto"
	},
	kvSeparator: "-",
	paramSeparator: ","
});
var generate$14 = (src, operations) => {
	const modifiers = operationsGenerator$12(operations);
	const url = toUrl(src);
	url.searchParams.set("tr", modifiers);
	return toCanonicalUrlString(url);
};
var extract$14 = (url) => {
	const parsedUrl = toUrl(url);
	let trPart = null;
	let path = parsedUrl.pathname;
	if (parsedUrl.searchParams.has("tr")) {
		trPart = parsedUrl.searchParams.get("tr");
		parsedUrl.searchParams.delete("tr");
	} else {
		const pathParts = parsedUrl.pathname.split("/");
		const trIndex = pathParts.findIndex((part) => part.startsWith("tr:"));
		if (trIndex !== -1) {
			trPart = pathParts[trIndex].slice(3);
			path = pathParts.slice(0, trIndex).concat(pathParts.slice(trIndex + 1)).join("/");
		}
	}
	if (!trPart) return null;
	parsedUrl.pathname = path;
	const operations = operationsParser$12(trPart);
	return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
};
var transform$14 = createExtractAndGenerate(extract$14, generate$14);
//#endregion
//#region node_modules/unpic/esm/src/providers/imgix.js
var { operationsGenerator: operationsGenerator$11, operationsParser: operationsParser$11 } = createOperationsHandlers({
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q"
	},
	defaults: {
		fit: "min",
		auto: "format"
	}
});
var extract$13 = (url) => {
	const src = toUrl(url);
	const operations = operationsParser$11(url);
	src.search = "";
	return {
		src: toCanonicalUrlString(src),
		operations
	};
};
var generate$13 = (src, operations) => {
	const modifiers = operationsGenerator$11(operations);
	const url = toUrl(src);
	url.search = modifiers;
	if (url.searchParams.has("fm") && url.searchParams.get("auto") === "format") url.searchParams.delete("auto");
	return toCanonicalUrlString(url);
};
var transform$13 = createExtractAndGenerate(extract$13, generate$13);
//#endregion
//#region node_modules/unpic/esm/src/providers/ipx.js
var { operationsGenerator: operationsGenerator$10, operationsParser: operationsParser$10 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		quality: "q",
		format: "f"
	},
	defaults: { f: "auto" },
	kvSeparator: "_",
	paramSeparator: ","
});
var generate$12 = (src, operations, options) => {
	if (operations.width && operations.height) {
		operations.s = `${operations.width}x${operations.height}`;
		delete operations.width;
		delete operations.height;
	}
	const modifiers = operationsGenerator$10(operations);
	const url = toUrl(options?.baseURL ?? "/_ipx");
	url.pathname = `${stripTrailingSlash(url.pathname)}/${modifiers}/${stripLeadingSlash(src.toString())}`;
	return toCanonicalUrlString(url);
};
var extract$12 = (url) => {
	const parsedUrl = toUrl(url);
	const [, baseUrlPart, modifiers, ...srcParts] = parsedUrl.pathname.split("/");
	if (!modifiers || !srcParts.length) return null;
	const operations = operationsParser$10(modifiers);
	if (operations.s) {
		const [width, height] = operations.s.split("x").map(Number);
		operations.width = width;
		operations.height = height;
		delete operations.s;
	}
	return {
		src: "/" + srcParts.join("/"),
		operations,
		options: { baseURL: `${parsedUrl.origin}/${baseUrlPart}` }
	};
};
var transform$12 = (src, operations, options) => {
	const url = toUrl(src);
	const baseURL = options?.baseURL;
	if (baseURL && url.toString().startsWith(baseURL) || url.pathname.startsWith("/_ipx")) {
		const extracted = extract$12(src);
		if (extracted) return generate$12(extracted.src, {
			...extracted.operations,
			...operations
		}, { baseURL: extracted.options.baseURL });
	}
	return generate$12(src, operations, { baseURL });
};
//#endregion
//#region node_modules/unpic/esm/src/providers/keycdn.js
var BOOLEAN_PARAMS = [
	"enlarge",
	"flip",
	"flop",
	"negate",
	"normalize",
	"grayscale",
	"removealpha",
	"olrepeat",
	"progressive",
	"adaptive",
	"lossless",
	"nearlossless",
	"metadata"
];
var { operationsGenerator: operationsGenerator$9, operationsParser: operationsParser$9 } = createOperationsHandlers({
	defaults: { fit: "cover" },
	formatMap: { jpg: "jpeg" }
});
var generate$11 = (src, operations) => {
	const url = toUrl(src);
	for (const key of BOOLEAN_PARAMS) if (operations[key] !== void 0) operations[key] = operations[key] ? 1 : 0;
	url.search = operationsGenerator$9(operations);
	return toCanonicalUrlString(url);
};
var extract$11 = (url) => {
	const parsedUrl = toUrl(url);
	const operations = operationsParser$9(parsedUrl);
	for (const key of BOOLEAN_PARAMS) if (operations[key] !== void 0) operations[key] = paramToBoolean(operations[key]);
	parsedUrl.search = "";
	return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
};
var transform$11 = createExtractAndGenerate(extract$11, generate$11);
//#endregion
//#region node_modules/unpic/esm/src/providers/kontent.ai.js
var { operationsGenerator: operationsGenerator$8, operationsParser: operationsParser$8 } = createOperationsHandlers({
	formatMap: { jpg: "jpeg" },
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q"
	}
});
var generate$10 = (src, operations) => {
	const url = toUrl(src);
	if (operations.lossless !== void 0) operations.lossless = operations.lossless ? 1 : 0;
	if (operations.width && operations.height) operations.fit = "crop";
	url.search = operationsGenerator$8(operations);
	return toCanonicalUrlString(url);
};
var extract$10 = (url) => {
	const parsedUrl = toUrl(url);
	const operations = operationsParser$8(parsedUrl);
	if (operations.lossless !== void 0) operations.lossless = paramToBoolean(operations.lossless);
	parsedUrl.search = "";
	return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
};
var transform$10 = createExtractAndGenerate(extract$10, generate$10);
//#endregion
//#region node_modules/unpic/esm/src/providers/netlify.js
var { operationsGenerator: operationsGenerator$7, operationsParser: operationsParser$7 } = createOperationsHandlers({
	defaults: { fit: "cover" },
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q"
	}
});
var generate$9 = (src, operations, options = {}) => {
	const url = toUrl(`${options.baseUrl || ""}/.netlify/images`);
	url.search = operationsGenerator$7(operations);
	url.searchParams.set("url", src.toString());
	return toCanonicalUrlString(url);
};
var extract$9 = (url) => {
	if (getProviderForUrlByPath(url) !== "netlify") return null;
	const parsedUrl = toUrl(url);
	const operations = operationsParser$7(parsedUrl);
	delete operations.url;
	const sourceUrl = parsedUrl.searchParams.get("url") || "";
	parsedUrl.search = "";
	return {
		src: sourceUrl,
		operations,
		options: { baseUrl: parsedUrl.hostname === "n" ? void 0 : parsedUrl.origin }
	};
};
var transform$9 = createExtractAndGenerate(extract$9, generate$9);
//#endregion
//#region node_modules/unpic/esm/src/providers/vercel.js
var { operationsGenerator: operationsGenerator$6, operationsParser: operationsParser$6 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		quality: "q",
		height: false,
		format: false
	},
	defaults: { q: 75 }
});
var generate$8 = (src, operations, options = {}) => {
	const url = toUrl(`${options.baseUrl || ""}/${options.prefix || "_vercel"}/image`);
	url.search = operationsGenerator$6(operations);
	url.searchParams.append("url", src.toString());
	return toCanonicalUrlString(url);
};
var extract$8 = (url, options = {}) => {
	if (!["vercel", "nextjs"].includes(getProviderForUrlByPath(url) || "")) return null;
	const parsedUrl = toUrl(url);
	const sourceUrl = parsedUrl.searchParams.get("url") || "";
	parsedUrl.searchParams.delete("url");
	const operations = operationsParser$6(parsedUrl);
	parsedUrl.search = "";
	return {
		src: sourceUrl,
		operations,
		options: { baseUrl: options.baseUrl ?? parsedUrl.origin }
	};
};
var transform$8 = createExtractAndGenerate(extract$8, generate$8);
//#endregion
//#region node_modules/unpic/esm/src/providers/nextjs.js
var generate$7 = (src, operations, options = {}) => generate$8(src, operations, {
	...options,
	prefix: "_next"
});
var extract$7 = (url, options) => extract$8(url, options);
var transform$7 = createExtractAndGenerate(extract$7, generate$7);
//#endregion
//#region node_modules/unpic/esm/src/providers/scene7.js
var { operationsGenerator: operationsGenerator$5, operationsParser: operationsParser$5 } = createOperationsHandlers({
	keyMap: {
		width: "wid",
		height: "hei",
		quality: "qlt",
		format: "fmt"
	},
	defaults: { fit: "crop,0" }
});
var BASE = "https://s7d1.scene7.com/is/image/";
var generate$6 = (src, operations) => {
	const url = new URL(src, BASE);
	url.search = operationsGenerator$5(operations);
	return toCanonicalUrlString(url);
};
var extract$6 = (url) => {
	if (getProviderForUrl(url) !== "scene7") return null;
	const parsedUrl = new URL(url, BASE);
	const operations = operationsParser$5(parsedUrl);
	parsedUrl.search = "";
	return {
		src: parsedUrl.toString(),
		operations
	};
};
var transform$6 = createExtractAndGenerate(extract$6, generate$6);
//#endregion
//#region node_modules/unpic/esm/src/providers/shopify.js
var shopifyRegex = /(.+?)(?:_(?:(pico|icon|thumb|small|compact|medium|large|grande|original|master)|(\d*)x(\d*)))?(?:_crop_([a-z]+))?(\.[a-zA-Z]+)(\.png|\.jpg|\.webp|\.avif)?$/;
var { operationsGenerator: operationsGenerator$4, operationsParser: operationsParser$4 } = createOperationsHandlers({ keyMap: { format: false } });
var generate$5 = (src, operations) => {
	const url = toUrl(src);
	url.pathname = url.pathname.replace(shopifyRegex, "$1$6");
	url.search = operationsGenerator$4(operations);
	return toCanonicalUrlString(url);
};
var extract$5 = (url) => {
	const parsedUrl = toUrl(url);
	const match = shopifyRegex.exec(parsedUrl.pathname);
	const operations = operationsParser$4(parsedUrl);
	if (match) {
		const [, , , width, height, crop] = match;
		if (width && height && !operations.width && !operations.height) {
			operations.width = parseInt(width, 10);
			operations.height = parseInt(height, 10);
		}
		if (crop) operations.crop ??= crop;
	}
	parsedUrl.pathname = parsedUrl.pathname.replace(shopifyRegex, "$1$6");
	for (const key of [
		"width",
		"height",
		"crop",
		"pad_color",
		"format"
	]) parsedUrl.searchParams.delete(key);
	return {
		src: parsedUrl.toString(),
		operations
	};
};
var transform$5 = createExtractAndGenerate(extract$5, generate$5);
//#endregion
//#region node_modules/unpic/esm/src/providers/storyblok.js
var storyBlokAssets = /(?<id>\/f\/\d+\/\d+x\d+\/\w+\/[^\/]+)\/?(?<modifiers>m\/?(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?)?$/;
var storyBlokImg2 = /^(?<modifiers>\/(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?\/?)?(?<id>\/f\/.+)$/;
var filterSplitterRegex = /:(?![^(]*\))/;
var splitFilters = (filters) => {
	if (!filters) return {};
	return Object.fromEntries(filters.split(filterSplitterRegex).map((filter) => {
		if (!filter) return [];
		const [key, value] = filter.split("(");
		return [key, value.replace(")", "")];
	}));
};
var generateFilters = (filters) => {
	if (!filters) return;
	const filterItems = Object.entries(filters).map(([key, value]) => `${key}(${value ?? ""})`);
	if (filterItems.length === 0) return;
	return `filters:${filterItems.join(":")}`;
};
var extract$4 = (url) => {
	const parsedUrl = toUrl(url);
	const matches = (parsedUrl.hostname === "img2.storyblok.com" ? storyBlokImg2 : storyBlokAssets).exec(parsedUrl.pathname);
	if (!matches || !matches.groups) return null;
	const { id, crop, width, height, filters, flipx, flipy } = matches.groups;
	const { format, ...filterMap } = splitFilters(filters ?? "");
	if (parsedUrl.hostname === "img2.storyblok.com") parsedUrl.hostname = "a.storyblok.com";
	const operations = Object.fromEntries([
		["width", Number(width) || void 0],
		["height", Number(height) || void 0],
		["format", format],
		["crop", crop],
		["filters", filterMap],
		["flipx", flipx],
		["flipy", flipy]
	].filter(([_, value]) => value !== void 0));
	return {
		src: `${parsedUrl.origin}${id}`,
		operations
	};
};
var generate$4 = (src, operations) => {
	const url = toUrl(src);
	const { width = 0, height = 0, format, crop, filters = {}, flipx = "", flipy = "" } = operations;
	const size = `${flipx}${width}x${flipy}${height}`;
	if (format) filters.format = format;
	url.pathname = [
		url.pathname,
		"m",
		crop,
		size,
		generateFilters(filters)
	].filter(Boolean).join("/");
	return toCanonicalUrlString(url);
};
var transform$4 = createExtractAndGenerate(extract$4, generate$4);
//#endregion
//#region node_modules/unpic/esm/src/providers/supabase.js
var STORAGE_URL_PREFIX = "/storage/v1/object/public/";
var RENDER_URL_PREFIX = "/storage/v1/render/image/public/";
var isRenderUrl = (url) => url.pathname.startsWith(RENDER_URL_PREFIX);
var { operationsGenerator: operationsGenerator$3, operationsParser: operationsParser$3 } = createOperationsHandlers({});
var generate$3 = (src, operations) => {
	const url = toUrl(src);
	url.pathname = url.pathname.replace(RENDER_URL_PREFIX, STORAGE_URL_PREFIX);
	if (operations.format && operations.format !== "origin") delete operations.format;
	url.search = operationsGenerator$3(operations);
	return toCanonicalUrlString(url).replace(STORAGE_URL_PREFIX, RENDER_URL_PREFIX);
};
var extract$3 = (url) => {
	const parsedUrl = toUrl(url);
	const operations = operationsParser$3(parsedUrl);
	const isRender = isRenderUrl(parsedUrl);
	const imagePath = parsedUrl.pathname.replace(RENDER_URL_PREFIX, "").replace(STORAGE_URL_PREFIX, "");
	if (!isRender) return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
	return {
		src: `${parsedUrl.origin}${STORAGE_URL_PREFIX}${imagePath}`,
		operations
	};
};
var transform$3 = createExtractAndGenerate(extract$3, generate$3);
//#endregion
//#region node_modules/unpic/esm/src/providers/uploadcare.js
var uploadcareRegex = /^https?:\/\/(?<host>[^\/]+)\/(?<uuid>[^\/]+)(?:\/(?<filename>[^\/]+)?)?/;
var { operationsGenerator: operationsGenerator$2, operationsParser: operationsParser$2 } = createOperationsHandlers({
	keyMap: {
		width: false,
		height: false
	},
	defaults: { format: "auto" },
	kvSeparator: "/",
	paramSeparator: "/-/"
});
var extract$2 = (url) => {
	const parsedUrl = toUrl(url);
	const match = uploadcareRegex.exec(parsedUrl.toString());
	if (!match || !match.groups) return null;
	const { host, uuid } = match.groups;
	const [, ...operationsString] = parsedUrl.pathname.split("/-/");
	const operations = operationsParser$2(operationsString.join("/-/") || "");
	if (operations.resize) {
		const [width, height] = operations.resize.split("x");
		if (width) operations.width = parseInt(width);
		if (height) operations.height = parseInt(height);
		delete operations.resize;
	}
	return {
		src: `https://${host}/${uuid}/`,
		operations,
		options: { host }
	};
};
var generate$2 = (src, operations, options = {}) => {
	const url = toUrl(src);
	const host = options.host || url.hostname;
	const match = uploadcareRegex.exec(url.toString());
	if (match?.groups) url.pathname = `/${match.groups.uuid}/`;
	operations.resize = operations.resize || `${operations.width ?? ""}x${operations.height ?? ""}`;
	delete operations.width;
	delete operations.height;
	const modifiers = addTrailingSlash(operationsGenerator$2(operations));
	url.hostname = host;
	url.pathname = stripTrailingSlash(url.pathname) + (modifiers ? `/-/${modifiers}` : "") + (match?.groups?.filename ?? "");
	return toCanonicalUrlString(url);
};
var transform$2 = createExtractAndGenerate(extract$2, generate$2);
//#endregion
//#region node_modules/unpic/esm/src/providers/wordpress.js
var { operationsGenerator: operationsGenerator$1, operationsParser: operationsParser$1 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h"
	},
	defaults: { crop: "1" }
});
var generate$1 = (src, operations) => {
	const url = toUrl(src);
	const { crop } = operations;
	if (typeof crop !== "undefined" && crop !== "0") operations.crop = crop ? "1" : "0";
	url.search = operationsGenerator$1(operations);
	return toCanonicalUrlString(url);
};
var extract$1 = (url) => {
	const parsedUrl = toUrl(url);
	const operations = operationsParser$1(parsedUrl);
	if (operations.crop !== void 0) operations.crop = operations.crop === "1";
	parsedUrl.search = "";
	return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
};
var transform$1 = createExtractAndGenerate(extract$1, generate$1);
//#endregion
//#region node_modules/unpic/esm/src/providers/wsrv.js
var { operationsGenerator, operationsParser } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		format: "output",
		quality: "q"
	},
	defaults: { fit: "cover" }
});
var extract = (url) => {
	const urlObj = toUrl(url);
	const srcParam = urlObj.searchParams.get("url");
	if (!srcParam) return null;
	let src = srcParam;
	if (!src.startsWith("http://") && !src.startsWith("https://")) src = "https://" + src;
	urlObj.searchParams.delete("url");
	const operations = operationsParser(urlObj);
	return {
		src,
		operations
	};
};
var generate = (src, operations) => {
	const url = new URL("https://wsrv.nl/");
	const cleanSrc = (typeof src === "string" ? src : src.toString()).replace(/^https?:\/\//, "");
	url.searchParams.set("url", cleanSrc);
	const params = operationsGenerator(operations);
	const searchParams = new URLSearchParams(params);
	for (const [key, value] of searchParams) if (key !== "url") url.searchParams.set(key, value);
	return toCanonicalUrlString(url);
};
//#endregion
//#region node_modules/unpic/esm/src/transform.js
var transformerMap = {
	appwrite: transform$27,
	astro: transform$26,
	"builder.io": transform$25,
	bunny: transform$24,
	cloudflare: transform$23,
	cloudflare_images: transform$22,
	cloudimage: transform$21,
	cloudinary: transform$20,
	contentful: transform$19,
	contentstack: transform$18,
	directus: transform$17,
	hygraph: transform$16,
	imageengine: transform$15,
	imagekit: transform$14,
	imgix: transform$13,
	ipx: transform$12,
	keycdn: transform$11,
	"kontent.ai": transform$10,
	netlify: transform$9,
	nextjs: transform$7,
	scene7: transform$6,
	shopify: transform$5,
	storyblok: transform$4,
	supabase: transform$3,
	uploadcare: transform$2,
	vercel: transform$8,
	wordpress: transform$1,
	wsrv: createExtractAndGenerate(extract, generate)
};
/**
* Returns a transformer function if the given CDN is supported
*/
function getTransformerForCdn(cdn) {
	if (!cdn) return;
	return transformerMap[cdn];
}
//#endregion
//#region node_modules/@unpic/core/dist/auto.mjs
function transformProps({ cdn, fallback, operations = {}, options, ...props }) {
	cdn ??= getProviderForUrl(props.src) || fallback;
	if (!cdn) return props;
	const transformer = getTransformerForCdn(cdn);
	if (!transformer) return props;
	return transformBaseImageProps({
		...props,
		operations: operations?.[cdn],
		options: options?.[cdn],
		transformer
	});
}
function transformSourceProps({ cdn, fallback, operations, options, ...props }) {
	cdn ??= getProviderForUrl(props.src) || fallback;
	if (!cdn) return props;
	const transformer = getTransformerForCdn(cdn);
	if (!transformer) return props;
	return transformBaseSourceProps({
		...props,
		operations: operations?.[cdn],
		options: options?.[cdn],
		transformer
	});
}
//#endregion
//#region node_modules/@unpic/react/dist/chunk-SNIEDJZS.mjs
var Image$1 = React$1.forwardRef(function Image2(props, ref) {
	return /* @__PURE__ */ jsx("img", {
		...camelizeProps(transformProps(props)),
		ref
	});
});
React$1.forwardRef(function Source2(props, ref) {
	return /* @__PURE__ */ jsx("source", {
		...camelizeProps(transformSourceProps(props)),
		ref
	});
});
//#endregion
//#region node_modules/vinext/dist/shims/image.js
/**
* next/image shim
*
* Translates Next.js Image props to @unpic/react Image component.
* @unpic/react auto-detects CDN from URL and uses native transforms.
* For local images (relative paths), routes through `/_vinext/image`
* for server-side optimization (resize, format negotiation, quality).
*
* Remote images are validated against `images.remotePatterns` and
* `images.domains` from next.config.js. Unmatched URLs are blocked
* in production and warn in development, matching Next.js behavior.
*/
/**
* Image config injected at build time via Vite define.
* Serialized as JSON — parsed once at module level.
*/
var __imageRemotePatterns = (() => {
	try {
		return JSON.parse("[]");
	} catch {
		return [];
	}
})();
var __imageDomains = (() => {
	try {
		return JSON.parse("[]");
	} catch {
		return [];
	}
})();
var __hasImageConfig = __imageRemotePatterns.length > 0 || __imageDomains.length > 0;
var __imageDeviceSizes = (() => {
	try {
		return JSON.parse("[640,750,828,1080,1200,1920,2048,3840]");
	} catch {
		return [
			640,
			750,
			828,
			1080,
			1200,
			1920,
			2048,
			3840
		];
	}
})();
/**
* Validate that a remote URL is allowed by the configured remote patterns.
* Returns true if the URL is allowed, false otherwise.
*
* When no remotePatterns/domains are configured, all remote URLs are allowed
* (backwards-compatible — user hasn't opted into restriction).
*
* When patterns ARE configured, only matching URLs are allowed.
* In development, non-matching URLs produce a console warning.
* In production, non-matching URLs are blocked (src replaced with empty string).
*/
function validateRemoteUrl(src) {
	if (!__hasImageConfig) return { allowed: true };
	let url;
	try {
		url = new URL(src, "http://n");
	} catch {
		return {
			allowed: false,
			reason: `Invalid URL: ${src}`
		};
	}
	if (hasRemoteMatch(__imageDomains, __imageRemotePatterns, url)) return { allowed: true };
	return {
		allowed: false,
		reason: `Image URL "${src}" is not configured in images.remotePatterns or images.domains in next.config.js. See: https://nextjs.org/docs/messages/next-image-unconfigured-host`
	};
}
/**
* Sanitize a blurDataURL to prevent CSS injection.
*
* A crafted data URL containing `)` can break out of the `url()` CSS function,
* allowing injection of arbitrary CSS properties or rules. Characters like `{`,
* `}`, and `\` can also assist in crafting injection payloads.
*
* This validates the URL starts with `data:image/` and rejects characters that
* could escape the `url()` context. Semicolons are allowed since they're part
* of valid data URLs (`data:image/png;base64,...`) and harmless inside `url()`.
*
* Returns undefined for invalid URLs, which causes the blur placeholder to be
* skipped gracefully.
*/
function sanitizeBlurDataURL(url) {
	if (!url.startsWith("data:image/")) return void 0;
	if (/[)(}{\\'"\n\r]/.test(url)) return void 0;
	return url;
}
/**
* Determine if a src is a remote URL (CDN-optimizable) or local.
*/
function isRemoteUrl(src) {
	return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//");
}
/**
* Resolve src, width, height, blurDataURL from Image props (string or StaticImageData).
* Shared by the Image component and getImageProps to keep behavior in sync.
*/
function resolveImageSource(v) {
	return {
		src: typeof v.src === "string" ? v.src : v.src.src,
		width: v.width ?? (typeof v.src === "object" ? v.src.width : void 0),
		height: v.height ?? (typeof v.src === "object" ? v.src.height : void 0),
		blurDataURL: v.blurDataURL ?? (typeof v.src === "object" ? v.src.blurDataURL : void 0)
	};
}
/**
* Responsive image widths matching Next.js's device sizes config.
* These are the breakpoints used for srcSet generation.
* Configurable via `images.deviceSizes` in next.config.js.
*/
var RESPONSIVE_WIDTHS = __imageDeviceSizes;
/**
* Build a `/_vinext/image` optimization URL.
*
* In production (Cloudflare Workers), the worker intercepts this path and uses
* the Images binding to resize/transcode on the fly. In dev, the Vite dev
* server handles it as a passthrough (serves the original file).
*/
function imageOptimizationUrl(src, width, quality = 75) {
	return `/_vinext/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
/**
* Generate a srcSet string for responsive images.
*
* Each width points to the `/_vinext/image` optimization endpoint so the
* server can resize and transcode the image. Only includes widths that are
* <= 2x the original image width to avoid pointless upscaling.
*/
function generateSrcSet(src, originalWidth, quality = 75) {
	const widths = RESPONSIVE_WIDTHS.filter((w) => w <= originalWidth * 2);
	if (widths.length === 0) return `${imageOptimizationUrl(src, originalWidth, quality)} ${originalWidth}w`;
	return widths.map((w) => `${imageOptimizationUrl(src, w, quality)} ${w}w`).join(", ");
}
var Image = forwardRef(function Image({ src: srcProp, alt, width, height, fill, priority, quality, placeholder, blurDataURL, loader, sizes, className, style, onLoad, onLoadingComplete, unoptimized: _unoptimized, overrideSrc: _overrideSrc, loading, ...rest }, ref) {
	const handleLoad = onLoadingComplete ? (e) => {
		onLoad?.(e);
		onLoadingComplete(e.currentTarget);
	} : onLoad;
	const { src, width: imgWidth, height: imgHeight, blurDataURL: imgBlurDataURL } = resolveImageSource({
		src: srcProp,
		width,
		height,
		blurDataURL
	});
	if (loader) return /* @__PURE__ */ jsx("img", {
		ref,
		src: loader({
			src,
			width: imgWidth ?? 0,
			quality: quality ?? 75
		}),
		alt,
		width: fill ? void 0 : imgWidth,
		height: fill ? void 0 : imgHeight,
		loading: priority ? "eager" : loading ?? "lazy",
		decoding: "async",
		sizes,
		className,
		onLoad: handleLoad,
		style: fill ? {
			position: "absolute",
			inset: 0,
			width: "100%",
			height: "100%",
			objectFit: "cover",
			...style
		} : style,
		...rest
	});
	if (isRemoteUrl(src)) {
		const validation = validateRemoteUrl(src);
		if (!validation.allowed) {
			console.error(`[next/image] ${validation.reason}`);
			return null;
		}
		const sanitizedBlur = imgBlurDataURL ? sanitizeBlurDataURL(imgBlurDataURL) : void 0;
		const bg = placeholder === "blur" && sanitizedBlur ? `url(${sanitizedBlur})` : void 0;
		if (fill) return /* @__PURE__ */ jsx(Image$1, {
			src,
			alt,
			layout: "fullWidth",
			loading: priority ? "eager" : loading ?? "lazy",
			fetchPriority: priority ? "high" : void 0,
			sizes,
			className,
			background: bg,
			onLoad: handleLoad
		});
		if (imgWidth && imgHeight) return /* @__PURE__ */ jsx(Image$1, {
			src,
			alt,
			width: imgWidth,
			height: imgHeight,
			layout: "constrained",
			loading: priority ? "eager" : loading ?? "lazy",
			fetchPriority: priority ? "high" : void 0,
			sizes,
			className,
			background: bg,
			onLoad: handleLoad
		});
	}
	const imgQuality = quality ?? 75;
	const isSvg = src.endsWith(".svg");
	const skipOptimization = _unoptimized === true || isSvg && true;
	const srcSet = imgWidth && !fill && !skipOptimization ? generateSrcSet(src, imgWidth, imgQuality) : imgWidth && !fill ? RESPONSIVE_WIDTHS.filter((w) => w <= imgWidth * 2).map((w) => `${src} ${w}w`).join(", ") || `${src} ${imgWidth}w` : void 0;
	const optimizedSrc = skipOptimization ? src : imgWidth ? imageOptimizationUrl(src, imgWidth, imgQuality) : imageOptimizationUrl(src, RESPONSIVE_WIDTHS[0], imgQuality);
	const sanitizedLocalBlur = imgBlurDataURL ? sanitizeBlurDataURL(imgBlurDataURL) : void 0;
	const blurStyle = placeholder === "blur" && sanitizedLocalBlur ? {
		backgroundImage: `url(${sanitizedLocalBlur})`,
		backgroundSize: "cover",
		backgroundRepeat: "no-repeat",
		backgroundPosition: "center"
	} : void 0;
	return /* @__PURE__ */ jsx("img", {
		ref,
		src: optimizedSrc,
		alt,
		width: fill ? void 0 : imgWidth,
		height: fill ? void 0 : imgHeight,
		loading: priority ? "eager" : loading ?? "lazy",
		fetchPriority: priority ? "high" : void 0,
		decoding: "async",
		srcSet,
		sizes: sizes ?? (fill ? "100vw" : void 0),
		className,
		"data-nimg": fill ? "fill" : "1",
		onLoad: handleLoad,
		style: fill ? {
			position: "absolute",
			inset: 0,
			width: "100%",
			height: "100%",
			objectFit: "cover",
			...blurStyle,
			...style
		} : {
			...blurStyle,
			...style
		},
		...rest
	});
});
//#endregion
//#region src/app/checkout/page.tsx
function CheckoutPage() {
	const { items, subtotal, totalItems, clearCart, isLoading } = useCart();
	const { status } = useSession();
	const router = useRouter();
	const [paymentMethod, setPaymentMethod] = useState("pix");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [location, setLocation] = useState("Buscando endereço...");
	const [isSuccess, setIsSuccess] = useState(false);
	useEffect(() => {
		if (!isLoading && items.length === 0 && !isSuccess) router.push("/");
		const savedLocation = localStorage.getItem("last_selected_location");
		if (savedLocation) setLocation(savedLocation);
		else setLocation("Endereço não selecionado");
	}, [
		items,
		router,
		isLoading,
		isSuccess
	]);
	const handleConfirmOrder = async () => {
		if (items.length === 0) return;
		setIsSubmitting(true);
		try {
			const payload = {
				seller_id: items[0].seller_id,
				total_amount: subtotal + 5,
				delivery_address: location,
				items: items.map((it) => ({
					product_id: it.product_id,
					quantity: it.quantity,
					price: it.price
				}))
			};
			await apiFetch("/api/v1/orders", {
				method: "POST",
				body: JSON.stringify(payload)
			});
			setIsSuccess(true);
			await clearCart();
			setTimeout(() => {
				router.push("/orders");
			}, 3e3);
		} catch (e) {
			console.error("Erro ao fechar pedido:", e);
			alert("Erro ao processar o seu pedido. Por favor, tente novamente.");
		} finally {
			setIsSubmitting(false);
		}
	};
	if (isSuccess) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-ze-yellow flex items-center justify-center p-6",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md w-full bg-white rounded-[3rem] p-10 text-center space-y-8 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] border-4 border-ze-black animate-in fade-in zoom-in duration-500",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg",
					children: /* @__PURE__ */ jsx(Check, { className: "w-12 h-12 text-white stroke-[4px]" })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "text-4xl font-black uppercase italic tracking-tighter text-ze-black",
						children: "Pedido Sucesso!"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-ze-black/60 font-bold uppercase text-xs tracking-widest",
						children: "Já estamos preparando sua gelada"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "bg-ze-gray p-6 rounded-2xl border-2 border-dashed border-ze-black/10",
					children: /* @__PURE__ */ jsx("p", {
						className: "text-sm font-bold text-ze-black/80",
						children: "Você será redirecionado para seus pedidos em instantes..."
					})
				}),
				/* @__PURE__ */ jsx(Button, {
					variant: "ze-dark",
					className: "w-full h-14 rounded-2xl",
					asChild: true,
					children: /* @__PURE__ */ jsx(Link, {
						href: "/orders",
						children: "Ver meus pedidos"
					})
				})
			]
		})
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-ze-gray pb-20",
		children: [/* @__PURE__ */ jsx("div", {
			className: "bg-ze-yellow border-b-4 border-ze-black sticky top-0 z-50",
			children: /* @__PURE__ */ jsxs("div", {
				className: "container mx-auto px-4 h-16 flex items-center justify-between",
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: () => router.back(),
						className: "p-2 hover:bg-ze-black/5 rounded-xl transition-colors",
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-6 h-6 text-ze-black" })
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "text-xl font-black uppercase italic tracking-tighter text-ze-black",
						children: "Pagamento"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "min-w-[72px] h-10 px-3 bg-ze-red text-white rounded-full flex items-center justify-center font-black text-xs border-2 border-white shadow-lg uppercase tracking-wider",
						children: [totalItems, " itens"]
					})
				]
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "lg:col-span-8 space-y-6",
				children: [
					/* @__PURE__ */ jsxs("section", {
						className: "bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-ze-black/5",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-4 mb-6",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 bg-ze-yellow rounded-xl flex items-center justify-center",
								children: /* @__PURE__ */ jsx(MapPin, { className: "w-6 h-6 text-ze-black" })
							}), /* @__PURE__ */ jsx("h2", {
								className: "text-xl font-black uppercase tracking-tighter text-ze-black",
								children: "Endereço de Entrega"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "bg-ze-gray p-6 rounded-2xl border-2 border-ze-black/5 flex items-center justify-between group hover:border-ze-yellow transition-all cursor-pointer",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-sm font-black text-ze-black mb-1",
									children: location
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2 text-[10px] font-bold text-ze-black/40 uppercase tracking-widest",
									children: [/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "Entrega em 15-25 min" })]
								})]
							}), /* @__PURE__ */ jsx(Badge, {
								variant: "outline",
								className: "text-[10px] font-black border-ze-black/10",
								children: "Alterar"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-ze-black/5",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-4 mb-6",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 bg-ze-red rounded-xl flex items-center justify-center",
								children: /* @__PURE__ */ jsx(CreditCard, { className: "w-6 h-6 text-white" })
							}), /* @__PURE__ */ jsx("h2", {
								className: "text-xl font-black uppercase tracking-tighter text-ze-black",
								children: "Método de Pagamento"
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-1 md:grid-cols-3 gap-4",
							children: [
								{
									id: "pix",
									icon: Smartphone,
									label: "PIX",
									sub: "Confirmação rápida"
								},
								{
									id: "card",
									icon: CreditCard,
									label: "Cartão na Entrega",
									sub: "Débito ou Crédito"
								},
								{
									id: "cash",
									icon: Banknote,
									label: "Dinheiro",
									sub: "No ato da entrega"
								}
							].map((method) => /* @__PURE__ */ jsxs("button", {
								onClick: () => setPaymentMethod(method.id),
								className: `flex flex-col items-center gap-4 p-6 rounded-2xl border-4 transition-all ${paymentMethod === method.id ? "bg-ze-yellow/5 border-ze-yellow shadow-xl -translate-y-1" : "bg-ze-gray border-transparent hover:border-ze-black/5"}`,
								children: [/* @__PURE__ */ jsx("div", {
									className: `w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === method.id ? "bg-ze-yellow text-ze-black" : "bg-white text-ze-black/40"}`,
									children: /* @__PURE__ */ jsx(method.icon, { className: "w-6 h-6" })
								}), /* @__PURE__ */ jsxs("div", {
									className: "text-center",
									children: [/* @__PURE__ */ jsx("p", {
										className: "text-sm font-black text-ze-black uppercase tracking-tighter",
										children: method.label
									}), /* @__PURE__ */ jsx("p", {
										className: "text-[10px] font-bold text-ze-black/40 uppercase tracking-widest leading-none mt-1",
										children: method.sub
									})]
								})]
							}, method.id))
						})]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-ze-black/5",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-xl font-black uppercase tracking-tighter text-ze-black mb-6",
							children: "Resumo do Pedido"
						}), /* @__PURE__ */ jsx("div", {
							className: "divide-y-2 divide-ze-black/5",
							children: items.map((it) => /* @__PURE__ */ jsxs("div", {
								className: "py-4 flex items-center gap-4",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "w-16 h-16 bg-ze-gray rounded-2xl relative shrink-0 overflow-hidden border-2 border-ze-black/5",
										children: it.image && /* @__PURE__ */ jsx(Image, {
											src: it.image,
											alt: it.name,
											fill: true,
											className: "object-cover"
										})
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex-1",
										children: [/* @__PURE__ */ jsx("p", {
											className: "text-sm font-black text-ze-black uppercase leading-tight",
											children: it.name
										}), /* @__PURE__ */ jsxs("p", {
											className: "text-xs font-bold text-ze-black/40 uppercase tracking-widest inline-block mt-1",
											children: ["Qtde: ", it.quantity]
										})]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "text-right",
										children: /* @__PURE__ */ jsxs("p", {
											className: "text-sm font-black text-ze-black",
											children: ["R$ ", (it.price * it.quantity).toFixed(2).replace(".", ",")]
										})
									})
								]
							}, it.product_id))
						})]
					})
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "lg:col-span-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "sticky top-24 space-y-6",
					children: [/* @__PURE__ */ jsx(Card, {
						className: "rounded-3xl border-4 border-ze-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden",
						children: /* @__PURE__ */ jsxs(CardContent, {
							className: "p-8",
							children: [
								/* @__PURE__ */ jsx("h3", {
									className: "text-xl font-black uppercase tracking-tighter text-ze-black mb-6",
									children: "Total Geral"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-4 mb-8",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex justify-between text-sm font-bold text-ze-black/60 uppercase tracking-widest",
											children: [/* @__PURE__ */ jsx("span", { children: "Subtotal" }), /* @__PURE__ */ jsxs("span", { children: ["R$ ", subtotal.toFixed(2).replace(".", ",")] })]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex justify-between text-sm font-bold text-ze-black/60 uppercase tracking-widest",
											children: [/* @__PURE__ */ jsx("span", { children: "Taxa de Entrega" }), /* @__PURE__ */ jsx("span", {
												className: "text-green-600 font-black",
												children: "R$ 5,00"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "pt-4 border-t-2 border-ze-black/5 flex justify-between items-end",
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-sm font-black uppercase tracking-tighter text-ze-black",
												children: "Valor Total"
											}), /* @__PURE__ */ jsxs("span", {
												className: "text-3xl font-black text-ze-black",
												children: ["R$ ", (subtotal + 5).toFixed(2).replace(".", ",")]
											})]
										})
									]
								}),
								/* @__PURE__ */ jsx(Button, {
									onClick: handleConfirmOrder,
									disabled: isSubmitting,
									className: "w-full h-16 rounded-2xl bg-ze-black text-white hover:bg-ze-yellow hover:text-ze-black font-black uppercase tracking-widest text-base shadow-xl transform active:scale-95 transition-all disabled:opacity-50",
									children: isSubmitting ? /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" }), "Processando..."]
									}) : "Finalizar Pedido"
								}),
								/* @__PURE__ */ jsx("div", {
									className: "mt-6 flex flex-col items-center gap-2",
									children: /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2 text-green-600 font-bold uppercase text-[10px] tracking-widest",
										children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Pagamento 100% Seguro" })]
									})
								})
							]
						})
					}), /* @__PURE__ */ jsx("div", {
						className: "bg-ze-black text-white p-6 rounded-3xl border-4 border-white shadow-xl",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex gap-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "shrink-0 w-10 h-10 bg-ze-yellow rounded-xl flex items-center justify-center text-ze-black",
								children: /* @__PURE__ */ jsx(Clock, { className: "w-6 h-6" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-black uppercase tracking-tight",
								children: "Tempo Estimado"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xl font-black italic uppercase leading-none mt-1",
								children: "15-25 MINUTOS"
							})] })]
						})
					})]
				})
			})]
		})]
	});
}
var PackageCheck = createLucideIcon("PackageCheck", [
	["path", {
		d: "m16 16 2 2 4-4",
		key: "gfu2re"
	}],
	["path", {
		d: "M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14",
		key: "e7tb2h"
	}],
	["path", {
		d: "m7.5 4.27 9 5.15",
		key: "1c824w"
	}],
	["polyline", {
		points: "3.29 7 12 12 20.71 7",
		key: "ousv84"
	}],
	["line", {
		x1: "12",
		x2: "12",
		y1: "22",
		y2: "12",
		key: "a4e8g8"
	}]
]);
//#endregion
//#region src/app/entregador/dashboard/page.tsx
function DriverDashboard() {
	const [orders, setOrders] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const { showToast } = useToast();
	const fetchOrders = async () => {
		try {
			setOrders(await apiFetch("/api/v1/entregador/orders"));
		} catch (error) {
			console.error("Erro ao carregar entregas", error);
		} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		fetchOrders();
		const interval = setInterval(fetchOrders, 5e3);
		return () => clearInterval(interval);
	}, []);
	const handleAccept = async (id) => {
		try {
			await apiFetch(`/api/v1/entregador/orders/${id}/accept`, { method: "POST" });
			showToast("Entrega aceita!", "success");
			fetchOrders();
		} catch (error) {
			showToast("Erro ao aceitar entrega", "error");
		}
	};
	const handleDeliver = async (id) => {
		try {
			await apiFetch(`/api/v1/entregador/orders/${id}/deliver`, { method: "POST" });
			showToast("Entrega concluída com sucesso!", "success");
			fetchOrders();
		} catch (error) {
			showToast("Erro ao concluir entrega", "error");
		}
	};
	const parseAddress = (jsonStr) => {
		try {
			return JSON.parse(jsonStr).raw || "Endereço não disponível";
		} catch (e) {
			return "Endereço padrão";
		}
	};
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Portal do Entregador",
		role: "entregador",
		children: /* @__PURE__ */ jsxs("div", {
			className: "space-y-8",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col md:flex-row gap-6",
				children: [/* @__PURE__ */ jsx(Card, {
					className: "flex-1 border-0 shadow-lg bg-white rounded-[2.5rem] overflow-hidden",
					children: /* @__PURE__ */ jsxs(CardContent, {
						className: "p-8 flex items-center justify-between",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-6",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-20 h-20 rounded-3xl bg-brand-teal/10 flex items-center justify-center",
								children: /* @__PURE__ */ jsx(Truck, { className: "w-10 h-10 text-brand-teal" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
								className: "text-3xl font-black text-slate-800 leading-none mb-1",
								children: "Ficar Offline"
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-sm font-medium text-emerald-500 flex items-center gap-1",
								children: [/* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }), "Você está online e operando"]
							})] })]
						}), /* @__PURE__ */ jsx(Button, {
							className: "rounded-3xl h-16 px-12 bg-slate-900 text-white hover:bg-slate-800 font-bold border-0 text-lg",
							children: "Pausar"
						})]
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 gap-4 w-full md:w-[400px]",
					children: [/* @__PURE__ */ jsx(Card, {
						className: "border-0 shadow-sm bg-white rounded-[2rem] p-4",
						children: /* @__PURE__ */ jsxs("div", {
							className: "p-4",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1",
									children: "Ganhos Hoje"
								}),
								/* @__PURE__ */ jsx("div", {
									className: "text-2xl font-black text-slate-800",
									children: "R$ 145,20"
								}),
								/* @__PURE__ */ jsx("div", {
									className: "text-[10px] font-bold text-emerald-500 mt-1",
									children: "+15% que ontem"
								})
							]
						})
					}), /* @__PURE__ */ jsx(Card, {
						className: "border-0 shadow-sm bg-white rounded-[2rem] p-4",
						children: /* @__PURE__ */ jsxs("div", {
							className: "p-4",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1",
									children: "Avaliação"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "text-2xl font-black text-slate-800 flex items-baseline gap-1",
									children: ["4.9 ", /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 text-amber-400 fill-amber-400 inline" })]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "text-[10px] font-bold text-slate-400 mt-1",
									children: "Ótimo status"
								})
							]
						})
					})]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-8",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between px-2",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-black text-2xl text-slate-800",
							children: "Entregas Disponíveis"
						}), /* @__PURE__ */ jsx(Badge, {
							className: "bg-brand-coral/10 text-brand-coral border-0 py-1.5 px-4 rounded-full font-bold",
							children: "Ao Vivo"
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "space-y-4",
						children: isLoading ? /* @__PURE__ */ jsx("div", { className: "h-40 bg-slate-100 animate-pulse rounded-[3rem]" }) : orders.length === 0 ? /* @__PURE__ */ jsx(Card, {
							className: "border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50 p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs",
							children: "Nenhuma entrega disponível no momento"
						}) : orders.map((order) => /* @__PURE__ */ jsx(Card, {
							className: "border-0 shadow-xl bg-white rounded-[3rem] p-2 hover:translate-y-[-4px] transition-all",
							children: /* @__PURE__ */ jsxs(CardContent, {
								className: "p-8",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-start justify-between mb-8",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-4",
											children: [/* @__PURE__ */ jsx("div", {
												className: "w-14 h-14 rounded-2xl bg-brand-sky/10 flex items-center justify-center text-brand-sky",
												children: /* @__PURE__ */ jsx(ShoppingBag, { className: "w-6 h-6" })
											}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
												className: "text-sm font-bold text-slate-400 uppercase tracking-tight",
												children: "Retirada em:"
											}), /* @__PURE__ */ jsx("div", {
												className: "text-xl font-black text-slate-800",
												children: "Depósito Parceiro"
											})] })]
										}), /* @__PURE__ */ jsxs("div", {
											className: "text-right",
											children: [/* @__PURE__ */ jsx("div", {
												className: "text-2xl font-black text-brand-teal",
												children: "R$ 5,00"
											}), /* @__PURE__ */ jsx("div", {
												className: "text-[10px] font-bold text-slate-400 uppercase",
												children: "Taxa"
											})]
										})]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "space-y-4 mb-8",
										children: /* @__PURE__ */ jsxs("div", {
											className: "flex gap-4 items-center",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex flex-col items-center",
												children: [
													/* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-brand-sky" }),
													/* @__PURE__ */ jsx("div", { className: "w-0.5 h-10 bg-slate-100" }),
													/* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-brand-coral" })
												]
											}), /* @__PURE__ */ jsxs("div", {
												className: "flex flex-col gap-6",
												children: [/* @__PURE__ */ jsx("div", {
													className: "text-sm font-medium text-slate-500 pr-4 truncate max-w-[300px]",
													children: "Retirada na Loja"
												}), /* @__PURE__ */ jsx("div", {
													className: "text-sm font-bold text-slate-800 pr-4 truncate max-w-[300px]",
													children: parseAddress(order.delivery_address_json)
												})]
											})]
										})
									}),
									/* @__PURE__ */ jsx("div", {
										className: "grid grid-cols-1 gap-4",
										children: order.status === "ready" ? /* @__PURE__ */ jsx(Button, {
											onClick: () => handleAccept(order.id),
											className: "h-16 rounded-[1.5rem] bg-brand-teal text-white font-black uppercase tracking-widest hover:bg-brand-teal/90 shadow-lg shadow-brand-teal/20",
											children: "Aceitar Entrega"
										}) : order.status === "accepted" ? /* @__PURE__ */ jsxs(Button, {
											onClick: () => handleDeliver(order.id),
											className: "h-16 rounded-[1.5rem] bg-emerald-500 text-white font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-200 flex gap-2 justify-center items-center",
											children: [/* @__PURE__ */ jsx(PackageCheck, { className: "w-6 h-6" }), " Marcar como Entregue"]
										}) : /* @__PURE__ */ jsx(Badge, {
											className: "h-16 rounded-[1.5rem] bg-slate-100 text-slate-400 font-black uppercase tracking-widest flex items-center justify-center border-0",
											children: order.status
										})
									})
								]
							})
						}, order.id))
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ jsx("h3", {
						className: "font-black text-2xl text-slate-800 px-2",
						children: "Suas métricas"
					}), /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-4",
						children: [
							{
								label: "Tempo médio de entrega",
								value: "24 min",
								icon: /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5" }),
								color: "sky"
							},
							{
								label: "Distância percorrida",
								value: "482 km",
								icon: /* @__PURE__ */ jsx(MapPin, { className: "w-5 h-5" }),
								color: "amber"
							},
							{
								label: "Entregas concluídas",
								value: "1,248",
								icon: /* @__PURE__ */ jsx(Truck, { className: "w-5 h-5" }),
								color: "teal"
							}
						].map((m, i) => /* @__PURE__ */ jsxs("div", {
							className: "bg-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between border border-slate-50 group hover:border-brand-sky/20 transition-all",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ jsx("div", {
									className: `w-12 h-12 rounded-2xl bg-brand-${m.color}/10 text-brand-${m.color} flex items-center justify-center group-hover:scale-110 transition-transform`,
									children: m.icon
								}), /* @__PURE__ */ jsx("span", {
									className: "font-bold text-slate-600",
									children: m.label
								})]
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xl font-black text-slate-800",
								children: m.value
							})]
						}, i))
					})]
				})]
			})]
		})
	});
}
//#endregion
//#region src/app/entregador/profile/page.tsx
function DriverProfilePage() {
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Perfil do Entregador",
		role: "entregador",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-4xl mx-auto",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-8",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-xs font-black uppercase tracking-[0.25em] text-ze-red",
						children: "Minha Conta"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-2 text-4xl font-black uppercase tracking-tighter text-ze-black italic",
						children: "Meu Perfil"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-3 text-sm font-bold text-ze-black/60 max-w-xl",
						children: "Dados de contato e informações do veículo. Mantenha tudo atualizado para receber as melhores rotas."
					})
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "bg-white rounded-[2.5rem] border-2 border-ze-black/5 p-6 md:p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.02)]",
				children: /* @__PURE__ */ jsx(ProfileForm, { role: "entregador" })
			})]
		})
	});
}
var Navigation = createLucideIcon("Navigation", [["polygon", {
	points: "3 11 22 2 13 21 11 13 3 11",
	key: "1ltx0t"
}]]);
var CircleCheck = createLucideIcon("CircleCheck", [["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}], ["path", {
	d: "m9 12 2 2 4-4",
	key: "dzmm74"
}]]);
var ExternalLink = createLucideIcon("ExternalLink", [
	["path", {
		d: "M15 3h6v6",
		key: "1q9fwt"
	}],
	["path", {
		d: "M10 14 21 3",
		key: "gplh6r"
	}],
	["path", {
		d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
		key: "a6xqqp"
	}]
]);
//#endregion
//#region src/app/entregador/queue/page.tsx
function DriverQueue() {
	const [deliveries, setDeliveries] = useState([]);
	const [loading, setLoading] = useState(true);
	const fetchDeliveries = async () => {
		try {
			setDeliveries(await apiFetch("/api/v1/entregador/orders"));
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchDeliveries();
		const interval = setInterval(fetchDeliveries, 3e3);
		return () => clearInterval(interval);
	}, []);
	const handleAction = async (id, action) => {
		try {
			await apiFetch(action === "accept" ? `/api/v1/entregador/orders/${id}/accept` : action === "pickup" ? `/api/v1/entregador/orders/${id}/pickup` : `/api/v1/entregador/orders/${id}/deliver`, { method: "POST" });
			fetchDeliveries();
		} catch (e) {
			console.error(e);
		}
	};
	const parseAddress = (jsonStr) => {
		try {
			return JSON.parse(jsonStr).raw || "Endereço não disponível";
		} catch (e) {
			return "Localização Manual";
		}
	};
	const available = deliveries.filter((d) => d.status === "ready" && !d.driver_id);
	const active = deliveries.filter((d) => d.status === "accepted" || d.status === "picked_up");
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Logística de Entrega",
		role: "entregador",
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-2 gap-10",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ jsxs("h2", {
						className: "text-2xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Navigation, { className: "w-6 h-6 text-ze-red animate-pulse" }), " Chamadas Próximas"]
					}), /* @__PURE__ */ jsx(Badge, {
						className: "bg-ze-yellow text-ze-black font-black rounded-lg",
						children: available.length
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-6",
					children: [available.map((delivery) => /* @__PURE__ */ jsxs("div", {
						className: "bg-white rounded-[2.5rem] border-4 border-ze-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] transition-all group relative overflow-hidden",
						children: [/* @__PURE__ */ jsx("div", {
							className: "absolute top-0 right-0 bg-ze-red text-white font-black text-[10px] px-6 py-2 uppercase italic tracking-widest rounded-bl-3xl",
							children: "Urgente"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row gap-6",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex-1 space-y-6",
								children: /* @__PURE__ */ jsxs("div", {
									className: "space-y-6 relative before:absolute before:left-2.5 before:top-6 before:bottom-6 before:w-[2px] before:bg-ze-black/10",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex gap-4 relative",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-5 h-5 rounded-full bg-ze-yellow border-2 border-ze-black flex items-center justify-center shrink-0 z-10",
											children: /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-ze-black" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
											className: "text-[10px] font-bold text-ze-black/40 uppercase tracking-widest",
											children: "Coleta"
										}), /* @__PURE__ */ jsx("p", {
											className: "font-black text-ze-black uppercase tracking-tight",
											children: delivery.edges?.seller?.name || "Depósito"
										})] })]
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex gap-4 relative",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-5 h-5 rounded-full bg-white border-2 border-ze-red flex items-center justify-center shrink-0 z-10",
											children: /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-ze-red" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
											className: "text-[10px] font-bold text-ze-black/40 uppercase tracking-widest",
											children: "Entrega"
										}), /* @__PURE__ */ jsx("p", {
											className: "font-black text-ze-black uppercase tracking-tight truncate max-w-[200px]",
											children: parseAddress(delivery.delivery_address_json)
										})] })]
									})]
								})
							}), /* @__PURE__ */ jsxs("div", {
								className: "w-full md:w-52 bg-ze-gray rounded-[2rem] p-5 flex flex-col justify-between border-2 border-ze-black/5",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
									className: "text-[10px] font-black uppercase text-ze-black/40 mb-1",
									children: "Taxa de Entrega"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-3xl font-black text-ze-red",
									children: "R$ 5,00"
								})] }), /* @__PURE__ */ jsx(Button, {
									onClick: () => handleAction(delivery.id, "accept"),
									className: "w-full mt-4 h-12 bg-ze-yellow hover:bg-ze-black text-ze-black hover:text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transform active:scale-95 transition-all",
									children: "Aceitar Corrida"
								})]
							})]
						})]
					}, delivery.id)), available.length === 0 && /* @__PURE__ */ jsx("div", {
						className: "bg-ze-gray text-center p-20 rounded-[3rem] border-4 border-dashed border-ze-black/5",
						children: /* @__PURE__ */ jsx("p", {
							className: "font-black text-ze-black/20 uppercase tracking-widest italic",
							children: "Aguardando novas chamadas..."
						})
					})]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-black text-ze-black uppercase italic tracking-tighter",
						children: "Minha Rota Atual"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs font-bold uppercase text-ze-black/40 tracking-widest",
						children: "Entregas que você está realizando agora"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-6",
					children: [active.map((delivery) => /* @__PURE__ */ jsxs("div", {
						className: "bg-ze-yellow rounded-[2.5rem] border-4 border-ze-black p-8 shadow-[12px_12px_0px_#1B1B1B] relative overflow-hidden",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "bg-white p-6 rounded-[2rem] border-2 border-ze-black mb-6 space-y-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between border-b-2 border-ze-black/5 pb-4",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "font-black text-2xl text-ze-black uppercase italic tracking-tighter",
									children: ["#", delivery.id.split("-")[0]]
								}), /* @__PURE__ */ jsx(Badge, {
									className: "bg-ze-black text-white font-black uppercase text-[10px]",
									children: delivery.status === "accepted" ? "Indo Coletar" : "Indo Entregar"
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "space-y-4 pt-2",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-4",
									children: [
										/* @__PURE__ */ jsx("div", {
											className: "w-10 h-10 bg-ze-gray rounded-xl flex items-center justify-center shrink-0 border border-ze-black/5",
											children: /* @__PURE__ */ jsx(Store, { className: "w-5 h-5 text-ze-black" })
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex-1",
											children: [/* @__PURE__ */ jsx("p", {
												className: "text-[10px] font-bold text-ze-black/40 uppercase tracking-widest",
												children: "Coletar em"
											}), /* @__PURE__ */ jsx("p", {
												className: "font-black text-ze-black uppercase leading-tight",
												children: delivery.edges?.seller?.name || "Lojista"
											})]
										}),
										/* @__PURE__ */ jsx("button", {
											className: "p-2 bg-ze-yellow rounded-lg border border-ze-black/10",
											children: /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" })
										})
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-4",
									children: [
										/* @__PURE__ */ jsx("div", {
											className: "w-10 h-10 bg-ze-gray rounded-xl flex items-center justify-center shrink-0 border border-ze-black/5",
											children: /* @__PURE__ */ jsx(User, { className: "w-5 h-5 text-ze-red" })
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex-1",
											children: [/* @__PURE__ */ jsx("p", {
												className: "text-[10px] font-bold text-ze-black/40 uppercase tracking-widest",
												children: "Entregar para"
											}), /* @__PURE__ */ jsx("p", {
												className: "font-black text-ze-black uppercase leading-tight truncate",
												children: parseAddress(delivery.delivery_address_json)
											})]
										}),
										/* @__PURE__ */ jsx("button", {
											className: "p-2 bg-ze-yellow rounded-lg border border-ze-black/10",
											children: /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" })
										})
									]
								})]
							})]
						}), delivery.status === "accepted" ? /* @__PURE__ */ jsxs(Button, {
							onClick: () => handleAction(delivery.id, "pickup"),
							className: "w-full h-16 bg-ze-black hover:bg-ze-dark text-white rounded-2xl text-lg font-black uppercase italic tracking-tighter shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-3",
							children: [/* @__PURE__ */ jsx(Package, { className: "w-6 h-6" }), " Confirmar Coleta"]
						}) : /* @__PURE__ */ jsxs(Button, {
							onClick: () => handleAction(delivery.id, "deliver"),
							className: "w-full h-16 bg-ze-red hover:bg-ze-red/90 text-white rounded-2xl text-lg font-black uppercase italic tracking-tighter shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-3",
							children: [/* @__PURE__ */ jsx(CircleCheck, { className: "w-6 h-6" }), " Confirmar Entrega"]
						})]
					}, delivery.id)), active.length === 0 && /* @__PURE__ */ jsx("div", {
						className: "opacity-40",
						children: /* @__PURE__ */ jsxs("div", {
							className: "bg-white text-center p-20 rounded-[3rem] border-4 border-dashed border-ze-black shadow-sm",
							children: [/* @__PURE__ */ jsx("div", {
								className: "text-5xl grayscale mb-4",
								children: "🏍️"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-black text-ze-black/30 uppercase tracking-widest italic",
								children: "Nenhuma rota ativa no momento"
							})]
						})
					})]
				})]
			})]
		})
	});
}
var Briefcase = createLucideIcon("Briefcase", [["path", {
	d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
	key: "jecpp"
}], ["rect", {
	width: "20",
	height: "14",
	x: "2",
	y: "6",
	rx: "2",
	key: "i6l2r4"
}]]);
var Newspaper = createLucideIcon("Newspaper", [
	["path", {
		d: "M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2",
		key: "7pis2x"
	}],
	["path", {
		d: "M18 14h-8",
		key: "sponae"
	}],
	["path", {
		d: "M15 18h-5",
		key: "95g1m2"
	}],
	["path", {
		d: "M10 6h8v4h-8V6Z",
		key: "smlsk5"
	}]
]);
var Handshake = createLucideIcon("Handshake", [
	["path", {
		d: "m11 17 2 2a1 1 0 1 0 3-3",
		key: "efffak"
	}],
	["path", {
		d: "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4",
		key: "9pr0kb"
	}],
	["path", {
		d: "m21 3 1 11h-2",
		key: "1tisrp"
	}],
	["path", {
		d: "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3",
		key: "1uvwmv"
	}],
	["path", {
		d: "M3 4h8",
		key: "1ep09j"
	}]
]);
var Target = createLucideIcon("Target", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "6",
		key: "1vlfrh"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "2",
		key: "1c9p78"
	}]
]);
//#endregion
//#region src/app/institucional/[slug]/page.tsx
function InstitutionalPage() {
	const { slug } = useParams();
	const page = {
		"sobre-nos": {
			title: "Sobre Nós",
			subtitle: "Nossa História",
			icon: Info,
			sections: [
				{
					title: "Quem Somos",
					body: "A EntregaMais nasceu com a missão de revolucionar a forma como as pessoas consomem bebidas, unindo tecnologia de ponta com a agilidade dos depósitos locais.",
					icon: Users
				},
				{
					title: "Nossa Missão",
					body: "Garantir que a sua bebida chegue gelada, no preço certo e no menor tempo possível, fortalecendo o comércio local.",
					icon: Target
				},
				{
					title: "Expansão",
					body: "Estamos presentes em mais de 100 cidades brasileiras, conectando milhares de lojistas a milhões de consumidores sedentos.",
					icon: Globe
				}
			]
		},
		"carreiras": {
			title: "Carreiras",
			subtitle: "Trabalhe conosco",
			icon: Briefcase,
			sections: [{
				title: "Cultura",
				body: "Valorizamos a agilidade, a inovação e, claro, a celebração. Aqui, cada entrega é motivo de orgulho."
			}, {
				title: "Vagas Abertas",
				body: "Temos oportunidades em Tecnologia, Logística, Marketing e Vendas. Venha fazer parte do time que não deixa a festa parar."
			}]
		},
		"blog": {
			title: "Blog",
			subtitle: "Notícias e Dicas",
			icon: Newspaper,
			sections: [{
				title: "Dicas de Mixologia",
				body: "Aprenda a fazer os melhores drinks para o seu final de semana com produtos que você encontra no nosso app."
			}, {
				title: "O Futuro da Logística",
				body: "Como estamos usando IA para otimizar rotas e entregar sua gelada em tempo recorde."
			}]
		},
		"seja-um-parceiro": {
			title: "Parceiros",
			subtitle: "Cresça com a gente",
			icon: Handshake,
			sections: [{
				title: "Vantagens",
				body: "Aumente suas vendas em até 40% conectando seu depósito à nossa base de clientes ativa."
			}, {
				title: "Tecnologia",
				body: "Oferecemos uma plataforma completa de gestão de pedidos, estoque e logística simplificada."
			}]
		},
		"investidores": {
			title: "Investidores",
			subtitle: "Relações com Investidores",
			icon: TrendingUp,
			sections: [{
				title: "Visão Geral",
				body: "A EntregaMais é uma das startups que mais cresce no setor de quick-commerce de bebidas na América Latina."
			}, {
				title: "Documentos",
				body: "Acesse nossos relatórios trimestrais, apresentações institucionais e marcos estratégicos."
			}]
		}
	}[slug] || {
		title: "Institucional",
		subtitle: "EntregaMais",
		icon: Info,
		sections: [{
			title: "Em breve",
			body: "Estamos preparando este conteúdo para você."
		}]
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-white",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "bg-ze-yellow py-20 md:py-32 relative overflow-hidden border-b-8 border-ze-black",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "container mx-auto px-6 relative z-10",
				children: [/* @__PURE__ */ jsxs(Link, {
					href: "/",
					className: "inline-flex items-center text-ze-black hover:opacity-70 mb-8 transition-all text-sm font-black uppercase tracking-widest",
					children: [
						"Home ",
						/* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 mx-1" }),
						" Institucional"
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col md:flex-row items-start md:items-center gap-8",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-20 h-20 bg-ze-black rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3",
						children: /* @__PURE__ */ jsx(page.icon, { className: "w-10 h-10 text-ze-yellow" })
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx(Badge, {
							className: "bg-ze-black text-white font-black uppercase tracking-[0.3em] mb-2 px-4 py-1.5 rounded-xl",
							children: page.subtitle
						}), /* @__PURE__ */ jsx("h1", {
							className: "text-5xl md:text-8xl font-black text-ze-black italic uppercase tracking-tighter leading-none",
							children: page.title
						})]
					})]
				})]
			}), /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-1/2 h-full bg-ze-black/5 -skew-x-12 transform translate-x-1/4" })]
		}), /* @__PURE__ */ jsx("div", {
			className: "container mx-auto px-6 py-24 md:py-32",
			children: /* @__PURE__ */ jsxs("div", {
				className: "max-w-4xl mx-auto space-y-24 md:space-y-32",
				children: [page.sections.map((section, i) => /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col md:flex-row gap-12 md:gap-20 items-start",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "w-full md:w-1/3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-4 mb-4",
							children: [section.icon && /* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 rounded-2xl bg-ze-yellow flex items-center justify-center border-2 border-ze-black shrink-0",
								children: /* @__PURE__ */ jsx(section.icon, { className: "w-6 h-6 text-ze-black" })
							}), /* @__PURE__ */ jsx("h2", {
								className: "text-3xl md:text-4xl font-black text-ze-black uppercase italic tracking-tighter leading-none",
								children: section.title
							})]
						}), /* @__PURE__ */ jsx("div", { className: "h-2 w-20 bg-ze-yellow rounded-full" })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "w-full md:w-2/3",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-xl md:text-2xl font-bold text-ze-black/70 leading-relaxed italic border-l-8 border-ze-yellow pl-8",
							children: section.body
						}), /* @__PURE__ */ jsxs(Button, {
							variant: "ghost",
							className: "mt-8 font-black uppercase text-xs tracking-widest hover:text-ze-red transition-colors group",
							children: ["Saiba mais ", /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" })]
						})]
					})]
				}, i)), /* @__PURE__ */ jsxs("div", {
					className: "p-10 md:p-20 bg-ze-black rounded-[3rem] md:rounded-[4rem] text-center space-y-8 shadow-[20px_20px_0px_0px_rgba(255,193,7,1)] border-4 border-ze-yellow",
					children: [
						/* @__PURE__ */ jsxs("h2", {
							className: "text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-tight",
							children: [
								"Vamos construir o futuro da ",
								/* @__PURE__ */ jsx("span", {
									className: "text-ze-yellow underline decoration-white decoration-8 underline-offset-8",
									children: "conveniência"
								}),
								" juntos?"
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-white/60 font-bold text-lg md:text-xl max-w-2xl mx-auto italic",
							children: "Seja você um investidor, parceiro ou futuro talento, a EntregaMais é o lugar onde a inovação se encontra com a celebração."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap justify-center gap-6 pt-4",
							children: [/* @__PURE__ */ jsx(Button, {
								className: "bg-ze-yellow text-ze-black hover:bg-white font-black uppercase tracking-widest px-12 h-16 rounded-2xl shadow-xl transform hover:scale-105 transition-all text-sm",
								children: "Falar com o Time"
							}), /* @__PURE__ */ jsx(Button, {
								variant: "outline",
								className: "border-4 border-white text-white hover:bg-white hover:text-ze-black font-black uppercase tracking-widest px-12 h-16 rounded-2xl transform hover:scale-105 transition-all text-sm",
								children: "Nossas Próximas Metas"
							})]
						})
					]
				})]
			})
		})]
	});
}
var RotateCcw = createLucideIcon("RotateCcw", [["path", {
	d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
	key: "1357e3"
}], ["path", {
	d: "M3 3v5h5",
	key: "1xhq8a"
}]]);
//#endregion
//#region src/app/orders/page.tsx
var statusConfig = {
	created: {
		label: "Pedido Autorizado",
		color: "bg-ze-gray text-ze-black border-ze-black/10",
		icon: Clock
	},
	confirmed: {
		label: "No Preparo",
		color: "bg-ze-yellow text-ze-black border-ze-black",
		icon: Package
	},
	preparing: {
		label: "No Preparo",
		color: "bg-ze-yellow text-ze-black border-ze-black",
		icon: Package
	},
	ready: {
		label: "Aguardando Coleta",
		color: "bg-ze-yellow text-ze-black border-ze-black",
		icon: ShoppingBag
	},
	picked_up: {
		label: "Em Rota de Entrega",
		color: "bg-ze-black text-white border-ze-black",
		icon: Truck
	},
	delivered: {
		label: "Entregue",
		color: "bg-green-100 text-green-700 border-green-200",
		icon: CircleCheck
	}
};
function CustomerOrdersPage() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const fetchOrders = async () => {
		try {
			setOrders(await apiFetch("/api/v1/orders/me"));
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchOrders();
		const interval = setInterval(fetchOrders, 5e3);
		return () => clearInterval(interval);
	}, []);
	if (loading) return /* @__PURE__ */ jsxs("div", {
		className: "min-h-[50vh] flex flex-col items-center justify-center space-y-4",
		children: [/* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-ze-yellow border-t-ze-black rounded-full animate-spin" }), /* @__PURE__ */ jsx("p", {
			className: "font-black text-xl uppercase italic tracking-tighter text-ze-black",
			children: "Buscando sua rodada..."
		})]
	});
	return /* @__PURE__ */ jsxs("main", {
		className: "container mx-auto px-4 py-8 pb-32 max-w-4xl",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex items-center justify-between mb-10",
			children: /* @__PURE__ */ jsxs("h1", {
				className: "text-4xl md:text-5xl font-black text-ze-black flex items-center uppercase italic tracking-tighter drop-shadow-sm",
				children: [/* @__PURE__ */ jsx(ShoppingBag, { className: "mr-4 h-10 w-10 md:h-12 md:w-12 text-ze-black fill-ze-yellow" }), "Meus Pedidos"]
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "space-y-8",
			children: orders.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-ze-black/10 shadow-xl p-10",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "text-7xl mb-6 grayscale opacity-20",
						children: "🍻"
					}),
					/* @__PURE__ */ jsx("h3", {
						className: "text-2xl font-black text-ze-black uppercase italic tracking-tighter",
						children: "Sua estante está vazia"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-ze-black/40 mt-3 font-bold uppercase tracking-widest text-xs max-w-xs mx-auto",
						children: "Ainda não temos registros de pedidos. Que tal garantir a gelada agora?"
					}),
					/* @__PURE__ */ jsx(Button, {
						onClick: () => router.push("/"),
						variant: "ze-dark",
						className: "mt-10 rounded-2xl h-14 px-10 font-black tracking-widest uppercase shadow-xl transform hover:-rotate-1 transition-transform",
						children: "Abastecer Agora"
					})
				]
			}) : orders.map((order) => {
				const config = statusConfig[order.status] || statusConfig.created;
				const StatusIcon = config.icon;
				return /* @__PURE__ */ jsxs(Card, {
					className: "overflow-hidden border-4 border-ze-black rounded-[2.5rem] group shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white hover:shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] transition-all",
					children: [/* @__PURE__ */ jsx(CardHeader, {
						className: "bg-ze-gray border-b-4 border-ze-black/5 p-6 md:p-8",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row justify-between md:items-center gap-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ jsx(CardTitle, {
										className: "text-2xl font-black text-ze-black uppercase italic tracking-tighter truncate max-w-[300px]",
										children: order.edges?.seller?.name || "Depósito"
									}), /* @__PURE__ */ jsxs(Badge, {
										variant: "outline",
										className: "text-[10px] font-black border-ze-black/20 text-ze-black/40",
										children: ["#", order.id.split("-")[0]]
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "text-[10px] font-black text-ze-black/40 uppercase tracking-[0.2em] flex items-center gap-2",
									children: [/* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }), new Date(order.created_at).toLocaleString("pt-BR")]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: `flex items-center md:justify-center px-6 py-3 rounded-2xl border-2 transition-all shadow-sm ${config.color}`,
								children: [/* @__PURE__ */ jsx(StatusIcon, { className: "h-5 w-5 mr-3 shrink-0" }), /* @__PURE__ */ jsx("span", {
									className: "font-black uppercase italic text-sm tracking-tighter",
									children: config.label
								})]
							})]
						})
					}), /* @__PURE__ */ jsxs(CardContent, {
						className: "p-6 md:p-8",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-8",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex-1 space-y-4",
								children: [/* @__PURE__ */ jsx("div", {
									className: "space-y-2",
									children: (order.edges?.items || []).map((it, idx) => /* @__PURE__ */ jsxs("div", {
										className: "flex items-center text-sm font-bold text-ze-black/60 gap-2 uppercase tracking-tight",
										children: [/* @__PURE__ */ jsx("span", {
											className: "w-5 h-5 bg-ze-yellow flex items-center justify-center rounded-md font-black text-[10px] border border-ze-black/10 shrink-0",
											children: it.quantity
										}), /* @__PURE__ */ jsx("span", { children: it.product?.name || "Produto" })]
									}, idx))
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2 text-[10px] font-bold text-ze-black/30 uppercase tracking-widest pt-2",
									children: [/* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 text-ze-red" }), /* @__PURE__ */ jsx("span", {
										className: "truncate max-w-[250px] md:max-w-md",
										children: "Endereço de Entrega Selecionado"
									})]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "w-full md:w-auto flex flex-col items-center justify-center bg-ze-gray p-6 rounded-[2rem] border-2 border-ze-black/5 shadow-inner",
								children: [/* @__PURE__ */ jsx("div", {
									className: "text-[10px] font-black text-ze-black/40 uppercase tracking-[0.3em] mb-1",
									children: "Total Geral"
								}), /* @__PURE__ */ jsxs("div", {
									className: "font-black text-3xl text-ze-black tracking-tighter",
									children: ["R$ ", order.total_amount?.toFixed(2).replace(".", ",")]
								})]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "mt-8 flex flex-wrap gap-3 border-t-2 border-ze-black/5 pt-8",
							children: [/* @__PURE__ */ jsxs(Button, {
								variant: "outline",
								className: "flex-1 md:flex-none border-4 border-ze-black font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl hover:bg-ze-black hover:text-white transition-all",
								children: [/* @__PURE__ */ jsx(CircleHelp, { className: "w-4 h-4 mr-2" }), " Ajuda"]
							}), order.status === "delivered" ? /* @__PURE__ */ jsxs(Button, {
								onClick: () => router.push("/"),
								className: "flex-1 md:flex-none bg-ze-black text-white hover:bg-ze-yellow hover:text-ze-black border-4 border-ze-black font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl transition-all",
								children: [/* @__PURE__ */ jsx(RotateCcw, { className: "w-4 h-4 mr-2" }), " Repetir Pedido"]
							}) : /* @__PURE__ */ jsxs(Button, {
								className: "flex-1 md:flex-none bg-ze-yellow text-ze-black hover:bg-ze-black hover:text-white border-4 border-ze-black font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl shadow-lg transition-all",
								children: ["Acompanhar Rota ", /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 ml-1" })]
							})]
						})]
					})]
				}, order.id);
			})
		})]
	});
}
var LoaderCircle = createLucideIcon("LoaderCircle", [["path", {
	d: "M21 12a9 9 0 1 1-6.219-8.56",
	key: "13zald"
}]]);
//#endregion
//#region src/components/ui/CityAutocomplete.tsx
function normalize(text) {
	return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function CityAutocomplete({ onSelect, placeholder, initialValue = "" }) {
	const [query, setQuery] = useState(initialValue);
	const [allData, setAllData] = useState([]);
	const [suggestions, setSuggestions] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const containerRef = useRef(null);
	const hasLoadedRef = useRef(false);
	const loadData = async () => {
		if (hasLoadedRef.current) return;
		setIsLoading(true);
		try {
			setAllData(await (await fetch("/data/neighborhoods.json")).json());
			hasLoadedRef.current = true;
		} catch (error) {
			console.error("Erro ao carregar bairros:", error);
		} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		if (query.length > 2 && isOpen && allData.length > 0) {
			const tokens = normalize(query).split(/\s+/).filter((t) => t.length > 0);
			const filtered = [];
			for (let i = 0; i < allData.length; i++) {
				const [b, c, u, lat, lng] = allData[i];
				const combined = normalize(`${b} ${c} ${u}`);
				if (tokens.every((token) => combined.includes(token))) {
					filtered.push({
						bairro: b,
						cidade: c,
						uf: u,
						lat,
						lng
					});
					if (filtered.length >= 8) break;
				}
			}
			setSuggestions(filtered);
		} else setSuggestions([]);
	}, [
		query,
		isOpen,
		allData
	]);
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);
	const handleSelect = (item) => {
		const value = `${item.bairro}, ${item.cidade} - ${item.uf}`;
		setQuery(value);
		setIsOpen(false);
		onSelect(value, {
			lat: item.lat,
			lng: item.lng
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "relative w-full",
		ref: containerRef,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ jsx(Input, {
					value: query,
					onChange: (e) => {
						setQuery(e.target.value);
						setIsOpen(true);
						loadData();
					},
					onFocus: () => {
						setIsOpen(true);
						loadData();
					},
					className: "pl-12 h-14 bg-ze-gray border-ze-black/5 rounded-2xl font-black uppercase tracking-widest placeholder:text-ze-black/20 focus:border-ze-yellow transition-all",
					placeholder: placeholder || "Bairro, Cidade ou UF"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "absolute left-4 top-1/2 -translate-y-1/2",
					children: isLoading ? /* @__PURE__ */ jsx(LoaderCircle, { className: "w-5 h-5 text-ze-black/20 animate-spin" }) : /* @__PURE__ */ jsx(MapPin, { className: "w-6 h-6 text-ze-black/20" })
				}),
				query && /* @__PURE__ */ jsx("button", {
					onClick: () => {
						setQuery("");
						onSelect("");
					},
					className: "absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white rounded-full transition-colors",
					children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4 text-ze-black/40" })
				})
			]
		}), isOpen && suggestions.length > 0 && /* @__PURE__ */ jsx("div", {
			className: "absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-ze-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
			children: suggestions.map((item, i) => /* @__PURE__ */ jsxs("button", {
				onClick: () => handleSelect(item),
				className: "w-full flex items-center gap-4 px-6 py-4 hover:bg-ze-yellow/5 text-left border-b border-ze-black/5 last:border-0 group transition-colors",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-10 h-10 rounded-xl bg-ze-gray flex items-center justify-center group-hover:bg-ze-yellow transition-colors",
					children: /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-ze-black/40 group-hover:text-ze-black" })
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ jsx("div", {
						className: "font-black text-ze-black uppercase tracking-tight line-clamp-1",
						children: item.bairro
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-[10px] font-bold text-ze-black/40 uppercase tracking-widest truncate",
						children: [
							item.cidade,
							" - ",
							item.uf
						]
					})]
				})]
			}, i))
		})]
	});
}
//#endregion
//#region src/lib/nearbySellers.ts
var CITY_OPTIONS = [
	{
		city: "Cabo Frio",
		state: "RJ",
		label: "Cabo Frio, RJ",
		lat: -22.8794,
		lng: -42.0186
	},
	{
		city: "Arraial do Cabo",
		state: "RJ",
		label: "Arraial do Cabo, RJ",
		lat: -22.9671,
		lng: -42.0278
	},
	{
		city: "Buzios",
		state: "RJ",
		label: "Buzios, RJ",
		lat: -22.7469,
		lng: -41.8816
	},
	{
		city: "Rio de Janeiro",
		state: "RJ",
		label: "Rio de Janeiro, RJ",
		lat: -22.9068,
		lng: -43.1729
	},
	{
		city: "Niteroi",
		state: "RJ",
		label: "Niteroi, RJ",
		lat: -22.8832,
		lng: -43.1034
	},
	{
		city: "Sao Paulo",
		state: "SP",
		label: "Sao Paulo, SP",
		lat: -23.5505,
		lng: -46.6333
	},
	{
		city: "Campinas",
		state: "SP",
		label: "Campinas, SP",
		lat: -22.9099,
		lng: -47.0626
	},
	{
		city: "Santos",
		state: "SP",
		label: "Santos, SP",
		lat: -23.9608,
		lng: -46.3336
	},
	{
		city: "Belo Horizonte",
		state: "MG",
		label: "Belo Horizonte, MG",
		lat: -19.9167,
		lng: -43.9345
	},
	{
		city: "Juiz de Fora",
		state: "MG",
		label: "Juiz de Fora, MG",
		lat: -21.761,
		lng: -43.3503
	},
	{
		city: "Curitiba",
		state: "PR",
		label: "Curitiba, PR",
		lat: -25.4284,
		lng: -49.2733
	},
	{
		city: "Florianopolis",
		state: "SC",
		label: "Florianopolis, SC",
		lat: -27.5949,
		lng: -48.5482
	}
];
var SELLER_LOCATION_PRESETS = {
	"1": {
		city: "Cabo Frio",
		state: "RJ",
		lat: -22.8851,
		lng: -42.0202
	},
	"2": {
		city: "Arraial do Cabo",
		state: "RJ",
		lat: -22.9696,
		lng: -42.0284
	},
	"3": {
		city: "Rio de Janeiro",
		state: "RJ",
		lat: -22.9135,
		lng: -43.2003
	},
	"4": {
		city: "Sao Pedro da Aldeia",
		state: "RJ",
		lat: -22.8425,
		lng: -42.1026
	}
};
function normalizeText(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function enrichSeller(seller) {
	return {
		...seller,
		...SELLER_LOCATION_PRESETS[seller.id]
	};
}
function formatLocationLabel(city, state) {
	if (!city || !state) return void 0;
	return `${city}, ${state}`;
}
function findCityOption(query) {
	const normalizedQuery = normalizeText(query);
	return CITY_OPTIONS.find((option) => normalizeText(option.label) === normalizedQuery);
}
function calculateDistanceKm(startLat, startLng, endLat, endLng) {
	const earthRadiusKm = 6371;
	const dLat = toRadians(endLat - startLat);
	const dLng = toRadians(endLng - startLng);
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(startLat)) * Math.cos(toRadians(endLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
	return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
function toRadians(value) {
	return value * Math.PI / 180;
}
function findNearbySellers(sellers, location, maxDistanceKm = 80, limit = 4) {
	return sellers.map(enrichSeller).map((seller) => {
		if (seller.lat == null || seller.lng == null) return seller;
		return {
			...seller,
			distanceKm: calculateDistanceKm(location.lat, location.lng, seller.lat, seller.lng)
		};
	}).filter((seller) => seller.distanceKm != null && seller.distanceKm <= maxDistanceKm).sort((left, right) => (left.distanceKm ?? Number.MAX_SAFE_INTEGER) - (right.distanceKm ?? Number.MAX_SAFE_INTEGER)).slice(0, limit);
}
function findClosestNeighborhood(lat, lng, allData) {
	if (!allData || allData.length === 0) return null;
	let closest = allData[0];
	let minDistance = calculateDistanceKm(lat, lng, closest[3], closest[4]);
	for (let i = 1; i < allData.length; i++) {
		const item = allData[i];
		const distance = calculateDistanceKm(lat, lng, item[3], item[4]);
		if (distance < minDistance) {
			minDistance = distance;
			closest = item;
		}
	}
	const [bairro, cidade, uf] = closest;
	return `${bairro}, ${cidade} - ${uf}`;
}
//#endregion
//#region src/components/modals/LocationModal.tsx
function LocationModal({ isOpen, onClose, onSelect }) {
	const [selectedLocation, setSelectedLocation] = useState("");
	const [selectedCoords, setSelectedCoords] = useState();
	const [isAnimating, setIsAnimating] = useState(false);
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
			setIsAnimating(true);
		} else {
			document.body.style.overflow = "unset";
			setTimeout(() => setIsAnimating(false), 300);
		}
	}, [isOpen]);
	if (!isOpen && !isAnimating) return null;
	const handleConfirm = () => {
		if (selectedLocation) {
			onSelect(selectedLocation, selectedCoords);
			onClose();
		}
	};
	const handleCurrentLocation = async () => {
		if (typeof window === "undefined" || !("geolocation" in navigator)) return;
		navigator.geolocation.getCurrentPosition(async (position) => {
			const { latitude: lat, longitude: lng } = position.coords;
			try {
				onSelect(findClosestNeighborhood(lat, lng, await (await fetch("/data/neighborhoods.json")).json()) || "Sua localização", {
					lat,
					lng
				});
			} catch (e) {
				onSelect("Sua localização atual", {
					lat,
					lng
				});
			}
			onClose();
		}, (error) => {
			console.error("Erro na geolocalização:", error);
			alert("Não foi possível obter sua localização. Por favor, verifique as permissões do seu navegador.");
		}, {
			enableHighAccuracy: true,
			timeout: 5e3
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: `fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "absolute inset-0 bg-ze-black/60 backdrop-blur-md",
			onClick: onClose
		}), /* @__PURE__ */ jsxs("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Escolher localização",
			className: `relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 delay-75 ${isOpen ? "translate-y-0 scale-100" : "translate-y-8 scale-95"}`,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "bg-ze-yellow p-8 text-center relative overflow-hidden",
				children: [
					/* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl" }),
					/* @__PURE__ */ jsx("div", {
						className: "w-16 h-16 bg-ze-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-ze-black/10",
						children: /* @__PURE__ */ jsx(MapPin, { className: "w-8 h-8 text-ze-yellow" })
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "text-3xl font-black text-ze-black uppercase italic tracking-tighter leading-none",
						children: "Onde você está?"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-ze-black/60 text-xs font-bold uppercase tracking-widest mt-2",
						children: "Encontraremos as lojas mais próximas"
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: onClose,
						"aria-label": "Fechar localização",
						className: "absolute top-6 right-6 p-2 rounded-xl bg-ze-black/5 hover:bg-ze-black/10 transition-colors",
						children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5 text-ze-black" })
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "p-8 space-y-8",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ jsx("label", {
							className: "text-[10px] font-black uppercase tracking-[0.2em] text-ze-black/40 px-2",
							children: "Sua Localização"
						}), /* @__PURE__ */ jsx(CityAutocomplete, {
							onSelect: (val, coords) => {
								setSelectedLocation(val);
								setSelectedCoords(coords);
							},
							placeholder: "Ex: Praia do Forte, Cabo Frio"
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "space-y-4",
						children: /* @__PURE__ */ jsxs("button", {
							onClick: handleCurrentLocation,
							className: "w-full flex items-center gap-4 p-4 rounded-2xl bg-ze-gray border border-ze-black/5 group cursor-pointer hover:border-ze-yellow transition-all text-left",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-ze-yellow transition-colors",
									children: /* @__PURE__ */ jsx(Navigation, { className: "w-5 h-5 text-ze-black" })
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ jsx("div", {
										className: "text-xs font-black uppercase text-ze-black",
										children: "Usar localização atual"
									}), /* @__PURE__ */ jsx("div", {
										className: "text-[10px] font-bold text-ze-black/40 uppercase tracking-widest",
										children: "Precisão máxima"
									})]
								}),
								/* @__PURE__ */ jsx(CircleCheck, { className: "w-5 h-5 text-ze-black/10 group-hover:text-ze-black transition-colors" })
							]
						})
					}),
					/* @__PURE__ */ jsx(Button, {
						onClick: handleConfirm,
						disabled: !selectedLocation,
						className: "w-full h-16 rounded-2xl bg-ze-black text-white hover:bg-ze-yellow hover:text-ze-black text-sm font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-30 disabled:hover:bg-ze-black disabled:hover:text-white transition-all transform active:scale-95",
						children: "Confirmar Localização"
					})
				]
			})]
		})]
	});
}
//#endregion
//#region src/app/page.tsx
function Home() {
	const [allSellers, setAllSellers] = useState([]);
	const [nearbySellers, setNearbySellers] = useState([]);
	const [locationLabel, setLocationLabel] = useState("");
	const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
	const [isLoadingNearby, setIsLoadingNearby] = useState(true);
	useEffect(() => {
		let isMounted = true;
		const loadNearbySellers = async () => {
			setIsLoadingNearby(true);
			try {
				const sellers = await apiFetch("/api/v1/sellers");
				if (!isMounted) return;
				setAllSellers(sellers);
				const savedLocation = typeof window !== "undefined" ? localStorage.getItem("last_selected_location") : null;
				if (savedLocation) {
					setLocationLabel(savedLocation);
					setNearbySellers(sellers);
					setIsLoadingNearby(false);
					return;
				}
				if (typeof window !== "undefined" && "geolocation" in navigator) navigator.geolocation.getCurrentPosition(async (position) => {
					if (!isMounted) return;
					const { latitude: lat, longitude: lng } = position.coords;
					setNearbySellers(findNearbySellers(sellers, {
						lat,
						lng
					}));
					try {
						const resolvedLocation = findClosestNeighborhood(lat, lng, await (await fetch("/data/neighborhoods.json")).json()) || "Sua localização";
						setLocationLabel(resolvedLocation);
						localStorage.setItem("last_selected_location", resolvedLocation);
					} catch (e) {
						console.error("Erro ao identificar bairro:", e);
						const fallbackLocation = "Sua localização atual";
						setLocationLabel(fallbackLocation);
						localStorage.setItem("last_selected_location", fallbackLocation);
					}
					setIsLoadingNearby(false);
				}, () => {
					if (!isMounted) return;
					if (!savedLocation) setIsLocationModalOpen(true);
					setIsLoadingNearby(false);
				}, {
					enableHighAccuracy: true,
					timeout: 5e3
				});
				else {
					if (!savedLocation) setIsLocationModalOpen(true);
					setIsLoadingNearby(false);
				}
			} catch (error) {
				console.error(error);
				setIsLoadingNearby(false);
			}
		};
		loadNearbySellers();
		return () => {
			isMounted = false;
		};
	}, []);
	const handleLocationSelect = (selectedLabel, coords) => {
		let locationToUse;
		if (coords) locationToUse = {
			...coords,
			label: selectedLabel
		};
		else {
			const selectedCity = findCityOption(selectedLabel);
			if (selectedCity) locationToUse = {
				...selectedCity,
				label: selectedCity.label
			};
		}
		if (locationToUse) {
			setNearbySellers(findNearbySellers(allSellers, locationToUse));
			setLocationLabel(locationToUse.label);
			localStorage.setItem("last_selected_location", locationToUse.label);
		}
		setIsLocationModalOpen(false);
	};
	return /* @__PURE__ */ jsxs("main", {
		className: "container mx-auto px-4 py-6 md:py-8 pb-20",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "relative w-full min-h-[450px] md:h-[700px] rounded-[2rem] md:rounded-[4rem] overflow-hidden border-4 md:border-8 border-ze-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] md:shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] bg-ze-yellow mb-12 md:mb-20 group",
				children: [
					/* @__PURE__ */ jsx(Image, {
						src: "/assets/hero-beverage.png",
						alt: "Bebidas Geladas",
						fill: true,
						className: "object-cover brightness-75 group-hover:scale-105 transition-transform duration-700",
						priority: true
					}),
					/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-ze-black/90 via-ze-black/40 to-transparent" }),
					/* @__PURE__ */ jsxs("div", {
						className: "absolute inset-0 flex flex-col justify-center p-6 md:p-20 space-y-4 md:space-y-6 max-w-4xl",
						children: [
							/* @__PURE__ */ jsx(Badge, {
								className: "bg-ze-yellow hover:bg-ze-yellow text-ze-black font-black uppercase tracking-[0.2em] md:tracking-[0.4em] px-3 md:px-6 py-1 md:py-2 w-fit text-[10px] md:text-sm animate-bounce cursor-default",
								children: "Sua Bebida em Minutos"
							}),
							/* @__PURE__ */ jsxs("h1", {
								className: "text-3xl sm:text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.9] md:leading-[0.85] drop-shadow-2xl",
								children: [
									"Bebida gelada, ",
									/* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
									/* @__PURE__ */ jsx("span", {
										className: "text-ze-yellow inline-block mt-2 sm:mt-0",
										children: "preço de mercado."
									})
								]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "text-white/90 max-w-xl text-base md:text-2xl font-black uppercase tracking-tight drop-shadow-lg leading-tight",
								children: [
									"Cervejas, vinhos e muito mais. ",
									/* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
									"Sem sair de casa, sem estresse."
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "pt-4 md:pt-8 w-full",
								children: /* @__PURE__ */ jsxs("form", {
									action: "/search",
									className: "max-w-2xl relative flex items-center bg-white rounded-2xl md:rounded-3xl shadow-2xl hover:shadow-ze-yellow/40 transition-all p-2 md:p-3 border-4 border-ze-black transform -rotate-1 hover:rotate-0",
									children: [
										/* @__PURE__ */ jsx("div", {
											className: "pl-2 md:pl-4 pr-1 md:pr-2 text-ze-black",
											children: /* @__PURE__ */ jsx(Search, { className: "h-6 w-6 md:h-8 md:w-8" })
										}),
										/* @__PURE__ */ jsx(Input, {
											name: "q",
											className: "border-0 shadow-none focus-visible:ring-0 px-2 md:px-4 h-10 md:h-14 text-sm md:text-xl rounded-none font-black placeholder:text-ze-black/20 uppercase italic w-full",
											placeholder: "O que vamos beber?"
										}),
										/* @__PURE__ */ jsx(Button, {
											type: "submit",
											variant: "ze-dark",
											className: "rounded-xl md:rounded-2xl px-4 md:px-12 h-10 md:h-14 ml-1 md:ml-2 text-sm md:text-lg shadow-xl shrink-0",
											children: "Buscar"
										})
									]
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-12",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex items-center justify-between mb-6",
					children: /* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-black text-ze-black uppercase tracking-tighter",
						children: "Categorias"
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "flex gap-2 min-[400px]:gap-4 overflow-x-auto pb-4 pt-4 scrollbar-hide",
					children: [
						{
							name: "Cervejas",
							emoji: "🍺"
						},
						{
							name: "Vinhos",
							emoji: "🍷"
						},
						{
							name: "Destilados",
							emoji: "🥃"
						},
						{
							name: "Refrigerantes",
							emoji: "🥤"
						},
						{
							name: "Gelo e Carvão",
							emoji: "🧊"
						},
						{
							name: "Energéticos",
							emoji: "⚡"
						},
						{
							name: "Sucos",
							emoji: "🧃"
						},
						{
							name: "Petiscos",
							emoji: "🥨"
						}
					].map((item, i) => /* @__PURE__ */ jsxs(Link, {
						href: `/search?category=${encodeURIComponent(item.name)}`,
						className: "flex-shrink-0 flex flex-col items-center gap-3 group cursor-pointer hover:no-underline w-24",
						children: [/* @__PURE__ */ jsx("div", {
							className: "w-20 h-20 rounded-[2rem] bg-white shadow-sm border-2 border-ze-black/5 flex items-center justify-center group-hover:border-ze-yellow group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-3 shadow-black/5",
							children: /* @__PURE__ */ jsx("div", {
								className: "w-14 h-14 rounded-full bg-ze-yellow/10 flex items-center justify-center group-hover:bg-ze-yellow/20 transition-colors",
								children: /* @__PURE__ */ jsx("span", {
									className: "text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform",
									children: item.emoji
								})
							})
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-black text-ze-black/60 group-hover:text-ze-black transition-colors uppercase tracking-widest text-center px-1",
							children: item.name
						})]
					}, i))
				})]
			}),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between mb-8",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-2xl md:text-3xl font-black text-ze-black uppercase tracking-tighter",
						children: "Depósitos Próximos"
					}), /* @__PURE__ */ jsx("button", {
						onClick: () => setIsLocationModalOpen(true),
						"aria-label": "Alterar localização",
						className: "w-10 h-10 rounded-xl bg-ze-gray flex items-center justify-center hover:bg-ze-yellow transition-all shadow-sm border border-ze-black/5",
						children: /* @__PURE__ */ jsx(MapPin, { className: "w-5 h-5 text-ze-black" })
					})]
				}), locationLabel && /* @__PURE__ */ jsxs("p", {
					className: "text-[10px] font-black uppercase tracking-[0.2em] text-ze-black/40 mt-2 flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-ze-yellow animate-pulse" }),
						"Buscando em ",
						locationLabel
					]
				})] }), /* @__PURE__ */ jsx(Link, {
					href: "/search",
					className: "hover:no-underline hidden sm:block",
					children: /* @__PURE__ */ jsxs(Button, {
						variant: "ghost",
						className: "text-ze-black hover:text-ze-black/80 font-black uppercase text-xs tracking-[0.2em]",
						children: ["Ver todos ", /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 ml-1" })]
					})
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
				children: [
					!isLoadingNearby && nearbySellers.map((store) => /* @__PURE__ */ jsx(Link, {
						href: `/store/${store.id}`,
						className: "hover:no-underline",
						children: /* @__PURE__ */ jsxs(Card, {
							className: "cursor-pointer group overflow-hidden border-2 border-ze-black/5 rounded-3xl ze-card-hover bg-white h-full",
							children: [/* @__PURE__ */ jsx("div", {
								className: "h-40 bg-ze-gray w-full relative",
								children: /* @__PURE__ */ jsx("div", {
									className: "absolute inset-0 bg-gradient-to-t from-ze-black/80 to-transparent flex items-end p-6",
									children: /* @__PURE__ */ jsx(Badge, {
										className: "bg-ze-yellow text-ze-black font-black uppercase text-[10px] tracking-widest",
										children: store.category || "Bebidas"
									})
								})
							}), /* @__PURE__ */ jsxs(CardContent, {
								className: "p-6 pt-8 relative",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "absolute -top-12 right-6 w-20 h-20 bg-white rounded-3xl shadow-xl border-4 border-ze-yellow flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-transform",
										children: /* @__PURE__ */ jsx("img", {
											src: "/branding/entregamais-shop/moto.png",
											alt: "Entrega",
											className: "w-12 h-12 object-contain"
										})
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "font-black text-xl text-ze-black mb-1 group-hover:text-ze-red transition-colors uppercase tracking-tighter",
										children: store.name
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-4 text-sm text-ze-black/60 mb-4 font-bold",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center text-ze-yellow bg-ze-black px-2 py-0.5 rounded-md",
												children: [
													/* @__PURE__ */ jsx(Star, { className: "w-4 h-4 mr-1 fill-current" }),
													" ",
													(store.rating ?? 5).toFixed(1)
												]
											}),
											/* @__PURE__ */ jsx("span", { children: "•" }),
											/* @__PURE__ */ jsx("span", { children: formatLocationLabel(store.city, store.state) || "Sem localizacao" })
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2 text-xs font-black text-ze-black/80 bg-ze-gray rounded-2xl px-4 py-3 border border-ze-black/5",
										children: [/* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-ze-red" }), /* @__PURE__ */ jsx("span", { children: store.distanceKm != null ? `${store.distanceKm.toFixed(1)} km de distancia` : "Distancia indisponivel" })]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between text-xs font-black text-ze-black/80 bg-ze-gray rounded-2xl p-4 border border-ze-black/5 mt-4",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center",
											children: [
												/* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 mr-2" }),
												" ",
												store.time || "15-25 min"
											]
										}), /* @__PURE__ */ jsx("div", {
											className: "flex items-center text-ze-red uppercase tracking-widest",
											children: store.fee_label || `A partir de R$ ${(store.min_delivery_fee ?? 0).toFixed(2).replace(".", ",")}`
										})]
									})
								]
							})]
						})
					}, store.id)),
					!isLoadingNearby && nearbySellers.length === 0 && /* @__PURE__ */ jsx(Card, {
						className: "md:col-span-2 lg:col-span-4 rounded-[2.5rem] border-4 border border-ze-black border-dashed bg-white shadow-[12px_12px_0px_0px_rgba(34,34,34,0.05)]",
						children: /* @__PURE__ */ jsxs(CardContent, {
							className: "p-12 text-center space-y-6",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "w-24 h-24 bg-ze-gray rounded-[2rem] flex items-center justify-center mx-auto text-5xl grayscale opacity-50",
									children: "📍"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ jsx("h3", {
										className: "text-3xl font-black uppercase tracking-tighter text-ze-black",
										children: "Nenhum depósito por aqui..."
									}), /* @__PURE__ */ jsxs("p", {
										className: "text-ze-black/60 font-bold uppercase text-xs tracking-widest",
										children: [
											"Não encontramos lojas próximas a ",
											locationLabel || "sua localização",
											"."
										]
									})]
								}),
								/* @__PURE__ */ jsx(Button, {
									onClick: () => setIsLocationModalOpen(true),
									variant: "ze-dark",
									className: "px-10 h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl transform hover:-rotate-1 transition-transform",
									children: "Alterar Localização"
								})
							]
						})
					}),
					isLoadingNearby && /* @__PURE__ */ jsx("div", {
						className: "md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse",
						children: [
							1,
							2,
							3,
							4
						].map((i) => /* @__PURE__ */ jsx("div", { className: "h-80 bg-ze-gray rounded-3xl" }, i))
					})
				]
			})] }),
			/* @__PURE__ */ jsx(LocationModal, {
				isOpen: isLocationModalOpen,
				onClose: () => setIsLocationModalOpen(false),
				onSelect: handleLocationSelect
			})
		]
	});
}
var Lock = createLucideIcon("Lock", [["rect", {
	width: "18",
	height: "11",
	x: "3",
	y: "11",
	rx: "2",
	ry: "2",
	key: "1w4ew1"
}], ["path", {
	d: "M7 11V7a5 5 0 0 1 10 0v4",
	key: "fwvmzm"
}]]);
var Eye = createLucideIcon("Eye", [["path", {
	d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
	key: "1nclc0"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "3",
	key: "1v7zrd"
}]]);
//#endregion
//#region src/app/privacy/page.tsx
function PrivacyPolicy() {
	return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-ze-gray",
		children: /* @__PURE__ */ jsxs("main", {
			className: "container mx-auto px-4 py-12 max-w-4xl",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "bg-white border-4 border-ze-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(34,34,34,1)] mb-12",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "bg-ze-black text-white p-10 md:p-16 relative overflow-hidden",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "relative z-10",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "inline-flex items-center justify-center p-3 bg-ze-yellow text-ze-black rounded-2xl mb-6 transform rotate-2",
								children: /* @__PURE__ */ jsx(Lock, { className: "w-8 h-8" })
							}),
							/* @__PURE__ */ jsxs("h1", {
								className: "text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4",
								children: [
									"Política de ",
									/* @__PURE__ */ jsx("br", {}),
									" Privacidade"
								]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-ze-yellow font-bold uppercase tracking-widest text-sm",
								children: "Segurança e transparência com seus dados"
							})
						]
					}), /* @__PURE__ */ jsx(ShieldCheck, { className: "absolute -bottom-10 -right-10 w-64 h-64 text-white/5 transform -rotate-12" })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "p-8 md:p-16 space-y-12",
					children: [
						/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 bg-ze-yellow shadow-[4px_4px_0px_0px_rgba(34,34,34,1)] border-2 border-ze-black rounded-xl flex items-center justify-center text-ze-black",
								children: /* @__PURE__ */ jsx(Database, { className: "w-6 h-6" })
							}), "Quais dados coletamos?"]
						}), /* @__PURE__ */ jsxs("div", {
							className: "prose prose-ze text-ze-black/70 font-medium leading-relaxed",
							children: [/* @__PURE__ */ jsx("p", { children: "Para entregar sua bebida gelada, precisamos de algumas informações básicas. Coletamos dados que você nos fornece diretamente, como:" }), /* @__PURE__ */ jsxs("ul", {
								className: "list-none mt-4 space-y-3",
								children: [
									/* @__PURE__ */ jsxs("li", {
										className: "flex items-start gap-2 italic",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-ze-yellow font-black",
											children: "/"
										}), /* @__PURE__ */ jsx("span", { children: "Informações de Cadastro: Nome, E-mail, CPF e Senha." })]
									}),
									/* @__PURE__ */ jsxs("li", {
										className: "flex items-start gap-2 italic",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-ze-yellow font-black",
											children: "/"
										}), /* @__PURE__ */ jsx("span", { children: "Localização: Para encontrar o vendedor mais próximo e realizar a entrega." })]
									}),
									/* @__PURE__ */ jsxs("li", {
										className: "flex items-start gap-2 italic",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-ze-yellow font-black",
											children: "/"
										}), /* @__PURE__ */ jsx("span", { children: "Histórico de Pedidos: Para facilitar suas próximas rodadas." })]
									})
								]
							})]
						})] }),
						/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 bg-ze-yellow shadow-[4px_4px_0px_0px_rgba(34,34,34,1)] border-2 border-ze-black rounded-xl flex items-center justify-center text-ze-black",
								children: /* @__PURE__ */ jsx(Eye, { className: "w-6 h-6" })
							}), "Como usamos seus dados?"]
						}), /* @__PURE__ */ jsxs("div", {
							className: "prose prose-ze text-ze-black/70 font-medium leading-relaxed",
							children: [/* @__PURE__ */ jsx("p", { children: "Utilizamos suas informações exclusivamente para melhorar sua experiência no Entregamais:" }), /* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-6",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "bg-ze-gray p-6 rounded-2xl border-2 border-ze-black",
									children: [/* @__PURE__ */ jsx("h4", {
										className: "font-black uppercase italic mb-2 text-ze-black",
										children: "Operação"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-sm",
										children: "Processar pagamentos e coordenar entregas com nossos parceiros."
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "bg-ze-gray p-6 rounded-2xl border-2 border-ze-black",
									children: [/* @__PURE__ */ jsx("h4", {
										className: "font-black uppercase italic mb-2 text-ze-black",
										children: "Comunicação"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-sm",
										children: "Enviar atualizações sobre o seu pedido e novidades na geladeira."
									})]
								})]
							})]
						})] }),
						/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 bg-ze-yellow shadow-[4px_4px_0px_0px_rgba(34,34,34,1)] border-2 border-ze-black rounded-xl flex items-center justify-center text-ze-black",
								children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-6 h-6" })
							}), "Segurança dos Dados"]
						}), /* @__PURE__ */ jsxs("div", {
							className: "prose prose-ze text-ze-black/70 font-medium leading-relaxed",
							children: [/* @__PURE__ */ jsx("p", { children: "Levamos a segurança a sério. Utilizamos criptografia de ponta a ponta (SSL) e protocolos de autenticação robustos para garantir que seus dados nunca caiam em mãos erradas." }), /* @__PURE__ */ jsx("p", {
								className: "mt-4 font-bold text-ze-red uppercase tracking-tighter italic",
								children: "* NUNCA solicitamos sua senha por e-mail ou telefone."
							})]
						})] }),
						/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 bg-ze-yellow shadow-[4px_4px_0px_0px_rgba(34,34,34,1)] border-2 border-ze-black rounded-xl flex items-center justify-center text-ze-black",
								children: /* @__PURE__ */ jsx(Bell, { className: "w-6 h-6" })
							}), "Seus Direitos (LGPD)"]
						}), /* @__PURE__ */ jsxs("div", {
							className: "prose prose-ze text-ze-black/70 font-medium leading-relaxed",
							children: [/* @__PURE__ */ jsx("p", { children: "Você tem total controle sobre seus dados conforme a Lei Geral de Proteção de Dados:" }), /* @__PURE__ */ jsxs("ul", {
								className: "list-disc ml-6 mt-4 space-y-2",
								children: [
									/* @__PURE__ */ jsx("li", { children: "Direito de acesso e correção de dados." }),
									/* @__PURE__ */ jsx("li", { children: "Direito de solicitar a exclusão de sua conta e dados." }),
									/* @__PURE__ */ jsx("li", { children: "Direito de revogar o consentimento para marketing." })
								]
							})]
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "pt-8 border-t-4 border-ze-gray flex flex-col md:flex-row justify-between items-center gap-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ jsx(Lock, { className: "w-12 h-12 text-ze-yellow" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
									className: "font-black uppercase italic text-ze-black",
									children: "Sua privacidade"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-sm text-ze-black/50 font-bold uppercase tracking-tight",
									children: "é o nosso compromisso"
								})] })]
							}), /* @__PURE__ */ jsx(Button, {
								asChild: true,
								variant: "ze-dark",
								className: "font-black uppercase italic px-10",
								children: /* @__PURE__ */ jsx(Link, {
									href: "/terms",
									children: "Ver Termos de Serviço"
								})
							})]
						})
					]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "text-center text-ze-black/40 font-bold uppercase tracking-widest text-xs mb-12",
				children: [
					"Dúvidas sobre seus dados? ",
					/* @__PURE__ */ jsx("a", {
						href: "mailto:privacidade@entregamais.com",
						className: "text-ze-black underline",
						children: "privacidade@entregamais.com"
					}),
					" ",
					/* @__PURE__ */ jsx("br", {}),
					"© 2026 Entregamais Shop"
				]
			})]
		})
	});
}
//#endregion
//#region src/app/profile/page.tsx
function CustomerProfilePage() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col min-h-screen bg-slate-50",
		children: /* @__PURE__ */ jsx("main", {
			className: "flex-1 container mx-auto px-4 py-12",
			children: /* @__PURE__ */ jsxs("div", {
				className: "max-w-4xl mx-auto",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "mb-10 text-center",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "text-xs font-black uppercase tracking-[0.3em] text-ze-red mb-2",
								children: "Minha Conta"
							}),
							/* @__PURE__ */ jsx("h1", {
								className: "text-5xl font-black uppercase tracking-tighter text-ze-black italic drop-shadow-sm",
								children: "Editar Perfil"
							}),
							/* @__PURE__ */ jsx("div", { className: "w-20 h-1.5 bg-ze-yellow mx-auto mt-4 rounded-full" })
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "bg-white rounded-[3rem] border-4 border-ze-black p-8 md:p-12 shadow-[30px_30px_0px_0px_rgba(34,34,34,0.05)] transform hover:-rotate-1 transition-transform duration-500",
						children: /* @__PURE__ */ jsx(ProfileForm, { role: "customer" })
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-12 grid grid-cols-1 md:grid-cols-3 gap-6",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "bg-ze-yellow/10 p-6 rounded-3xl border-2 border-ze-yellow/20 flex flex-col items-center text-center",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "w-12 h-12 bg-ze-yellow rounded-2xl flex items-center justify-center text-2xl mb-4",
										children: "📍"
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "font-black uppercase text-sm mb-1",
										children: "Meus Endereços"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xs font-bold text-ze-black/50",
										children: "Gerencie seus locais de entrega"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "bg-ze-black/5 p-6 rounded-3xl border-2 border-ze-black/5 flex flex-col items-center text-center",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "w-12 h-12 bg-ze-black text-ze-yellow rounded-2xl flex items-center justify-center text-2xl mb-4",
										children: "💳"
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "font-black uppercase text-sm mb-1",
										children: "Pagamentos"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xs font-bold text-ze-black/50",
										children: "Cartões e métodos salvos"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "bg-ze-red/5 p-6 rounded-3xl border-2 border-ze-red/10 flex flex-col items-center text-center",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "w-12 h-12 bg-ze-red text-white rounded-2xl flex items-center justify-center text-2xl mb-4",
										children: "📦"
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "font-black uppercase text-sm mb-1",
										children: "Pedidos"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xs font-bold text-ze-black/50",
										children: "Histórico de compras"
									})
								]
							})
						]
					})
				]
			})
		})
	});
}
var UserPlus = createLucideIcon("UserPlus", [
	["path", {
		d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
		key: "1yyitq"
	}],
	["circle", {
		cx: "9",
		cy: "7",
		r: "4",
		key: "nufk8"
	}],
	["line", {
		x1: "19",
		x2: "19",
		y1: "8",
		y2: "14",
		key: "1bvyxn"
	}],
	["line", {
		x1: "22",
		x2: "16",
		y1: "11",
		y2: "11",
		key: "1shjgl"
	}]
]);
//#endregion
//#region src/app/register/customer/page.tsx
function CustomerRegistration() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [cpf, setCpf] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const handleRegister = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const resp = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					email,
					cpf,
					password,
					role: "customer"
				})
			});
			if (resp.ok) router.push("/auth/login/customer");
			else setError((await resp.json()).message || "Erro ao realizar cadastro");
		} catch (err) {
			setError("Falha na conexão com o servidor");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsx("main", {
		className: "container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-64px)] bg-ze-gray",
		children: /* @__PURE__ */ jsx(Card, {
			className: "w-full max-w-md border-4 border-ze-black shadow-[12px_12px_0px_0px_rgba(34,34,34,1)] rounded-3xl overflow-hidden",
			children: /* @__PURE__ */ jsxs(CardContent, {
				className: "p-10 bg-white",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "text-center mb-10",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-ze-yellow text-ze-black shadow-xl border-4 border-ze-black mb-8 transform -rotate-3",
								children: /* @__PURE__ */ jsx(UserPlus, { className: "h-10 w-10" })
							}),
							/* @__PURE__ */ jsxs("h1", {
								className: "text-4xl font-black text-ze-black uppercase italic tracking-tighter leading-none",
								children: [
									"Entrar na ",
									/* @__PURE__ */ jsx("br", {}),
									" Rodada"
								]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-ze-black/40 mt-4 font-bold uppercase tracking-widest text-xs",
								children: "Sua bebida gelada a um clique de distância."
							})
						]
					}),
					/* @__PURE__ */ jsxs("form", {
						className: "space-y-4",
						onSubmit: handleRegister,
						children: [
							error && /* @__PURE__ */ jsx("div", {
								className: "bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100",
								children: error
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-black text-ze-black/40 mb-2 uppercase tracking-widest",
								children: "Nome completo"
							}), /* @__PURE__ */ jsx(Input, {
								name: "name",
								placeholder: "Seu Nome",
								value: name,
								onChange: (e) => setName(e.target.value),
								required: true,
								className: "h-12 border-2 border-ze-black rounded-xl font-bold focus-visible:ring-0"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-black text-ze-black/40 mb-2 uppercase tracking-widest",
								children: "E-mail"
							}), /* @__PURE__ */ jsx(Input, {
								name: "email",
								type: "email",
								placeholder: "email@exemplo.com",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								required: true,
								className: "h-12 border-2 border-ze-black rounded-xl font-bold focus-visible:ring-0"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-black text-ze-black/40 mb-2 uppercase tracking-widest",
								children: "CPF (Para validação de idade)"
							}), /* @__PURE__ */ jsx(Input, {
								name: "cpf",
								placeholder: "000.000.000-00",
								value: cpf,
								onChange: (e) => setCpf(e.target.value),
								required: true,
								className: "h-12 border-2 border-ze-black rounded-xl font-bold focus-visible:ring-0"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-black text-ze-black/40 mb-2 uppercase tracking-widest",
								children: "Senha"
							}), /* @__PURE__ */ jsx(Input, {
								name: "password",
								type: "password",
								placeholder: "••••••••",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								required: true,
								className: "h-12 border-2 border-ze-black rounded-xl font-bold focus-visible:ring-0"
							})] }),
							/* @__PURE__ */ jsxs(Button, {
								type: "submit",
								disabled: loading,
								variant: "ze-dark",
								className: "w-full mt-8 h-14 text-lg font-black uppercase italic tracking-tighter group transition-all",
								children: [loading ? "Criando..." : "Criar Conta", /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" })]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-10 text-center text-sm font-bold text-ze-black/40 uppercase tracking-widest",
						children: ["Já tem uma conta? ", /* @__PURE__ */ jsx(Link, {
							href: "/auth/login/customer",
							className: "text-ze-black underline decoration-ze-yellow decoration-4 underline-offset-4 hover:text-ze-red transition-colors ml-2",
							children: "Entrar"
						})]
					})
				]
			})
		})
	});
}
var FilterX = createLucideIcon("FilterX", [
	["path", {
		d: "M13.013 3H2l8 9.46V19l4 2v-8.54l.9-1.055",
		key: "1fi1da"
	}],
	["path", {
		d: "m22 3-5 5",
		key: "12jva0"
	}],
	["path", {
		d: "m17 3 5 5",
		key: "k36vhe"
	}]
]);
//#endregion
//#region src/components/product/ProductCard.tsx
function ProductCard({ product, showStoreLink = false }) {
	const { addItem } = useCart();
	const { showToast } = useToast();
	const [quantity, setQuantity] = useState(1);
	const handleIncrement = () => setQuantity((prev) => prev + 1);
	const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));
	const handleAddToCart = () => {
		addItem({
			product_id: product.id,
			name: product.name,
			price: product.price,
			seller_id: product.seller_id,
			seller_name: product.seller_name || "Depósito",
			image: product.image
		}, quantity);
		showToast(`${quantity}x ${product.name} adicionado ao carrinho!`, "success", "Item Adicionado");
		setQuantity(1);
	};
	const getEmoji = (category) => {
		if (category?.includes("Cerveja")) return "🍻";
		if (category?.includes("Vinho")) return "🍷";
		if (category?.includes("Destilado")) return "🥃";
		if (category?.includes("Gelo")) return "🧊";
		if (category?.includes("Petisco")) return "🥨";
		return "🥤";
	};
	return /* @__PURE__ */ jsxs(Card, {
		className: "overflow-hidden border-2 border-ze-black/10 rounded-3xl hover:border-ze-yellow transition-all hover:-translate-y-2 hover:shadow-2xl bg-white group flex flex-col relative h-full",
		children: [
			showStoreLink && /* @__PURE__ */ jsx(Link, {
				href: `/store/${product.seller_id}`,
				className: "absolute top-3 left-3 z-10",
				children: /* @__PURE__ */ jsx("span", {
					className: "text-[10px] font-black uppercase bg-ze-black text-white px-2 py-1 rounded-lg hover:bg-ze-yellow hover:text-ze-black transition-colors cursor-pointer shadow-md",
					children: "Ver Loja"
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "aspect-square bg-slate-50 flex items-center justify-center p-6 relative",
				children: /* @__PURE__ */ jsx("div", {
					className: "text-6xl group-hover:scale-110 transition-transform duration-500",
					children: getEmoji(product.category)
				})
			}),
			/* @__PURE__ */ jsxs(CardContent, {
				className: "p-5 flex-1 flex flex-col bg-white",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-xs font-bold text-slate-400 uppercase tracking-wider mb-2",
						children: product.category
					}),
					/* @__PURE__ */ jsx("h3", {
						className: "font-black text-lg text-slate-800 leading-tight mb-4 flex-1 group-hover:text-ze-black line-clamp-2",
						children: product.name
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-4 mt-auto pt-4 border-t border-ze-black/5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex items-center justify-between",
							children: /* @__PURE__ */ jsxs("span", {
								className: "font-black text-2xl text-ze-red tracking-tight",
								children: ["R$ ", product.price.toFixed(2).replace(".", ",")]
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-3 mt-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center border-2 border-ze-black rounded-2xl bg-white overflow-hidden shadow-sm h-12 w-full",
								children: [
									/* @__PURE__ */ jsx("button", {
										onClick: handleDecrement,
										className: "flex-1 h-full font-black text-ze-black hover:bg-ze-yellow transition-colors text-xl focus:outline-none border-none disabled:opacity-10",
										disabled: quantity <= 1,
										children: "-"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "flex-[0.5] h-full flex items-center justify-center font-black text-ze-black bg-ze-yellow border-x-2 border-ze-black text-base",
										children: quantity
									}),
									/* @__PURE__ */ jsx("button", {
										onClick: handleIncrement,
										className: "flex-1 h-full font-black text-ze-black hover:bg-ze-yellow transition-colors text-xl focus:outline-none border-none",
										children: "+"
									})
								]
							}), /* @__PURE__ */ jsxs(Button, {
								onClick: handleAddToCart,
								variant: "brand",
								type: "button",
								className: "h-12 min-w-0 !rounded-2xl shadow-lg font-black uppercase text-xs tracking-[0.08em] border-2 border-ze-black w-full inline-flex items-center justify-center",
								children: [/* @__PURE__ */ jsx(ShoppingBag, { className: "w-4 h-4 mr-1.5 shrink-0" }), /* @__PURE__ */ jsx("span", {
									className: "whitespace-nowrap leading-none",
									children: "Adicionar"
								})]
							})]
						})]
					})
				]
			})
		]
	});
}
//#endregion
//#region src/app/search/page.tsx
function normalizeProductsResponse(payload) {
	if (Array.isArray(payload)) return payload;
	if (payload && typeof payload === "object") {
		const candidate = payload.data;
		if (Array.isArray(candidate)) return candidate;
	}
	return [];
}
function SearchResults() {
	const { addItem } = useCart();
	const searchParams = useSearchParams();
	const q = searchParams.get("q") || "";
	const category = searchParams.get("category") || "";
	const router = useRouter();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState(q);
	useEffect(() => {
		async function fetchSearch() {
			setLoading(true);
			try {
				const queryParams = new URLSearchParams();
				if (q) queryParams.set("q", q);
				if (category) queryParams.set("category", category);
				const res = await fetch(`/api/v1/products?${queryParams.toString()}`);
				if (res.ok) setProducts(normalizeProductsResponse(await res.json()));
				else setProducts([]);
			} catch (err) {
				console.error(err);
				setProducts([]);
			} finally {
				setLoading(false);
			}
		}
		fetchSearch();
		setSearchQuery(q);
	}, [q, category]);
	const handleSearch = (e) => {
		e.preventDefault();
		router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-8",
		children: [/* @__PURE__ */ jsx("div", {
			className: "bg-white rounded-3xl shadow-xl p-6 border-4 border-ze-black -mt-6 relative z-10 mx-auto max-w-4xl",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSearch,
				className: "flex flex-col md:flex-row gap-4 items-center",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex-1 w-full relative",
						children: [/* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-ze-black/40 w-6 h-6" }), /* @__PURE__ */ jsx(Input, {
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							placeholder: "Pesquisar produtos...",
							className: "pl-14 h-14 text-xl font-bold rounded-2xl border-2 border-ze-black/10 focus-visible:ring-ze-yellow"
						})]
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "submit",
						variant: "ze-dark",
						className: "h-14 px-8 rounded-2xl text-lg font-black shrink-0 w-full md:w-auto",
						children: "Buscar"
					}),
					(q || category) && /* @__PURE__ */ jsx(Link, {
						href: "/search",
						className: "shrink-0",
						children: /* @__PURE__ */ jsxs(Button, {
							type: "button",
							variant: "ghost",
							className: "h-14 px-6 text-ze-red hover:bg-ze-red/10 rounded-2xl",
							children: [/* @__PURE__ */ jsx(FilterX, { className: "w-5 h-5 mr-2" }), " Limpar"]
						})
					})
				]
			})
		}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
			className: "text-xl sm:text-2xl font-black text-ze-black uppercase tracking-tight mb-6 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4",
			children: [/* @__PURE__ */ jsx("span", {
				className: "truncate",
				children: category ? `Categoria: ${category}` : q ? `Resultados para "${q}"` : "Todos os Produtos"
			}), /* @__PURE__ */ jsxs("span", {
				className: "text-xs sm:text-sm font-bold text-slate-400 lowercase tracking-normal",
				children: [
					"(",
					products.length,
					" encontrados)"
				]
			})]
		}), loading ? /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
			children: [
				1,
				2,
				3,
				4
			].map((i) => /* @__PURE__ */ jsx("div", { className: "h-64 bg-slate-200 animate-pulse rounded-3xl" }, i))
		}) : products.length === 0 ? /* @__PURE__ */ jsxs("div", {
			className: "text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-300",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "text-6xl mb-4 opacity-50",
					children: "🏜️"
				}),
				/* @__PURE__ */ jsx("h3", {
					className: "text-2xl font-black text-slate-800 uppercase tracking-tight",
					children: "Nenhum produto encontrado"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-slate-500 mt-2 font-bold",
					children: "Tente usar outros termos de busca."
				})
			]
		}) : /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6",
			children: products.map((product) => /* @__PURE__ */ jsx(ProductCard, {
				product,
				showStoreLink: true
			}, product.id))
		})] })]
	});
}
function SearchPage() {
	return /* @__PURE__ */ jsxs("main", {
		className: "container mx-auto px-4 py-8 md:py-12 pb-32",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-8 md:mb-12 text-center bg-ze-yellow py-8 md:py-12 px-4 rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-ze-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]",
			children: [/* @__PURE__ */ jsx("h1", {
				className: "text-3xl sm:text-5xl md:text-7xl font-black text-ze-black uppercase italic tracking-tighter drop-shadow-sm leading-tight",
				children: "Busca Gelada"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm sm:text-lg md:text-xl font-bold uppercase tracking-widest text-ze-black/70 mt-2",
				children: "Encontre sua bebida favorita"
			})]
		}), /* @__PURE__ */ jsx(Suspense, {
			fallback: /* @__PURE__ */ jsx("div", { className: "h-32 bg-slate-100 rounded-3xl animate-pulse max-w-4xl mx-auto -mt-6 border-4 border-dashed border-slate-300" }),
			children: /* @__PURE__ */ jsx(SearchResults, {})
		})]
	});
}
//#endregion
//#region src/app/store/[id]/page.tsx
function StorePage() {
	const id = useParams().id;
	const [store, setStore] = useState(null);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedScore, setSelectedScore] = useState(5);
	const [comment, setComment] = useState("");
	const [isSubmittingReview, setIsSubmittingReview] = useState(false);
	const [reviewFeedback, setReviewFeedback] = useState("");
	useEffect(() => {
		async function loadData() {
			try {
				const [storeData, productsData] = await Promise.all([apiFetch(`/api/v1/sellers/${id}`), apiFetch(`/api/v1/sellers/${id}/products`)]);
				setStore(storeData);
				setProducts(productsData);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, [id]);
	if (loading) return /* @__PURE__ */ jsx("div", {
		className: "min-h-[50vh] flex items-center justify-center font-black text-2xl uppercase tracking-tighter text-ze-black animate-pulse",
		children: "Carregando..."
	});
	if (!store) return /* @__PURE__ */ jsx("div", {
		className: "min-h-[50vh] flex items-center justify-center font-black text-4xl text-ze-red uppercase tracking-tighter",
		children: "Depósito não encontrado"
	});
	async function handleSubmitReview(event) {
		event.preventDefault();
		setIsSubmittingReview(true);
		setReviewFeedback("");
		try {
			await apiFetch(`/api/v1/sellers/${id}/reviews`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					score: selectedScore,
					comment
				})
			});
			setStore(await apiFetch(`/api/v1/sellers/${id}`));
			setComment("");
			setSelectedScore(5);
			setReviewFeedback("Avaliacao enviada com sucesso.");
		} catch (error) {
			setReviewFeedback("Nao foi possivel enviar sua avaliacao. Verifique se voce esta autenticado como cliente.");
		} finally {
			setIsSubmittingReview(false);
		}
	}
	return /* @__PURE__ */ jsxs("main", {
		className: "container mx-auto px-4 py-6 md:py-8 pb-32",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "relative w-full min-h-[200px] md:h-[400px] rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-ze-black bg-ze-dark mb-8 md:mb-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]",
				children: /* @__PURE__ */ jsxs("div", {
					className: "absolute inset-0 bg-gradient-to-r from-ze-black/90 to-transparent p-6 md:p-12 flex flex-col justify-end",
					children: [
						/* @__PURE__ */ jsx(Badge, {
							className: "bg-ze-yellow text-ze-black hover:bg-ze-yellow hover:text-ze-black font-black uppercase text-[10px] md:text-sm mb-2 md:mb-4 w-fit px-3 md:px-4 py-1 animate-bounce",
							children: store.category || "Depósito"
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-xl leading-none",
							children: store.name
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-2 md:gap-6 mt-4 md:mt-6 items-center flex-wrap",
							children: [
								/* @__PURE__ */ jsxs("span", {
									className: "flex items-center text-ze-yellow font-bold bg-ze-black/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm text-sm md:text-lg border border-ze-yellow/20",
									children: [
										/* @__PURE__ */ jsx(Star, { className: "w-4 h-4 md:w-6 md:h-6 mr-1.5 md:mr-2 fill-current" }),
										" ",
										(store.rating ?? 5).toFixed(1)
									]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "flex items-center text-white font-bold bg-ze-black/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm text-sm md:text-lg",
									children: [
										/* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 md:w-6 md:h-6 mr-1.5 md:mr-2 text-ze-yellow" }),
										" ",
										store.time || "Calculando..."
									]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "flex items-center text-white uppercase tracking-widest font-black bg-ze-red px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-lg shadow-lg",
									children: store.fee_label || `A partir de R$ ${(store.min_delivery_fee ?? 0).toFixed(2).replace(".", ",")}`
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-6 mb-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]",
				children: [/* @__PURE__ */ jsxs("section", {
					className: "rounded-[2rem] border-2 border-ze-black/10 bg-white p-6",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-xs font-black uppercase tracking-[0.25em] text-ze-red",
						children: "Locais atendidos"
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-4 grid gap-3 md:grid-cols-2",
						children: [(store.delivery_areas || []).map((area) => /* @__PURE__ */ jsxs("div", {
							className: "rounded-2xl border border-ze-black/10 bg-ze-gray px-4 py-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-ze-black",
								children: [/* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-ze-red" }), /* @__PURE__ */ jsx("span", {
									className: "font-black uppercase tracking-tight",
									children: area.label
								})]
							}), /* @__PURE__ */ jsxs("p", {
								className: "mt-2 text-sm font-bold text-ze-black/65",
								children: ["Frete ", area.fee_label || `R$ ${area.fee.toFixed(2).replace(".", ",")}`]
							})]
						}, area.id)), (store.delivery_areas || []).length === 0 && /* @__PURE__ */ jsx("p", {
							className: "text-sm font-bold text-ze-black/60",
							children: "Este deposito ainda nao cadastrou areas de entrega. O frete minimo atual e R$ 0,00."
						})]
					})]
				}), /* @__PURE__ */ jsxs("section", {
					className: "rounded-[2rem] border-2 border-ze-black/10 bg-white p-6",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-xs font-black uppercase tracking-[0.25em] text-ze-red",
							children: "Sua avaliacao"
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-2 text-2xl font-black uppercase tracking-tight text-ze-black",
							children: "Avalie este deposito"
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-2 text-sm font-bold text-ze-black/60",
							children: [
								"Media atual ",
								(store.rating ?? 5).toFixed(1),
								" com ",
								store.review_count ?? 0,
								" avaliacoes."
							]
						}),
						/* @__PURE__ */ jsxs("form", {
							className: "mt-5 space-y-4",
							onSubmit: handleSubmitReview,
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "flex flex-wrap gap-2",
									children: [
										1,
										2,
										3,
										4,
										5
									].map((score) => /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setSelectedScore(score),
										className: `flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-lg transition ${selectedScore === score ? "border-ze-black bg-ze-yellow text-ze-black" : "border-ze-black/10 bg-ze-gray text-ze-black/50 hover:border-ze-black"}`,
										"aria-label": `Selecionar nota ${score}`,
										children: /* @__PURE__ */ jsx(Star, { className: `h-5 w-5 ${selectedScore >= score ? "fill-current" : ""}` })
									}, score))
								}),
								/* @__PURE__ */ jsx(Input, {
									value: comment,
									onChange: (event) => setComment(event.target.value),
									placeholder: "Conte rapidamente como foi sua experiencia",
									className: "h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold"
								}),
								reviewFeedback && /* @__PURE__ */ jsx("p", {
									className: "text-sm font-bold text-ze-black/70",
									children: reviewFeedback
								}),
								/* @__PURE__ */ jsx(Button, {
									type: "submit",
									variant: "ze-dark",
									className: "w-full uppercase",
									disabled: isSubmittingReview,
									children: isSubmittingReview ? "Enviando..." : "Enviar avaliacao"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex items-center justify-between mb-6 md:mb-8",
				children: /* @__PURE__ */ jsx("h2", {
					className: "text-xl md:text-3xl font-black text-ze-black uppercase tracking-tighter",
					children: "Produtos Gelados"
				})
			}),
			products.length === 0 ? /* @__PURE__ */ jsx("p", {
				className: "text-ze-black/60 font-bold uppercase text-center py-12 text-xl",
				children: "Este depósito ainda não tem produtos listados."
			}) : /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6",
				children: products.map((product) => /* @__PURE__ */ jsx(ProductCard, { product: {
					...product,
					seller_id: store.id,
					seller_name: store.name
				} }, product.id))
			})
		]
	});
}
var Scale = createLucideIcon("Scale", [
	["path", {
		d: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",
		key: "7g6ntu"
	}],
	["path", {
		d: "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",
		key: "ijws7r"
	}],
	["path", {
		d: "M7 21h10",
		key: "1b0cd5"
	}],
	["path", {
		d: "M12 3v18",
		key: "108xh3"
	}],
	["path", {
		d: "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",
		key: "3gwbw2"
	}]
]);
//#endregion
//#region src/app/terms/page.tsx
function TermsOfService() {
	return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-ze-gray",
		children: /* @__PURE__ */ jsxs("main", {
			className: "container mx-auto px-4 py-12 max-w-4xl",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "bg-white border-4 border-ze-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(34,34,34,1)] mb-12",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "bg-ze-black text-white p-10 md:p-16 relative overflow-hidden",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "relative z-10",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "inline-flex items-center justify-center p-3 bg-ze-yellow text-ze-black rounded-2xl mb-6 transform -rotate-2",
								children: /* @__PURE__ */ jsx(Scale, { className: "w-8 h-8" })
							}),
							/* @__PURE__ */ jsxs("h1", {
								className: "text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4",
								children: [
									"Termos de ",
									/* @__PURE__ */ jsx("br", {}),
									" Serviço"
								]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-ze-yellow font-bold uppercase tracking-widest text-sm",
								children: "Atualizado em 08 de Abril de 2026"
							})
						]
					}), /* @__PURE__ */ jsx(FileText, { className: "absolute -bottom-10 -right-10 w-64 h-64 text-white/5 transform rotate-12" })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "p-8 md:p-16 space-y-12",
					children: [
						/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-8 h-8 bg-ze-yellow border-2 border-ze-black rounded-lg flex items-center justify-center text-ze-black",
								children: "1"
							}), "Aceitação dos Termos"]
						}), /* @__PURE__ */ jsxs("div", {
							className: "prose prose-ze text-ze-black/70 font-medium leading-relaxed",
							children: [/* @__PURE__ */ jsx("p", { children: "Ao acessar ou utilizar a plataforma Entregamais, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não poderá utilizar nossos serviços." }), /* @__PURE__ */ jsx("p", {
								className: "mt-4",
								children: "O Entregamais reserva-se o direito de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor."
							})]
						})] }),
						/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-8 h-8 bg-ze-yellow border-2 border-ze-black rounded-lg flex items-center justify-center text-ze-black",
								children: "2"
							}), "Elegibilidade e Cadastro"]
						}), /* @__PURE__ */ jsxs("div", {
							className: "prose prose-ze text-ze-black/70 font-medium leading-relaxed",
							children: [/* @__PURE__ */ jsx("p", { children: "A venda de bebidas alcoólicas é estritamente proibida para menores de 18 anos. Ao utilizar o Entregamais, você declara ter idade legal para consumir álcool em sua jurisdição." }), /* @__PURE__ */ jsxs("ul", {
								className: "list-disc ml-6 mt-4 space-y-2",
								children: [
									/* @__PURE__ */ jsx("li", { children: "Você é responsável por manter a confidencialidade de sua conta." }),
									/* @__PURE__ */ jsx("li", { children: "Você deve fornecer informações precisas e completas durante o registro." }),
									/* @__PURE__ */ jsx("li", { children: "O uso de CPFs falsos resultará no banimento imediato da plataforma." })
								]
							})]
						})] }),
						/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-8 h-8 bg-ze-yellow border-2 border-ze-black rounded-lg flex items-center justify-center text-ze-black",
								children: "3"
							}), "Uso do Serviço"]
						}), /* @__PURE__ */ jsxs("div", {
							className: "prose prose-ze text-ze-black/70 font-medium leading-relaxed",
							children: [/* @__PURE__ */ jsx("p", { children: "O Entregamais conecta consumidores a vendedores de bebidas e entregadores independentes. Não somos fabricantes das bebidas, mas garantimos a qualidade do serviço de entrega através de nossos parceiros selecionados." }), /* @__PURE__ */ jsx("p", {
								className: "mt-4 font-bold border-l-4 border-ze-yellow pl-4 italic",
								children: "\"Sua bebida deve chegar gelada. Se chegar quente, entre em contato com nosso suporte imediatamente.\""
							})]
						})] }),
						/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-black uppercase italic tracking-tight text-ze-black mb-6 flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-8 h-8 bg-ze-yellow border-2 border-ze-black rounded-lg flex items-center justify-center text-ze-black",
								children: "4"
							}), "Pagamentos e Cancelamentos"]
						}), /* @__PURE__ */ jsxs("div", {
							className: "prose prose-ze text-ze-black/70 font-medium leading-relaxed",
							children: [/* @__PURE__ */ jsx("p", { children: "Aceitamos pagamentos via Cartão de Crédito, Débito e PIX. Os preços exibidos incluem os impostos aplicáveis, mas as taxas de entrega são calculadas separadamente com base na sua localização." }), /* @__PURE__ */ jsx("p", {
								className: "mt-4",
								children: "Cancelamentos podem ser feitos sem custo adicional até que o vendedor aceite o pedido. Após a aceitação, uma taxa de cancelamento pode ser aplicada."
							})]
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "pt-8 border-t-4 border-ze-gray flex flex-col md:flex-row justify-between items-center gap-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-12 h-12 text-ze-yellow" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
									className: "font-black uppercase italic text-ze-black",
									children: "Segurança Primeiro"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-sm text-ze-black/50 font-bold uppercase tracking-tight",
									children: "Privacidade e dados protegidos"
								})] })]
							}), /* @__PURE__ */ jsx(Button, {
								asChild: true,
								variant: "ze-dark",
								className: "font-black uppercase italic px-10",
								children: /* @__PURE__ */ jsx(Link, {
									href: "/privacy",
									children: "Ver Política de Privacidade"
								})
							})]
						})
					]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "text-center text-ze-black/40 font-bold uppercase tracking-widest text-xs mb-12",
				children: [
					"© 2026 Entregamais - Todos os direitos reservados. ",
					/* @__PURE__ */ jsx("br", {}),
					"Beba com moderação. Se dirigir, não beba."
				]
			})]
		})
	});
}
var Printer = createLucideIcon("Printer", [
	["path", {
		d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
		key: "143wyd"
	}],
	["path", {
		d: "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",
		key: "1itne7"
	}],
	["rect", {
		x: "6",
		y: "14",
		width: "12",
		height: "8",
		rx: "1",
		key: "1ue0tg"
	}]
]);
var BellRing = createLucideIcon("BellRing", [
	["path", {
		d: "M10.268 21a2 2 0 0 0 3.464 0",
		key: "vwvbt9"
	}],
	["path", {
		d: "M22 8c0-2.3-.8-4.3-2-6",
		key: "5bb3ad"
	}],
	["path", {
		d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
		key: "11g9vi"
	}],
	["path", {
		d: "M4 2C2.8 3.7 2 5.7 2 8",
		key: "tap9e0"
	}]
]);
//#endregion
//#region src/app/vendedor/orders/page.tsx
function SellerOrders() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [lastOrderCount, setLastOrderCount] = useState(0);
	const fetchOrders = async () => {
		try {
			const data = await apiFetch("/api/v1/vendedor/orders");
			setOrders(data);
			const newOrders = data.filter((o) => o.status === "created").length;
			if (newOrders > lastOrderCount) console.log("🔔 Novo pedido recebido!");
			setLastOrderCount(newOrders);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchOrders();
		const int = setInterval(fetchOrders, 4e3);
		return () => clearInterval(int);
	}, [lastOrderCount]);
	const handleStatus = async (id, action) => {
		try {
			if (action === "confirm") await apiFetch(`/api/v1/vendedor/orders/${id}/confirm`, { method: "POST" });
			else if (action === "ready") await apiFetch(`/api/v1/vendedor/orders/${id}/ready`, { method: "POST" });
			fetchOrders();
		} catch (err) {
			console.error(err);
		}
	};
	const parseAddress = (jsonStr) => {
		try {
			return JSON.parse(jsonStr).raw || "Endereço não disponível";
		} catch (e) {
			return "Endereço padrão";
		}
	};
	const renderOrderCard = (order, nextAction) => /* @__PURE__ */ jsxs("div", {
		className: "bg-white border-2 border-ze-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all mb-6 group relative overflow-hidden",
		children: [
			order.status === "created" && /* @__PURE__ */ jsx("div", {
				className: "absolute top-0 right-0 bg-ze-red text-white font-black text-[10px] px-4 py-1 uppercase italic tracking-widest rounded-bl-xl animate-pulse",
				children: "Urgente"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex justify-between items-start mb-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", {
					className: "font-black text-ze-black text-xl uppercase italic tracking-tighter",
					children: ["#", order.id.split("-")[0]]
				}), /* @__PURE__ */ jsxs("p", {
					className: "text-[10px] font-bold text-ze-black/40 uppercase tracking-widest flex items-center gap-1",
					children: [
						/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
						" ",
						new Date(order.created_at).toLocaleTimeString()
					]
				})] }), /* @__PURE__ */ jsx("div", {
					className: "flex gap-2",
					children: /* @__PURE__ */ jsx("button", {
						className: "p-2 hover:bg-ze-gray rounded-lg transition-colors text-ze-black/20 hover:text-ze-black",
						children: /* @__PURE__ */ jsx(Printer, { className: "w-4 h-4" })
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-start gap-3 bg-ze-gray p-4 rounded-2xl mb-4 border border-ze-black/5",
				children: [/* @__PURE__ */ jsx(MapPin, { className: "w-5 h-5 text-ze-red shrink-0 mt-1" }), /* @__PURE__ */ jsx("p", {
					className: "text-sm font-black text-ze-black leading-tight uppercase",
					children: parseAddress(order.delivery_address_json)
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "space-y-2 mb-6",
				children: order.edges?.items?.map((item, idx) => /* @__PURE__ */ jsxs("div", {
					className: "flex justify-between items-center text-sm",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "w-6 h-6 bg-ze-yellow flex items-center justify-center rounded-lg font-black text-[10px] border border-ze-black/10",
							children: item.quantity
						}), /* @__PURE__ */ jsx("span", {
							className: "font-bold text-ze-black uppercase tracking-tight",
							children: item.product?.name || "Produto"
						})]
					}), /* @__PURE__ */ jsxs("span", {
						className: "font-bold text-ze-black/40",
						children: ["R$ ", item.unit_price.toFixed(2)]
					})]
				}, idx))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "pt-4 border-t-2 border-ze-black/5 flex items-center justify-between gap-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "text-right",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-[10px] font-bold text-ze-black/40 uppercase tracking-widest",
							children: "Total"
						}), /* @__PURE__ */ jsxs("p", {
							className: "font-black text-2xl text-ze-black tracking-tighter",
							children: ["R$ ", order.total_amount.toFixed(2)]
						})]
					}),
					nextAction === "confirm" && /* @__PURE__ */ jsx(Button, {
						onClick: () => handleStatus(order.id, "confirm"),
						className: "flex-1 bg-ze-yellow hover:bg-ze-black text-ze-black hover:text-white font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-lg transform active:scale-95 transition-all",
						children: "Aceitar Pedido"
					}),
					nextAction === "ready" && /* @__PURE__ */ jsx(Button, {
						onClick: () => handleStatus(order.id, "ready"),
						className: "flex-1 bg-ze-black hover:bg-ze-yellow text-white hover:text-ze-black font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-lg transform active:scale-95 transition-all",
						children: "Pronto p/ Entrega"
					}),
					!nextAction && /* @__PURE__ */ jsx(Badge, {
						className: "bg-ze-gray text-ze-black/40 font-black uppercase tracking-widest h-14 flex-1 rounded-2xl border-2 border-ze-black/5",
						children: "Aguardando Coleta"
					})
				]
			})
		]
	}, order.id);
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Painel do Lojista",
		role: "vendedor",
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-180px)]",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col h-full space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between px-2",
						children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(BellRing, { className: "w-6 h-6 text-ze-red animate-bounce" }), " Novos"]
						}), /* @__PURE__ */ jsx(Badge, {
							className: "bg-ze-red text-white font-black rounded-lg",
							children: orders.filter((o) => o.status === "created").length
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex-1 overflow-y-auto pr-2 custom-scrollbar",
						children: [orders.filter((o) => o.status === "created").map((o) => renderOrderCard(o, "confirm")), orders.filter((o) => o.status === "created").length === 0 && /* @__PURE__ */ jsx("div", {
							className: "h-40 border-4 border-dashed border-ze-black/5 rounded-[2.5rem] flex items-center justify-center text-ze-black/20 font-black uppercase tracking-widest text-sm text-center p-8",
							children: "Nenhum pedido novo no momento"
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col h-full space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between px-2",
						children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Clock, { className: "w-6 h-6 text-ze-yellow" }), " Em Preparo"]
						}), /* @__PURE__ */ jsx(Badge, {
							className: "bg-ze-yellow text-ze-black font-black rounded-lg",
							children: orders.filter((o) => o.status === "confirmed").length
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex-1 overflow-y-auto pr-2 custom-scrollbar",
						children: [orders.filter((o) => o.status === "confirmed").map((o) => renderOrderCard(o, "ready")), orders.filter((o) => o.status === "confirmed").length === 0 && /* @__PURE__ */ jsx("div", {
							className: "h-40 border-4 border-dashed border-ze-black/5 rounded-[2.5rem] flex items-center justify-center text-ze-black/20 font-black uppercase tracking-widest text-sm text-center p-8",
							children: "Tudo sob controle por aqui"
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col h-full space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between px-2",
						children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(ShoppingBag, { className: "w-6 h-6 text-green-500" }), " Prontos"]
						}), /* @__PURE__ */ jsx(Badge, {
							className: "bg-green-500 text-white font-black rounded-lg",
							children: orders.filter((o) => o.status === "ready").length
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex-1 overflow-y-auto pr-2 custom-scrollbar opacity-60",
						children: [orders.filter((o) => o.status === "ready").map((o) => renderOrderCard(o)), orders.filter((o) => o.status === "ready").length === 0 && /* @__PURE__ */ jsx("div", {
							className: "h-40 border-4 border-dashed border-ze-black/5 rounded-[2.5rem] flex items-center justify-center text-ze-black/20 font-black uppercase tracking-widest text-sm text-center p-8",
							children: "Nenhum pronto aguardando"
						})]
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/app/vendedor/products/page.tsx
function SellerProductsPage() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		name: "",
		description: "",
		price: ""
	});
	const { showToast } = useToast();
	async function loadProducts() {
		try {
			setProducts(await apiFetch("/api/v1/vendedor/products"));
		} catch (error) {
			showToast("Erro ao carregar produtos", "error");
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		loadProducts();
	}, []);
	async function handleSubmit(event) {
		event.preventDefault();
		setSaving(true);
		try {
			await apiFetch("/api/v1/vendedor/products", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: form.name.trim(),
					description: form.description.trim(),
					price: Number(form.price)
				})
			});
			setForm({
				name: "",
				description: "",
				price: ""
			});
			showToast("Produto cadastrado com sucesso!", "success");
			await loadProducts();
		} catch (error) {
			showToast("Erro ao cadastrar produto", "error");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Produtos",
		role: "vendedor",
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 gap-8 xl:grid-cols-[420px_minmax(0,1fr)]",
			children: [/* @__PURE__ */ jsx(Card, {
				className: "rounded-[2.5rem] border-2 border-ze-black/10",
				children: /* @__PURE__ */ jsxs(CardContent, {
					className: "p-8",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "mb-6",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs font-black uppercase tracking-[0.25em] text-ze-red",
							children: "Novo produto"
						}), /* @__PURE__ */ jsx("h2", {
							className: "mt-2 text-3xl font-black uppercase tracking-tighter text-ze-black",
							children: "Cadastrar item"
						})]
					}), /* @__PURE__ */ jsxs("form", {
						className: "space-y-4",
						onSubmit: handleSubmit,
						children: [
							/* @__PURE__ */ jsx(Input, {
								name: "name",
								placeholder: "Nome do produto",
								value: form.name,
								onChange: (event) => setForm((current) => ({
									...current,
									name: event.target.value
								})),
								className: "h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold",
								required: true
							}),
							/* @__PURE__ */ jsx(Input, {
								name: "description",
								placeholder: "Descrição curta",
								value: form.description,
								onChange: (event) => setForm((current) => ({
									...current,
									description: event.target.value
								})),
								className: "h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold"
							}),
							/* @__PURE__ */ jsx(Input, {
								name: "price",
								type: "number",
								min: "0.01",
								step: "0.01",
								placeholder: "15.90",
								value: form.price,
								onChange: (event) => setForm((current) => ({
									...current,
									price: event.target.value
								})),
								className: "h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold",
								required: true
							}),
							/* @__PURE__ */ jsx(Button, {
								type: "submit",
								disabled: saving,
								className: "h-14 w-full rounded-2xl bg-ze-black text-white hover:bg-ze-yellow hover:text-ze-black",
								children: saving ? "Salvando..." : "Salvar produto"
							})
						]
					})]
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-xs font-black uppercase tracking-[0.25em] text-ze-red",
					children: "Catálogo"
				}), /* @__PURE__ */ jsx("h2", {
					className: "mt-2 text-3xl font-black uppercase tracking-tighter text-ze-black",
					children: "Produtos cadastrados"
				})] }), loading ? /* @__PURE__ */ jsx(Card, {
					className: "rounded-[2.5rem] border-2 border-dashed border-ze-black/10",
					children: /* @__PURE__ */ jsx(CardContent, {
						className: "p-10 text-center font-black uppercase tracking-widest text-ze-black/40",
						children: "Carregando catálogo..."
					})
				}) : products.length === 0 ? /* @__PURE__ */ jsx(Card, {
					className: "rounded-[2.5rem] border-2 border-dashed border-ze-black/10",
					children: /* @__PURE__ */ jsx(CardContent, {
						className: "p-10 text-center font-black uppercase tracking-widest text-ze-black/40",
						children: "Nenhum produto cadastrado ainda"
					})
				}) : products.map((product) => /* @__PURE__ */ jsx(Card, {
					className: "rounded-[2rem] border-2 border-ze-black/10",
					children: /* @__PURE__ */ jsxs(CardContent, {
						className: "flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "text-xl font-black uppercase tracking-tight text-ze-black",
							children: product.name
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-sm font-bold text-ze-black/60",
							children: product.description || "Sem descrição informada."
						})] }), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx(Badge, {
								className: "bg-ze-gray text-ze-black border border-ze-black/10 font-black uppercase",
								children: product.status
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-2xl font-black text-ze-red",
								children: ["R$ ", product.price.toFixed(2).replace(".", ",")]
							})]
						})]
					})
				}, product.id))]
			})]
		})
	});
}
//#endregion
//#region src/app/vendedor/profile/page.tsx
function SellerProfilePage() {
	return /* @__PURE__ */ jsx(PortalLayout, {
		title: "Perfil do Lojista",
		role: "vendedor",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-4xl mx-auto",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-8",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-xs font-black uppercase tracking-[0.25em] text-ze-red",
						children: "Gestão de Perfil"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-2 text-4xl font-black uppercase tracking-tighter text-ze-black italic",
						children: "Informações do Lojista"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-3 text-sm font-bold text-ze-black/60 max-w-xl",
						children: "Atualize seus dados pessoais e as informações do seu depósito para melhorar sua visibilidade na plataforma."
					})
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "bg-white rounded-[2.5rem] border-2 border-ze-black/5 p-6 md:p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.02)]",
				children: /* @__PURE__ */ jsx(ProfileForm, { role: "vendedor" })
			})]
		})
	});
}
var Bike = createLucideIcon("Bike", [
	["circle", {
		cx: "18.5",
		cy: "17.5",
		r: "3.5",
		key: "15x4ox"
	}],
	["circle", {
		cx: "5.5",
		cy: "17.5",
		r: "3.5",
		key: "1noe27"
	}],
	["circle", {
		cx: "15",
		cy: "5",
		r: "1",
		key: "19l28e"
	}],
	["path", {
		d: "M12 17.5V14l-3-3 4-3 2 3h2",
		key: "1npguv"
	}]
]);
//#endregion
//#region src/components/layout/Sidebar.tsx
function Sidebar({ role, currentRoute = "/dashboard", className }) {
	const links = role === "vendedor" ? [
		{
			href: "/vendedor/dashboard",
			icon: LayoutDashboard,
			label: "Dashboard"
		},
		{
			href: "/vendedor/orders",
			icon: ShoppingBag,
			label: "Pedidos"
		},
		{
			href: "/vendedor/products",
			icon: Package,
			label: "Produtos e Estoque"
		},
		{
			href: "/vendedor/settings",
			icon: Settings,
			label: "Configurações"
		}
	] : [
		{
			href: "/entregador/dashboard",
			icon: LayoutDashboard,
			label: "Painel"
		},
		{
			href: "/entregador/queue",
			icon: Bike,
			label: "Fila de Entregas"
		},
		{
			href: "/entregador/history",
			icon: ShoppingBag,
			label: "Histórico"
		},
		{
			href: "/entregador/settings",
			icon: Settings,
			label: "Conta"
		}
	];
	return /* @__PURE__ */ jsxs("aside", {
		className: cn("hidden lg:flex w-64 flex-col bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-64px)]", className),
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex-1 py-6 px-4 space-y-1",
			children: links.map((link) => {
				const Icon = link.icon;
				return /* @__PURE__ */ jsxs(Link, {
					href: link.href,
					className: cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium", "hover:bg-slate-800 hover:text-white"),
					children: [/* @__PURE__ */ jsx(Icon, { className: cn("h-5 w-5", false) }), link.label]
				}, link.href);
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "p-4 border-t border-slate-800",
			children: /* @__PURE__ */ jsxs(Link, {
				href: "/",
				className: "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-slate-400 hover:bg-slate-800 hover:text-white",
				children: [/* @__PURE__ */ jsx(LogOut, { className: "h-5 w-5" }), "Sair"]
			})
		})]
	});
}
//#endregion
//#region src/app/vendedor/settings/page.tsx
function SellerSettingsPage() {
	const [seller, setSeller] = useState(null);
	const [areas, setAreas] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [feedback, setFeedback] = useState("");
	useEffect(() => {
		async function loadProfile() {
			try {
				const profile = await apiFetch("/api/v1/vendedor/profile");
				setSeller(profile);
				setAreas((profile.delivery_areas || []).map((area) => ({
					id: area.id,
					label: area.label,
					fee: area.fee.toFixed(2).replace(".", ",")
				})));
			} catch (error) {
				setFeedback("Nao foi possivel carregar as configuracoes do deposito.");
			} finally {
				setIsLoading(false);
			}
		}
		loadProfile();
	}, []);
	function updateArea(id, field, value) {
		setAreas((current) => current.map((area) => area.id === id ? {
			...area,
			[field]: value
		} : area));
	}
	function addArea() {
		setAreas((current) => [...current, {
			id: `new-${Date.now()}`,
			label: "",
			fee: "0,00"
		}]);
	}
	function removeArea(id) {
		setAreas((current) => current.filter((area) => area.id !== id));
	}
	async function handleSave() {
		setIsSaving(true);
		setFeedback("");
		try {
			await apiFetch("/api/v1/vendedor/delivery-areas", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ areas: areas.filter((area) => area.label.trim()).map((area) => ({
					label: area.label.trim(),
					fee: Number(area.fee.replace(",", ".")) || 0
				})) })
			});
			setFeedback("Locais atendidos e fretes atualizados com sucesso.");
		} catch (error) {
			setFeedback("Nao foi possivel salvar os locais atendidos.");
		} finally {
			setIsSaving(false);
		}
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "flex bg-slate-50 min-h-screen",
		children: [/* @__PURE__ */ jsx(Sidebar, {
			role: "vendedor",
			currentRoute: "/vendedor/settings"
		}), /* @__PURE__ */ jsx("main", {
			className: "flex-1 p-8",
			children: /* @__PURE__ */ jsxs("div", {
				className: "max-w-5xl",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-xs font-black uppercase tracking-[0.25em] text-ze-red",
						children: "Configuracoes"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-2 text-4xl font-black uppercase tracking-tighter text-ze-black",
						children: "Frete e areas atendidas"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-3 text-sm font-bold text-ze-black/60",
						children: "Defina os locais que o seu deposito atende e o preco de frete de cada um deles."
					}),
					seller && /* @__PURE__ */ jsxs("div", {
						className: "mt-6 rounded-3xl border-2 border-ze-black/10 bg-white px-6 py-5",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "text-xs font-black uppercase tracking-[0.25em] text-ze-black/40",
								children: "Deposito"
							}),
							/* @__PURE__ */ jsx("h2", {
								className: "mt-2 text-2xl font-black uppercase tracking-tight text-ze-black",
								children: seller.name
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-2 text-sm font-bold text-ze-black/60",
								children: ["Frete minimo atual: ", seller.fee_label || `A partir de R$ ${(seller.min_delivery_fee ?? 0).toFixed(2).replace(".", ",")}`]
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-8 space-y-4",
						children: areas.map((area, index) => /* @__PURE__ */ jsxs("div", {
							className: "grid gap-3 rounded-3xl border-2 border-ze-black/10 bg-white p-5 md:grid-cols-[minmax(0,1fr)_180px_auto]",
							children: [
								/* @__PURE__ */ jsx(Input, {
									value: area.label,
									onChange: (event) => updateArea(area.id, "label", event.target.value),
									placeholder: `Local ${index + 1} ex: Cabo Frio`,
									className: "h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold"
								}),
								/* @__PURE__ */ jsx(Input, {
									value: area.fee,
									onChange: (event) => updateArea(area.id, "fee", event.target.value),
									placeholder: "0,00",
									className: "h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold"
								}),
								/* @__PURE__ */ jsx(Button, {
									type: "button",
									variant: "outline",
									className: "h-12 uppercase",
									onClick: () => removeArea(area.id),
									children: "Remover"
								})
							]
						}, area.id))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "outline",
							className: "uppercase",
							onClick: addArea,
							children: "Adicionar local"
						}), /* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "ze-dark",
							className: "uppercase",
							onClick: handleSave,
							disabled: isSaving || isLoading,
							children: isSaving ? "Salvando..." : "Salvar fretes"
						})]
					}),
					feedback && /* @__PURE__ */ jsx("p", {
						className: "mt-4 text-sm font-bold text-ze-black/70",
						children: feedback
					})
				]
			})
		})]
	});
}
//#endregion
//#region src/components/layout/Logo.tsx
function Logo({ className, variant = "default" }) {
	const isFooter = variant === "footer";
	return /* @__PURE__ */ jsxs(Link, {
		href: "/",
		className: `flex items-center gap-3 hover:opacity-90 transition-opacity group ${className}`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "relative",
			children: /* @__PURE__ */ jsx("div", {
				className: "w-10 h-10 bg-ze-yellow rounded-xl flex items-center justify-center border-2 border-ze-black transform group-hover:rotate-12 transition-transform duration-500 shadow-sm",
				children: /* @__PURE__ */ jsx("span", {
					className: "text-ze-black font-black text-xl italic leading-none",
					children: "E"
				})
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col leading-[0.9]",
			children: [/* @__PURE__ */ jsxs("span", {
				className: `text-[1.5rem] md:text-[1.8rem] font-black uppercase italic tracking-tighter ${isFooter ? "text-white" : "text-ze-black"}`,
				children: ["Entrega", /* @__PURE__ */ jsx("span", {
					className: isFooter ? "text-ze-yellow" : "text-ze-red",
					children: "Mais"
				})]
			}), /* @__PURE__ */ jsx("span", {
				className: `hidden sm:block text-[9px] font-black tracking-[0.2em] uppercase italic ${isFooter ? "text-white/40" : "text-ze-black/40"}`,
				children: "Bebidas Geladas em Minutos"
			})]
		})]
	});
}
var Instagram = createLucideIcon("Instagram", [
	["rect", {
		width: "20",
		height: "20",
		x: "2",
		y: "2",
		rx: "5",
		ry: "5",
		key: "2e1cvw"
	}],
	["path", {
		d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
		key: "9exkf1"
	}],
	["line", {
		x1: "17.5",
		x2: "17.51",
		y1: "6.5",
		y2: "6.5",
		key: "r4j83e"
	}]
]);
var Twitter = createLucideIcon("Twitter", [["path", {
	d: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
	key: "pff0z6"
}]]);
var Facebook = createLucideIcon("Facebook", [["path", {
	d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
	key: "1jg4f8"
}]]);
var Youtube = createLucideIcon("Youtube", [["path", {
	d: "M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17",
	key: "1q2vi4"
}], ["path", {
	d: "m10 15 5-3-5-3z",
	key: "1jp15x"
}]]);
//#endregion
//#region src/components/layout/Footer.tsx
function Footer() {
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	return /* @__PURE__ */ jsxs("footer", {
		className: "bg-ze-black text-white pt-20 pb-10 overflow-hidden relative",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "container mx-auto px-6 relative z-10",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-6",
								children: [
									/* @__PURE__ */ jsx(Logo, { variant: "footer" }),
									/* @__PURE__ */ jsx("p", {
										className: "text-white/90 text-sm leading-relaxed font-medium",
										children: "A melhor e mais rápida forma de receber sua bebida gelada onde você estiver. Preço de mercado, rapidez de entrega."
									}),
									/* @__PURE__ */ jsx("div", {
										className: "flex gap-4",
										children: [
											{
												href: "https://www.instagram.com",
												label: "Instagram",
												icon: Instagram
											},
											{
												href: "https://www.x.com",
												label: "X",
												icon: Twitter
											},
											{
												href: "https://www.facebook.com",
												label: "Facebook",
												icon: Facebook
											},
											{
												href: "https://www.youtube.com",
												label: "YouTube",
												icon: Youtube
											}
										].map(({ href, label, icon: Icon }) => /* @__PURE__ */ jsx(Link, {
											href,
											target: "_blank",
											rel: "noreferrer",
											"aria-label": label,
											className: "w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-ze-yellow hover:text-ze-black transition-all group",
											children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 group-hover:scale-110 transition-transform" })
										}, label))
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-8 lg:col-span-2",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "space-y-6",
									children: [/* @__PURE__ */ jsx("h4", {
										className: "text-xs font-black uppercase tracking-[0.2em] text-ze-yellow",
										children: "Institucional"
									}), /* @__PURE__ */ jsx("ul", {
										className: "space-y-4",
										children: [
											{
												label: "Sobre Nós",
												slug: "sobre-nos"
											},
											{
												label: "Carreiras",
												slug: "carreiras"
											},
											{
												label: "Blog",
												slug: "blog"
											},
											{
												label: "Seja um Parceiro",
												slug: "seja-um-parceiro"
											},
											{
												label: "Investidores",
												slug: "investidores"
											}
										].map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
											href: `/institucional/${item.slug}`,
											className: "text-sm font-bold text-white hover:text-ze-yellow transition-colors flex items-center group",
											children: [/* @__PURE__ */ jsx(ArrowRight, { className: "w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" }), item.label]
										}) }, item.slug))
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-6",
									children: [/* @__PURE__ */ jsx("h4", {
										className: "text-xs font-black uppercase tracking-[0.2em] text-ze-yellow",
										children: "Ajuda"
									}), /* @__PURE__ */ jsx("ul", {
										className: "space-y-4",
										children: [
											{
												label: "Fale Conosco",
												slug: "fale-conosco"
											},
											{
												label: "Dúvidas Frequentes",
												slug: "duvidas-frequentes"
											},
											{
												label: "Política de Entrega",
												slug: "politica-de-entrega"
											},
											{
												label: "Termos de Uso",
												slug: "termos-de-uso"
											},
											{
												label: "Privacidade",
												slug: "privacidade"
											}
										].map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
											href: `/ajuda/${item.slug}`,
											className: "text-sm font-bold text-white hover:text-ze-yellow transition-colors flex items-center group",
											children: [/* @__PURE__ */ jsx(ArrowRight, { className: "w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" }), item.label]
										}) }, item.slug))
									})]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-8",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4 rotate-2 hover:rotate-0 transition-transform",
									children: [
										/* @__PURE__ */ jsx("h4", {
											className: "font-black italic text-lg uppercase tracking-tight",
											children: "Receba Ofertas!"
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-xs font-bold text-white uppercase tracking-widest leading-none",
											children: "Descontos exclusivos no seu e-mail"
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ jsx(Input, {
												placeholder: "Seu melhor e-mail",
												className: "bg-ze-black border-white/10 text-xs rounded-xl h-10 placeholder:text-white/20 font-bold uppercase"
											}), /* @__PURE__ */ jsx(Button, {
												className: "bg-ze-yellow text-ze-black hover:bg-white h-10 px-4 rounded-xl shadow-lg",
												children: /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
											})]
										})
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ jsx("h4", {
										className: "text-xs font-black uppercase tracking-[0.2em] text-ze-yellow",
										children: "Baixe o App"
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex gap-3",
										children: [/* @__PURE__ */ jsx("div", {
											className: "h-10 w-28 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all",
											children: /* @__PURE__ */ jsx("span", {
												className: "text-[10px] font-black uppercase tracking-tighter text-white",
												children: "App Store"
											})
										}), /* @__PURE__ */ jsx("div", {
											className: "h-10 w-28 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all",
											children: /* @__PURE__ */ jsx("span", {
												className: "text-[10px] font-black uppercase tracking-tighter text-white",
												children: "Google Play"
											})
										})]
									})]
								})]
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-white/5 mb-12",
						children: [
							{
								icon: Truck,
								text: "Entrega em 25min",
								sub: "Média em SP"
							},
							{
								icon: ShieldCheck,
								text: "Compra Segura",
								sub: "Dados Criptografados"
							},
							{
								icon: CreditCard,
								text: "Pagamento In-App",
								sub: "Pix, Cartão e Vale"
							},
							{
								icon: MapPin,
								text: "Milhares de Lojas",
								sub: "Em todo o Brasil"
							}
						].map((feature, i) => /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-4 group",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 rounded-2xl bg-ze-yellow/10 flex items-center justify-center group-hover:bg-ze-yellow transition-colors duration-500",
								children: /* @__PURE__ */ jsx(feature.icon, { className: "w-6 h-6 text-ze-yellow group-hover:text-ze-black transition-colors duration-500" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
								className: "text-xs font-black uppercase tracking-tight text-white",
								children: feature.text
							}), /* @__PURE__ */ jsx("div", {
								className: "text-[10px] font-bold text-white/90 uppercase tracking-widest",
								children: feature.sub
							})] })]
						}, i))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col md:flex-row justify-between items-center gap-8 pt-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex flex-col md:flex-row items-center gap-4 md:gap-8",
							children: /* @__PURE__ */ jsxs("span", {
								className: "text-[10px] font-black text-white/90 uppercase tracking-[0.2em]",
								children: [
									"© ",
									currentYear,
									" Entregamais Shop. Todos os direitos reservados."
								]
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-6",
							children: [
								/* @__PURE__ */ jsx(Link, {
									href: "/ajuda/privacidade",
									className: "text-[10px] font-black text-white/90 hover:text-ze-yellow transition-colors uppercase tracking-[0.2em]",
									children: "Privacy"
								}),
								/* @__PURE__ */ jsx(Link, {
									href: "/ajuda/termos-de-uso",
									className: "text-[10px] font-black text-white/90 hover:text-ze-yellow transition-colors uppercase tracking-[0.2em]",
									children: "Terms"
								}),
								/* @__PURE__ */ jsx(Link, {
									href: "#",
									className: "text-[10px] font-black text-white/90 hover:text-ze-yellow transition-colors uppercase tracking-[0.2em]",
									children: "Sitemap"
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-96 h-96 bg-ze-yellow/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" }),
			/* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-64 h-64 bg-ze-red/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" })
		]
	});
}
var ShoppingCart = createLucideIcon("ShoppingCart", [
	["circle", {
		cx: "8",
		cy: "21",
		r: "1",
		key: "jimo8o"
	}],
	["circle", {
		cx: "19",
		cy: "21",
		r: "1",
		key: "13723u"
	}],
	["path", {
		d: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",
		key: "9zh506"
	}]
]);
var Menu = createLucideIcon("Menu", [
	["line", {
		x1: "4",
		x2: "20",
		y1: "12",
		y2: "12",
		key: "1e0a9i"
	}],
	["line", {
		x1: "4",
		x2: "20",
		y1: "6",
		y2: "6",
		key: "1owob3"
	}],
	["line", {
		x1: "4",
		x2: "20",
		y1: "18",
		y2: "18",
		key: "yk5zj1"
	}]
]);
//#endregion
//#region src/components/layout/Navbar.tsx
function Navbar() {
	const { totalItems } = useCart();
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";
	const userRoles = normalizeRoles(session?.user?.roles || []);
	const primaryRole = userRoles.includes("admin") ? "admin" : userRoles.includes("seller") ? "seller" : userRoles.includes("driver") ? "driver" : "customer";
	const roleLabels = {
		admin: "Administrador",
		seller: "Vendedor",
		driver: "Entregador",
		customer: "Cliente"
	};
	const roleStyles = {
		admin: "bg-ze-black text-ze-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
		seller: "bg-ze-yellow text-ze-black",
		driver: "bg-ze-yellow text-ze-black",
		customer: "bg-ze-gray text-ze-black"
	};
	const dashboardPath = getHomePathForRole(primaryRole);
	return /* @__PURE__ */ jsx("nav", {
		className: "sticky top-0 z-50 w-full border-b border-ze-black/10 bg-ze-yellow shadow-md",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container mx-auto px-4 h-16 flex items-center justify-between",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ jsx(Logo, {})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "hidden md:flex items-center gap-6",
					children: [
						/* @__PURE__ */ jsx(Link, {
							href: "/",
							className: "text-sm font-black text-ze-black/80 hover:text-ze-black transition-colors uppercase tracking-wider",
							children: "Explorar Depósitos"
						}),
						/* @__PURE__ */ jsx(Link, {
							href: "/auth/login/vendedor",
							className: "text-sm font-black text-ze-black/80 hover:text-ze-black transition-colors uppercase tracking-wider",
							children: "Sou Lojista"
						}),
						/* @__PURE__ */ jsx(Link, {
							href: "/auth/login/entregador",
							className: "text-sm font-black text-ze-black/80 hover:text-ze-black transition-colors uppercase tracking-wider",
							children: "Sou Entregador"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 md:gap-3",
					children: [
						/* @__PURE__ */ jsx(Link, {
							href: "/cart",
							children: /* @__PURE__ */ jsxs(Button, {
								variant: "ghost",
								size: "icon",
								className: "relative text-ze-black hover:bg-ze-black/5 h-10 w-10",
								children: [/* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5" }), totalItems > 0 && /* @__PURE__ */ jsx(Badge, {
									className: "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-ze-red text-white border-2 border-ze-yellow",
									children: totalItems
								})]
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: "hidden lg:flex items-center gap-3",
							children: status === "loading" ? /* @__PURE__ */ jsx("div", { className: "w-32 h-10 bg-ze-black/5 animate-pulse rounded-xl" }) : isAuthenticated ? /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx(Link, {
									href: dashboardPath,
									children: /* @__PURE__ */ jsxs(Button, {
										variant: "ghost",
										className: "flex items-center gap-3 text-ze-black font-bold hover:bg-ze-black/5 rounded-xl px-4 h-11 border-2 border-transparent hover:border-ze-black/10 transition-all",
										children: [/* @__PURE__ */ jsx("div", {
											className: `w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-sm ${roleStyles[primaryRole]}`,
											children: session?.user?.name?.charAt(0).toUpperCase() || "U"
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex flex-col items-start leading-none gap-1",
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-sm font-black",
												children: session?.user?.name?.split(" ")[0] || "Usuário"
											}), /* @__PURE__ */ jsx("span", {
												className: "text-[10px] uppercase tracking-widest opacity-60 font-black italic",
												children: roleLabels[primaryRole]
											})]
										})]
									})
								}), /* @__PURE__ */ jsxs(Button, {
									variant: "ghost",
									onClick: () => signOut(),
									className: "flex items-center gap-2 text-ze-red hover:bg-ze-red/10 rounded-xl px-3 h-11 font-black uppercase text-[10px] tracking-widest transition-all border-2 border-transparent hover:border-ze-red/20 shadow-sm",
									title: "Sair da conta",
									children: [/* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", {
										className: "hidden sm:inline",
										children: "Sair"
									})]
								})]
							}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Link, {
								href: "/auth/login/customer",
								children: /* @__PURE__ */ jsx(Button, {
									variant: "outline",
									className: "border-ze-black/20 text-ze-black hover:bg-ze-black/5 rounded-xl font-bold",
									children: "Entrar"
								})
							}), /* @__PURE__ */ jsx(Link, {
								href: "/auth/signup/vendedor",
								children: /* @__PURE__ */ jsx(Button, {
									className: "bg-ze-black text-ze-yellow hover:bg-ze-black/90 rounded-xl font-bold px-6 border-none",
									children: "Seja Parceiro"
								})
							})] })
						}),
						isAuthenticated && /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => signOut(),
							className: "lg:hidden text-ze-red hover:bg-ze-red/10 h-10 w-10",
							children: /* @__PURE__ */ jsx(LogOut, { className: "h-6 w-6" })
						}),
						/* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							className: "md:hidden text-ze-black h-10 w-10",
							children: /* @__PURE__ */ jsx(Menu, { className: "h-6 w-6" })
						})
					]
				})
			]
		})
	});
}
//#endregion
//#region src/components/providers/MSWProvider.tsx
function MSWProvider({ children }) {
	useEffect(() => {
		async function initMsw() {
			const isMockEnabledEnv = true;
			console.log("MSW: Initializing...", {
				shouldMock: isMockEnabledEnv,
				isMockEnabledEnv
			});
			if (typeof window !== "undefined") {
				process.env.NEXT_PUBLIC_MSW_ACTIVE = "true";
				const { worker } = await import("./browser-C4sGcutk.js");
				await worker.start({ onUnhandledRequest: "bypass" });
				console.log("MSW: Worker started!");
			}
		}
		initMsw();
	}, []);
	return /* @__PURE__ */ jsx(Fragment$1, { children });
}
//#endregion
//#region \0virtual:vite-rsc/client-references/group/facade:\0virtual:vinext-rsc-entry
var export_593f344dc510 = {
	ErrorBoundary,
	NotFoundBoundary
};
var export_15c18cfaeeff = { LayoutSegmentProvider };
var export_c2747888630f = { default: Link };
var export_eddb15a70272 = { default: AdminCredentialing };
var export_eab0e7b3d57b = { default: AdminDrivers };
var export_927fe43b75aa = { default: AdminDashboard };
var export_55b91a5dfb5c = { default: AdminProfilePage };
var export_b103e0c6bd17 = { default: AdminSettings };
var export_e34a447ec65e = { default: AdminUsers };
var export_51861f002d33 = { default: AdminSellers };
var export_228da2aa604d = { default: HelpPage };
var export_d000e255575a = { default: AdminLogin };
var export_685774d62caf = { default: CustomerLogin };
var export_37a4d91813bf = { default: DriverLogin };
var export_87fbea3eff1e = { default: SellerLogin };
var export_779678ddb364 = { default: DriverSignUp };
var export_d919e2bef81e = { default: SellerSignUp };
var export_c884ffe9eb8b = { default: CartPage };
var export_6ac0719a3036 = { default: CheckoutPage };
var export_d8d1f3500d46 = { default: DriverDashboard };
var export_dcabd19b24b1 = { default: DriverProfilePage };
var export_7d2a1c567464 = { default: DriverQueue };
var export_4f8b0c24ed0c = { default: InstitutionalPage };
var export_d10c3143bdfa = { default: CustomerOrdersPage };
var export_73d7a23e5015 = { default: Home };
var export_46ae4fb862e6 = { default: PrivacyPolicy };
var export_5a4d3fe72cb3 = { default: CustomerProfilePage };
var export_814b31e76a33 = { default: CustomerRegistration };
var export_752f01019f2f = { default: SearchPage };
var export_087c04552618 = { default: StorePage };
var export_dea0efdcf264 = { default: TermsOfService };
var export_027be32b36cf = { default: SellerOrders };
var export_c72f9a3f9700 = { default: SellerProductsPage };
var export_ee4dca5f7f48 = { default: SellerProfilePage };
var export_30263b448cc2 = { default: SellerSettingsPage };
var export_34a798ca0a91 = { Footer };
var export_3d2e5241bf2c = { Navbar };
var export_6719fc58013e = { PortalLayout };
var export_e4b81c77ccb8 = { AuthProvider };
var export_b5b3279c1936 = { MSWProvider };
var export_67d547da7fc1 = { ToastProvider };
var export_f3fadc1a5002 = { CartProvider };
//#endregion
export { export_027be32b36cf, export_087c04552618, export_15c18cfaeeff, export_228da2aa604d, export_30263b448cc2, export_34a798ca0a91, export_37a4d91813bf, export_3d2e5241bf2c, export_46ae4fb862e6, export_4f8b0c24ed0c, export_51861f002d33, export_55b91a5dfb5c, export_593f344dc510, export_5a4d3fe72cb3, export_6719fc58013e, export_67d547da7fc1, export_685774d62caf, export_6ac0719a3036, export_73d7a23e5015, export_752f01019f2f, export_779678ddb364, export_7d2a1c567464, export_814b31e76a33, export_87fbea3eff1e, export_927fe43b75aa, export_b103e0c6bd17, export_b5b3279c1936, export_c2747888630f, export_c72f9a3f9700, export_c884ffe9eb8b, export_d000e255575a, export_d10c3143bdfa, export_d8d1f3500d46, export_d919e2bef81e, export_dcabd19b24b1, export_dea0efdcf264, export_e34a447ec65e, export_e4b81c77ccb8, export_eab0e7b3d57b, export_eddb15a70272, export_ee4dca5f7f48, export_f3fadc1a5002 };

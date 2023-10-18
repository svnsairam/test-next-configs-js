"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetlifyNextServer = void 0;
// eslint-disable-next-line n/no-deprecated-api -- this is what Next.js uses as well
const url_1 = require("url");
const handlerUtils_1 = require("./handlerUtils");
// eslint-disable-next-line max-lines-per-function
const getNetlifyNextServer = (NextServer) => {
    class NetlifyNextServer extends NextServer {
        constructor(options, netlifyConfig) {
            super(options);
            this.netlifyConfig = netlifyConfig;
            // copy the prerender manifest so it doesn't get mutated by Next.js
            const manifest = this.getPrerenderManifest();
            this.netlifyPrerenderManifest = {
                ...manifest,
                routes: { ...manifest.routes },
                dynamicRoutes: { ...manifest.dynamicRoutes },
            };
        }
        getRequestHandler() {
            const handler = super.getRequestHandler();
            return async (req, res, parsedUrl) => {
                var _a, _b;
                if (!parsedUrl && typeof ((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a['x-middleware-rewrite']) === 'string') {
                    parsedUrl = (0, url_1.parse)(req.headers['x-middleware-rewrite'], true);
                }
                // preserve the URL before Next.js mutates it for i18n
                const { url, headers } = req;
                // conditionally use the prebundled React module
                this.netlifyPrebundleReact(url);
                // intercept on-demand revalidation requests and handle with the Netlify API
                if (headers['x-prerender-revalidate'] && this.netlifyConfig.revalidateToken) {
                    // handle on-demand revalidation by purging the ODB cache
                    await this.netlifyRevalidate(url);
                    res = res;
                    res.statusCode = 200;
                    res.setHeader('x-nextjs-cache', 'REVALIDATED');
                    res.send();
                    return;
                }
                // force Next to revalidate all requests so that we always have fresh content
                // for our ODBs and middleware is disabled at the origin
                // but ignore in preview mode (prerender_bypass is set to true in preview mode)
                // because otherwise revalidate will override preview mode
                if (!((_b = headers.cookie) === null || _b === void 0 ? void 0 : _b.includes('__prerender_bypass'))) {
                    // this header controls whether Next.js will revalidate the page
                    // and needs to be set to the preview mode id to enable it
                    headers['x-prerender-revalidate'] = this.renderOpts.previewProps.previewModeId;
                }
                return handler(req, res, parsedUrl);
            };
        }
        // doing what they do in https://github.com/vercel/vercel/blob/1663db7ca34d3dd99b57994f801fb30b72fbd2f3/packages/next/src/server-build.ts#L576-L580
        netlifyPrebundleReact(path) {
            var _a, _b, _c;
            const routesManifest = (_a = this.getRoutesManifest) === null || _a === void 0 ? void 0 : _a.call(this);
            const appPathsRoutes = (_b = this.getAppPathRoutes) === null || _b === void 0 ? void 0 : _b.call(this);
            const routes = routesManifest && [...routesManifest.staticRoutes, ...routesManifest.dynamicRoutes];
            const matchedRoute = routes === null || routes === void 0 ? void 0 : routes.find((route) => new RegExp(route.regex).test(new URL(path, 'http://n').pathname));
            const isAppRoute = appPathsRoutes && matchedRoute ? appPathsRoutes[matchedRoute.page] : false;
            if (isAppRoute) {
                // app routes should use prebundled React
                // eslint-disable-next-line no-underscore-dangle
                process.env.__NEXT_PRIVATE_PREBUNDLED_REACT = ((_c = this.nextConfig.experimental) === null || _c === void 0 ? void 0 : _c.serverActions)
                    ? 'experimental'
                    : 'next';
                return;
            }
            // pages routes should use use node_modules React
            // eslint-disable-next-line no-underscore-dangle
            process.env.__NEXT_PRIVATE_PREBUNDLED_REACT = '';
        }
        async netlifyRevalidate(route) {
            try {
                // call netlify API to revalidate the path
                const result = await (0, handlerUtils_1.netlifyApiFetch)({
                    endpoint: `sites/${process.env.SITE_ID}/refresh_on_demand_builders`,
                    payload: {
                        paths: this.getNetlifyPathsForRoute(route),
                        domain: this.hostname,
                    },
                    token: this.netlifyConfig.revalidateToken,
                    method: 'POST',
                });
                if (!result.ok) {
                    throw new Error(result.message);
                }
            }
            catch (error) {
                console.log(`Error revalidating ${route}:`, error.message);
                throw error;
            }
        }
        // eslint-disable-next-line class-methods-use-this, require-await
        async runMiddleware() {
            return {
                finished: false,
            };
        }
        getNetlifyPathsForRoute(route) {
            const { i18n } = this.nextConfig;
            const { routes, dynamicRoutes } = this.netlifyPrerenderManifest;
            // matches static routes
            const normalizedRoute = (0, handlerUtils_1.normalizeRoute)(i18n ? (0, handlerUtils_1.localizeRoute)(route, i18n) : route);
            if (normalizedRoute in routes) {
                const { dataRoute } = routes[normalizedRoute];
                const normalizedDataRoute = i18n ? (0, handlerUtils_1.localizeDataRoute)(dataRoute, normalizedRoute) : dataRoute;
                return [route, normalizedDataRoute];
            }
            // matches dynamic routes
            const unlocalizedRoute = i18n ? (0, handlerUtils_1.unlocalizeRoute)(normalizedRoute, i18n) : normalizedRoute;
            for (const dynamicRoute in dynamicRoutes) {
                const { dataRoute, routeRegex } = dynamicRoutes[dynamicRoute];
                const matches = unlocalizedRoute.match(routeRegex);
                if ((matches === null || matches === void 0 ? void 0 : matches.length) > 0) {
                    // remove the first match, which is the full route
                    matches.shift();
                    // replace the dynamic segments with the actual values
                    const interpolatedDataRoute = dataRoute.replace(/\[(.*?)]/g, () => matches.shift());
                    const normalizedDataRoute = i18n
                        ? (0, handlerUtils_1.localizeDataRoute)(interpolatedDataRoute, normalizedRoute)
                        : interpolatedDataRoute;
                    return [route, normalizedDataRoute];
                }
            }
            throw new Error(`not an ISR route`);
        }
    }
    return NetlifyNextServer;
};
exports.getNetlifyNextServer = getNetlifyNextServer;

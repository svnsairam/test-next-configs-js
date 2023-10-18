"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localizeDataRoute = exports.localizeRoute = exports.unlocalizeRoute = exports.joinPaths = exports.normalizeRoute = exports.netlifyApiFetch = exports.normalizePath = exports.getPrefetchResponse = exports.augmentFsModule = exports.getMultiValueHeaders = exports.getMaxAge = exports.downloadFile = void 0;
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const util_1 = require("util");
const follow_redirects_1 = require("follow-redirects");
const streamPipeline = (0, util_1.promisify)(stream_1.pipeline);
/**
 * Downloads a file from the CDN to the local aliased filesystem. This is a fallback, because in most cases we'd expect
 * files required at runtime to not be sent to the CDN.
 */
const downloadFile = async (url, destination) => {
    console.log(`Downloading ${url} to ${destination}`);
    const httpx = url.startsWith('https') ? follow_redirects_1.https : follow_redirects_1.http;
    await new Promise((resolve, reject) => {
        const req = httpx.get(url, { timeout: 10000, maxRedirects: 1 }, (response) => {
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage || ''}`));
                return;
            }
            const fileStream = (0, fs_1.createWriteStream)(destination);
            streamPipeline(response, fileStream)
                .then(resolve)
                .catch((error) => {
                console.log(`Error downloading ${url}`, error);
                reject(error);
            });
        });
        req.on('error', (error) => {
            console.log(`Error downloading ${url}`, error);
            reject(error);
        });
    });
};
exports.downloadFile = downloadFile;
/**
 * Parse maxage from a cache-control header
 */
const getMaxAge = (header) => {
    const parts = header.split(',');
    let maxAge;
    for (const part of parts) {
        const [key, value] = part.split('=');
        if ((key === null || key === void 0 ? void 0 : key.trim()) === 's-maxage') {
            maxAge = value === null || value === void 0 ? void 0 : value.trim();
        }
    }
    if (maxAge) {
        const result = Number.parseInt(maxAge);
        return Number.isNaN(result) ? 0 : result;
    }
    return 0;
};
exports.getMaxAge = getMaxAge;
const getMultiValueHeaders = (headers) => {
    const multiValueHeaders = {};
    for (const key of Object.keys(headers)) {
        const header = headers[key];
        if (Array.isArray(header)) {
            multiValueHeaders[key] = header;
        }
        else {
            multiValueHeaders[key] = [header];
        }
    }
    return multiValueHeaders;
};
exports.getMultiValueHeaders = getMultiValueHeaders;
/**
 * Monkey-patch the fs module to download missing files from the CDN
 */
const augmentFsModule = ({ promises, staticManifest, pageRoot, getBase, }) => {
    // Only do this if we have some static files moved to the CDN
    if (staticManifest.length === 0) {
        return;
    }
    // These are static page files that have been removed from the function bundle
    // In most cases these are served from the CDN, but for rewrites Next may try to read them
    // from disk. We need to intercept these and load them from the CDN instead
    // Sadly the only way to do this is to monkey-patch fs.promises. Yeah, I know.
    const staticFiles = new Map(staticManifest);
    const downloadPromises = new Map();
    // Yes, you can cache stuff locally in a Lambda
    const cacheDir = path_1.default.join((0, os_1.tmpdir)(), 'next-static-cache');
    // Grab the real fs.promises.readFile...
    const readfileOrig = promises.readFile;
    const statsOrig = promises.stat;
    // ...then monkey-patch it to see if it's requesting a CDN file
    promises.readFile = (async (file, options) => {
        const baseUrl = getBase();
        // We only care about page files
        if (file.startsWith(pageRoot)) {
            // We only want the part after `.next/server/`
            const filePath = file.slice(pageRoot.length + 1);
            // Is it in the CDN and not local?
            if (staticFiles.has(filePath) && !(0, fs_1.existsSync)(file)) {
                // This name is safe to use, because it's one that was already created by Next
                const cacheFile = path_1.default.join(cacheDir, filePath);
                const url = `${baseUrl}/${staticFiles.get(filePath)}`;
                // If it's already downloading we can wait for it to finish
                if (downloadPromises.has(url)) {
                    await downloadPromises.get(url);
                }
                // Have we already cached it? We download every time if running locally to avoid staleness
                if ((!(0, fs_1.existsSync)(cacheFile) || process.env.NETLIFY_DEV) && baseUrl) {
                    await promises.mkdir(path_1.default.dirname(cacheFile), { recursive: true });
                    try {
                        // Append the path to our host and we can load it like a regular page
                        const downloadPromise = (0, exports.downloadFile)(url, cacheFile);
                        downloadPromises.set(url, downloadPromise);
                        await downloadPromise;
                    }
                    finally {
                        downloadPromises.delete(url);
                    }
                }
                // Return the cache file
                return readfileOrig(cacheFile, options);
            }
        }
        return readfileOrig(file, options);
    });
    promises.stat = ((file, options) => {
        // We only care about page files
        if (file.startsWith(pageRoot)) {
            // We only want the part after `.next/server`
            const cacheFile = path_1.default.join(cacheDir, file.slice(pageRoot.length + 1));
            if ((0, fs_1.existsSync)(cacheFile)) {
                return statsOrig(cacheFile, options);
            }
        }
        return statsOrig(file, options);
    });
};
exports.augmentFsModule = augmentFsModule;
/**
 * Prefetch requests are used to check for middleware redirects, and shouldn't trigger SSR.
 */
const getPrefetchResponse = (event, mode) => {
    if (event.headers['x-middleware-prefetch'] && mode === 'ssr') {
        return {
            statusCode: 200,
            body: '{}',
            headers: {
                'Content-Type': 'application/json',
                'x-middleware-skip': '1',
                // https://github.com/vercel/next.js/pull/42936/files#r1027563953
                vary: 'x-middleware-prefetch',
            },
        };
    }
    return false;
};
exports.getPrefetchResponse = getPrefetchResponse;
const normalizePath = (event) => {
    var _a;
    if ((_a = event.headers) === null || _a === void 0 ? void 0 : _a.rsc) {
        const originalPath = event.headers['x-rsc-route'];
        if (originalPath) {
            if (event.headers['x-next-debug-logging']) {
                console.log('Original path:', originalPath);
            }
            return originalPath;
        }
    }
    if (event.headers['x-original-path']) {
        if (event.headers['x-next-debug-logging']) {
            console.log('Original path:', event.headers['x-original-path']);
        }
        return event.headers['x-original-path'];
    }
    // Ensure that paths are encoded - but don't double-encode them
    return new URL(event.rawUrl).pathname;
};
exports.normalizePath = normalizePath;
// Simple Netlify API client
const netlifyApiFetch = ({ endpoint, payload, token, method = 'GET', }) => new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = follow_redirects_1.https.request({
        hostname: 'api.netlify.com',
        port: 443,
        path: `/api/v1/${endpoint}`,
        method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': body.length,
            Authorization: `Bearer ${token}`,
        },
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            resolve(JSON.parse(data));
        });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
});
exports.netlifyApiFetch = netlifyApiFetch;
// Remove trailing slash from a route (except for the root route)
const normalizeRoute = (route) => (route.endsWith('/') ? route.slice(0, -1) || '/' : route);
exports.normalizeRoute = normalizeRoute;
// Join multiple paths together, ensuring that there is only one slash between them
const joinPaths = (...paths) => paths.reduce((a, b) => (a.endsWith('/') ? `${a}${b}` : `${a}/${b}`));
exports.joinPaths = joinPaths;
// Check if a route has a locale prefix (including the root route)
const isLocalized = (route, i18n) => i18n.locales.some((locale) => route === `/${locale}` || route.startsWith(`/${locale}/`));
// Remove the locale prefix from a route (if any)
const unlocalizeRoute = (route, i18n) => isLocalized(route, i18n) ? `/${route.split('/').slice(2).join('/')}` : route;
exports.unlocalizeRoute = unlocalizeRoute;
// Add the default locale prefix to a route (if necessary)
const localizeRoute = (route, i18n) => isLocalized(route, i18n) ? route : (0, exports.normalizeRoute)(`/${i18n.defaultLocale}${route}`);
exports.localizeRoute = localizeRoute;
// Normalize a data route to include the locale prefix and remove the index suffix
const localizeDataRoute = (dataRoute, localizedRoute) => {
    if (dataRoute.endsWith('.rsc'))
        return dataRoute;
    const locale = localizedRoute.split('/').find(Boolean);
    return dataRoute
        .replace(new RegExp(`/_next/data/(.+?)/(${locale}/)?`), `/_next/data/$1/${locale}/`)
        .replace(/\/index\.json$/, '.json');
};
exports.localizeDataRoute = localizeDataRoute;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The Next.js builder can emit the project in a subdirectory depending on how
// many folder levels of `node_modules` are traced. To ensure `process.cwd()`
// returns the proper path, we change the directory to the folder with the
// launcher. This mimics `yarn workspace run` behavior.
process.chdir(__dirname);
const region = process.env.VERCEL_REGION || process.env.NOW_REGION;
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = region === 'dev1' ? 'development' : 'production';
}
if (process.env.NODE_ENV !== 'production' && region !== 'dev1') {
    console.warn(`Warning: NODE_ENV was incorrectly set to "${process.env.NODE_ENV}", this value is being overridden to "production"`);
    process.env.NODE_ENV = 'production';
}
process.env.__NEXT_PRIVATE_PREBUNDLED_REACT = "next"
// eslint-disable-next-line
const NextServer = require('next/dist/server/next-server.js').default;
const nextServer = new NextServer({
    // @ts-ignore __NEXT_CONFIG__ value is injected
    conf: {"env":{"TITLE":"Title Prod"},"webpack":null,"eslint":{"ignoreDuringBuilds":false},"typescript":{"ignoreBuildErrors":false,"tsconfigPath":"tsconfig.json"},"distDir":".next","cleanDistDir":true,"assetPrefix":"","configOrigin":"next.config.js","useFileSystemPublicRoutes":true,"generateEtags":true,"pageExtensions":["tsx","ts","jsx","js"],"poweredByHeader":true,"compress":false,"analyticsId":"","images":{"deviceSizes":[640,750,828,1080,1200,1920,2048,3840],"imageSizes":[16,32,48,64,96,128,256,384],"path":"/_next/image","loader":"default","loaderFile":"","domains":[],"disableStaticImages":false,"minimumCacheTTL":60,"formats":["image/webp"],"dangerouslyAllowSVG":false,"contentSecurityPolicy":"script-src 'none'; frame-src 'none'; sandbox;","contentDispositionType":"inline","remotePatterns":[],"unoptimized":false},"devIndicators":{"buildActivity":true,"buildActivityPosition":"bottom-right"},"onDemandEntries":{"maxInactiveAge":60000,"pagesBufferLength":5},"amp":{"canonicalBase":""},"basePath":"","sassOptions":{},"trailingSlash":false,"i18n":null,"productionBrowserSourceMaps":false,"optimizeFonts":true,"excludeDefaultMomentLocales":true,"serverRuntimeConfig":{},"publicRuntimeConfig":{},"reactProductionProfiling":false,"reactStrictMode":false,"httpAgentOptions":{"keepAlive":true},"outputFileTracing":true,"staticPageGenerationTimeout":60,"swcMinify":true,"modularizeImports":{"@mui/icons-material":{"transform":"@mui/icons-material/{{member}}"},"date-fns":{"transform":"date-fns/{{member}}"},"lodash":{"transform":"lodash/{{member}}"},"lodash-es":{"transform":"lodash-es/{{member}}"},"lucide-react":{"transform":{"(SortAsc|LucideSortAsc|SortAscIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-up-narrow-wide!lucide-react","(SortDesc|LucideSortDesc|SortDescIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/arrow-down-wide-narrow!lucide-react","(Verified|LucideVerified|VerifiedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/badge-check!lucide-react","(Slash|LucideSlash|SlashIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/ban!lucide-react","(CurlyBraces|LucideCurlyBraces|CurlyBracesIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/braces!lucide-react","(CircleSlashed|LucideCircleSlashed|CircleSlashedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/circle-slash-2!lucide-react","(SquareGantt|LucideSquareGantt|SquareGanttIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/gantt-chart-square!lucide-react","(SquareKanbanDashed|LucideSquareKanbanDashed|SquareKanbanDashedIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square-dashed!lucide-react","(SquareKanban|LucideSquareKanban|SquareKanbanIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/kanban-square!lucide-react","(Edit3|LucideEdit3|Edit3Icon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-line!lucide-react","(Edit|LucideEdit|EditIcon|PenBox|LucidePenBox|PenBoxIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen-square!lucide-react","(Edit2|LucideEdit2|Edit2Icon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/pen!lucide-react","(Stars|LucideStars|StarsIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/sparkles!lucide-react","(TextSelection|LucideTextSelection|TextSelectionIcon)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/text-select!lucide-react","Lucide(.*)":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react","(.*)Icon":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase memberMatches.[1] }}!lucide-react","*":"modularize-import-loader?name={{ member }}&from=default&as=default&join=../esm/icons/{{ kebabCase member }}!lucide-react"}},"@headlessui/react":{"transform":{"Transition":"modularize-import-loader?name={{member}}&join=./components/transitions/transition!@headlessui/react","Tab":"modularize-import-loader?name={{member}}&join=./components/tabs/tabs!@headlessui/react","*":"modularize-import-loader?name={{member}}&join=./components/{{ kebabCase member }}/{{ kebabCase member }}!@headlessui/react"},"skipDefaultConversion":true},"@heroicons/react/20/solid":{"transform":"@heroicons/react/20/solid/esm/{{member}}"},"@heroicons/react/24/solid":{"transform":"@heroicons/react/24/solid/esm/{{member}}"},"@heroicons/react/24/outline":{"transform":"@heroicons/react/24/outline/esm/{{member}}"},"ramda":{"transform":"ramda/es/{{member}}"},"react-bootstrap":{"transform":{"useAccordionButton":"modularize-import-loader?name=useAccordionButton&from=named&as=default!react-bootstrap/AccordionButton","*":"react-bootstrap/{{member}}"}},"antd":{"transform":"antd/lib/{{kebabCase member}}"},"ahooks":{"transform":{"createUpdateEffect":"modularize-import-loader?name=createUpdateEffect&from=named&as=default!ahooks/es/createUpdateEffect","*":"ahooks/es/{{member}}"}},"@ant-design/icons":{"transform":{"IconProvider":"modularize-import-loader?name=IconProvider&from=named&as=default!@ant-design/icons","createFromIconfontCN":"@ant-design/icons/es/components/IconFont","getTwoToneColor":"modularize-import-loader?name=getTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor","setTwoToneColor":"modularize-import-loader?name=setTwoToneColor&from=named&as=default!@ant-design/icons/es/components/twoTonePrimaryColor","*":"@ant-design/icons/lib/icons/{{member}}"}},"next/server":{"transform":"next/dist/server/web/exports/{{ kebabCase member }}"}},"experimental":{"serverMinification":false,"serverSourceMaps":false,"caseSensitiveRoutes":false,"useDeploymentId":false,"useDeploymentIdServerActions":false,"clientRouterFilter":true,"clientRouterFilterRedirects":false,"fetchCacheKeyPrefix":"","middlewarePrefetch":"flexible","optimisticClientCache":true,"manualClientBasePath":false,"legacyBrowsers":false,"newNextLinkBehavior":true,"cpus":47,"memoryBasedWorkersCount":false,"sharedPool":true,"isrFlushToDisk":true,"workerThreads":false,"pageEnv":false,"optimizeCss":false,"nextScriptWorkers":false,"scrollRestoration":false,"externalDir":false,"disableOptimizedLoading":false,"gzipSize":true,"swcFileReading":true,"craCompat":false,"esmExternals":true,"appDir":true,"isrMemoryCacheSize":52428800,"fullySpecified":false,"outputFileTracingRoot":"/usr/local/google/home/svnsairam/Documents/google3/test-next-configs-js","swcTraceProfiling":false,"forceSwcTransforms":false,"largePageDataBytes":128000,"adjustFontFallbacks":false,"adjustFontFallbacksWithSizeAdjust":false,"typedRoutes":false,"instrumentationHook":false,"trustHostHeader":true},"configFileName":"next.config.js","_originalRewrites":{"beforeFiles":[],"afterFiles":[{"source":"/configJsonRewrite","destination":"/about"},{"source":"/confictRW","destination":"/about"}],"fallback":[]},"_originalRedirects":[{"source":"/confictRD","destination":"/","permanent":true},{"source":"/nextConfigRedirect","destination":"/","permanent":true}]},
    dir: '.',
    minimalMode: true,
    customServer: false,
});
const requestHandler = nextServer.getRequestHandler();
module.exports = async (req, res) => {
    try {
        // entryDirectory handler
        await requestHandler(req, res);
    }
    catch (err) {
        console.error(err);
        // crash the lambda immediately to clean up any bad module state,
        // this was previously handled in ___vc_bridge on an unhandled rejection
        // but we can do this quicker by triggering here
        process.exit(1);
    }
};
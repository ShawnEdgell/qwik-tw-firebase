import { j as jsx, f as _renderSSR, g as _pauseFromContexts, F as Fragment, s as setPlatform, c as componentQrl, i as inlinedQrl, h as useDocumentHead, k as useLocation, d as _jsxC, b as _jsxQ, l as _fnSignal, m as _jsxS, R as RouterOutlet, n as ServiceWorkerRegister, Q as QwikCityProvider } from "./q-B0Mda4vz.js";
/**
 * @license
 * @builder.io/qwik/server 1.5.7
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/QwikDev/qwik/blob/main/LICENSE
 */
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var SYNC_QRL = "<sync>";
function createPlatform(opts, resolvedManifest) {
  const mapper = resolvedManifest == null ? void 0 : resolvedManifest.mapper;
  const mapperFn = opts.symbolMapper ? opts.symbolMapper : (symbolName) => {
    var _a;
    if (mapper) {
      const hash = getSymbolHash(symbolName);
      const result = mapper[hash];
      if (!result) {
        if (hash === SYNC_QRL) {
          return [hash, ""];
        }
        const isRegistered = (_a = globalThis.__qwik_reg_symbols) == null ? void 0 : _a.has(hash);
        if (isRegistered) {
          return [symbolName, "_"];
        }
        console.error("Cannot resolve symbol", symbolName, "in", mapper);
      }
      return result;
    }
  };
  const serverPlatform = {
    isServer: true,
    async importSymbol(_containerEl, url, symbolName) {
      var _a;
      const hash = getSymbolHash(symbolName);
      const regSym = (_a = globalThis.__qwik_reg_symbols) == null ? void 0 : _a.get(hash);
      if (regSym) {
        return regSym;
      }
      let modulePath = String(url);
      if (!modulePath.endsWith(".js")) {
        modulePath += ".js";
      }
      const module = __require(modulePath);
      if (!(symbolName in module)) {
        throw new Error(`Q-ERROR: missing symbol '${symbolName}' in module '${modulePath}'.`);
      }
      return module[symbolName];
    },
    raf: () => {
      console.error("server can not rerender");
      return Promise.resolve();
    },
    nextTick: (fn) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fn());
        });
      });
    },
    chunkForSymbol(symbolName) {
      return mapperFn(symbolName, mapper);
    }
  };
  return serverPlatform;
}
async function setServerPlatform(opts, manifest2) {
  const platform = createPlatform(opts, manifest2);
  setPlatform(platform);
}
var getSymbolHash = (symbolName) => {
  const index = symbolName.lastIndexOf("_");
  if (index > -1) {
    return symbolName.slice(index + 1);
  }
  return symbolName;
};
function createTimer() {
  if (typeof performance === "undefined") {
    return () => 0;
  }
  const start = performance.now();
  return () => {
    const end = performance.now();
    const delta = end - start;
    return delta / 1e6;
  };
}
function getBuildBase(opts) {
  let base = opts.base;
  if (typeof opts.base === "function") {
    base = opts.base(opts);
  }
  if (typeof base === "string") {
    if (!base.endsWith("/")) {
      base += "/";
    }
    return base;
  }
  return `${"/"}build/`;
}
var QWIK_LOADER_DEFAULT_MINIFIED = '(()=>{var e=Object.defineProperty,t=Object.getOwnPropertySymbols,n=Object.prototype.hasOwnProperty,r=Object.prototype.propertyIsEnumerable,o=(t,n,r)=>n in t?e(t,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[n]=r,s=(e,s)=>{for(var a in s||(s={}))n.call(s,a)&&o(e,a,s[a]);if(t)for(var a of t(s))r.call(s,a)&&o(e,a,s[a]);return e};((e,t)=>{const n="__q_context__",r=window,o=new Set,a="replace",i="forEach",c="target",l="getAttribute",f="isConnected",p="qvisible",b="_qwikjson_",u=t=>e.querySelectorAll(t),y=e=>e&&"function"==typeof e.then,d=(e,t,n=t.type)=>{u("[on"+e+"\\\\:"+n+"]")[i]((r=>q(r,e,t,n)))},m=t=>{if(void 0===t[b]){let n=(t===e.documentElement?e.body:t).lastElementChild;for(;n;){if("SCRIPT"===n.tagName&&"qwik/json"===n[l]("type")){t[b]=JSON.parse(n.textContent[a](/\\\\x3C(\\/?script)/gi,"<$1"));break}n=n.previousElementSibling}}},h=(e,t)=>new CustomEvent(e,{detail:t}),q=async(t,r,o,i=o.type)=>{const c="on"+r+":"+i;t.hasAttribute("preventdefault:"+i)&&o.preventDefault();const p=t._qc_,b=p&&p.li.filter((e=>e[0]===c));if(b&&b.length>0){for(const e of b){const n=e[1].getFn([t,o],(()=>t[f]))(o,t),r=o.cancelBubble;y(n)&&await n,r&&o.stopPropagation()}return}const u=t[l](c);if(u){const r=t.closest("[q\\\\:container]"),i=r[l]("q:base"),c=r[l]("q:version")||"unknown",p=r[l]("q:manifest-hash")||"dev",b=new URL(i,e.baseURI);for(const l of u.split("\\n")){const u=new URL(l,b),d=u.href,h=u.hash[a](/^#?([^?[|]*).*$/,"$1")||"default",q=performance.now();let v,g,E;const _=l.startsWith("#"),k={qBase:i,qManifest:p,qVersion:c,href:d,symbol:h,element:t,reqTime:q};if(_)v=(r.qFuncs||[])[Number.parseInt(h)],v||(g="sync",E=Error("sync handler error for symbol: "+h));else{const e=u.href.split("#")[0];try{const t=import(e);m(r),v=(await t)[h]}catch(e){g="async",E=e}}if(!v){w("qerror",s({importError:g,error:E},k));break}const C=e[n];if(t[f])try{e[n]=[t,o,u],_||w("qsymbol",s({},k));const r=v(o,t);y(r)&&await r}catch(e){w("qerror",s({error:e},k))}finally{e[n]=C}}}},w=(t,n)=>{e.dispatchEvent(h(t,n))},v=e=>e[a](/([A-Z])/g,(e=>"-"+e.toLowerCase())),g=async e=>{let t=v(e.type),n=e[c];for(d("-document",e,t);n&&n[l];){const r=q(n,"",e,t);let o=e.cancelBubble;y(r)&&await r,o=o||e.cancelBubble||n.hasAttribute("stoppropagation:"+e.type),n=e.bubbles&&!0!==o?n.parentElement:null}},E=e=>{d("-window",e,v(e.type))},_=()=>{var n;const s=e.readyState;if(!t&&("interactive"==s||"complete"==s)&&(t=1,w("qinit"),(null!=(n=r.requestIdleCallback)?n:r.setTimeout).bind(r)((()=>w("qidle"))),o.has(p))){const e=u("[on\\\\:"+p+"]"),t=new IntersectionObserver((e=>{for(const n of e)n.isIntersecting&&(t.unobserve(n[c]),q(n[c],"",h(p,n)))}));e[i]((e=>t.observe(e)))}},k=(e,t,n,r=!1)=>e.addEventListener(t,n,{capture:r,passive:!1}),C=t=>{for(const n of t)o.has(n)||(k(e,n,g,!0),k(r,n,E,!0),o.add(n))};if(!(n in e)){e[n]=0;const t=r.qwikevents;Array.isArray(t)&&C(t),r.qwikevents={push:(...e)=>C(e)},k(e,"readystatechange",_),_()}})(document)})()';
var QWIK_LOADER_DEFAULT_DEBUG = '(() => {\n    var __defProp = Object.defineProperty;\n    var __getOwnPropSymbols = Object.getOwnPropertySymbols;\n    var __hasOwnProp = Object.prototype.hasOwnProperty;\n    var __propIsEnum = Object.prototype.propertyIsEnumerable;\n    var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {\n        enumerable: !0,\n        configurable: !0,\n        writable: !0,\n        value: value\n    }) : obj[key] = value;\n    var __spreadValues = (a, b) => {\n        for (var prop in b || (b = {})) {\n            __hasOwnProp.call(b, prop) && __defNormalProp(a, prop, b[prop]);\n        }\n        if (__getOwnPropSymbols) {\n            for (var prop of __getOwnPropSymbols(b)) {\n                __propIsEnum.call(b, prop) && __defNormalProp(a, prop, b[prop]);\n            }\n        }\n        return a;\n    };\n    ((doc, hasInitialized) => {\n        const Q_CONTEXT = "__q_context__";\n        const win = window;\n        const events =  new Set;\n        const querySelectorAll = query => doc.querySelectorAll(query);\n        const isPromise = promise => promise && "function" == typeof promise.then;\n        const broadcast = (infix, ev, type = ev.type) => {\n            querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((el => dispatch(el, infix, ev, type)));\n        };\n        const resolveContainer = containerEl => {\n            if (void 0 === containerEl._qwikjson_) {\n                let script = (containerEl === doc.documentElement ? doc.body : containerEl).lastElementChild;\n                while (script) {\n                    if ("SCRIPT" === script.tagName && "qwik/json" === script.getAttribute("type")) {\n                        containerEl._qwikjson_ = JSON.parse(script.textContent.replace(/\\\\x3C(\\/?script)/gi, "<$1"));\n                        break;\n                    }\n                    script = script.previousElementSibling;\n                }\n            }\n        };\n        const createEvent = (eventName, detail) => new CustomEvent(eventName, {\n            detail: detail\n        });\n        const dispatch = async (element, onPrefix, ev, eventName = ev.type) => {\n            const attrName = "on" + onPrefix + ":" + eventName;\n            element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();\n            const ctx = element._qc_;\n            const relevantListeners = ctx && ctx.li.filter((li => li[0] === attrName));\n            if (relevantListeners && relevantListeners.length > 0) {\n                for (const listener of relevantListeners) {\n                    const results = listener[1].getFn([ element, ev ], (() => element.isConnected))(ev, element);\n                    const cancelBubble = ev.cancelBubble;\n                    isPromise(results) && await results;\n                    cancelBubble && ev.stopPropagation();\n                }\n                return;\n            }\n            const attrValue = element.getAttribute(attrName);\n            if (attrValue) {\n                const container = element.closest("[q\\\\:container]");\n                const qBase = container.getAttribute("q:base");\n                const qVersion = container.getAttribute("q:version") || "unknown";\n                const qManifest = container.getAttribute("q:manifest-hash") || "dev";\n                const base = new URL(qBase, doc.baseURI);\n                for (const qrl of attrValue.split("\\n")) {\n                    const url = new URL(qrl, base);\n                    const href = url.href;\n                    const symbol = url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";\n                    const reqTime = performance.now();\n                    let handler;\n                    let importError;\n                    let error;\n                    const isSync = qrl.startsWith("#");\n                    const eventData = {\n                        qBase: qBase,\n                        qManifest: qManifest,\n                        qVersion: qVersion,\n                        href: href,\n                        symbol: symbol,\n                        element: element,\n                        reqTime: reqTime\n                    };\n                    if (isSync) {\n                        handler = (container.qFuncs || [])[Number.parseInt(symbol)];\n                        if (!handler) {\n                            importError = "sync";\n                            error = new Error("sync handler error for symbol: " + symbol);\n                        }\n                    } else {\n                        const uri = url.href.split("#")[0];\n                        try {\n                            const module = import(\n                                                        uri);\n                            resolveContainer(container);\n                            handler = (await module)[symbol];\n                        } catch (err) {\n                            importError = "async";\n                            error = err;\n                        }\n                    }\n                    if (!handler) {\n                        emitEvent("qerror", __spreadValues({\n                            importError: importError,\n                            error: error\n                        }, eventData));\n                        break;\n                    }\n                    const previousCtx = doc[Q_CONTEXT];\n                    if (element.isConnected) {\n                        try {\n                            doc[Q_CONTEXT] = [ element, ev, url ];\n                            isSync || emitEvent("qsymbol", __spreadValues({}, eventData));\n                            const results = handler(ev, element);\n                            isPromise(results) && await results;\n                        } catch (error2) {\n                            emitEvent("qerror", __spreadValues({\n                                error: error2\n                            }, eventData));\n                        } finally {\n                            doc[Q_CONTEXT] = previousCtx;\n                        }\n                    }\n                }\n            }\n        };\n        const emitEvent = (eventName, detail) => {\n            doc.dispatchEvent(createEvent(eventName, detail));\n        };\n        const camelToKebab = str => str.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));\n        const processDocumentEvent = async ev => {\n            let type = camelToKebab(ev.type);\n            let element = ev.target;\n            broadcast("-document", ev, type);\n            while (element && element.getAttribute) {\n                const results = dispatch(element, "", ev, type);\n                let cancelBubble = ev.cancelBubble;\n                isPromise(results) && await results;\n                cancelBubble = cancelBubble || ev.cancelBubble || element.hasAttribute("stoppropagation:" + ev.type);\n                element = ev.bubbles && !0 !== cancelBubble ? element.parentElement : null;\n            }\n        };\n        const processWindowEvent = ev => {\n            broadcast("-window", ev, camelToKebab(ev.type));\n        };\n        const processReadyStateChange = () => {\n            var _a;\n            const readyState = doc.readyState;\n            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {\n                hasInitialized = 1;\n                emitEvent("qinit");\n                (null != (_a = win.requestIdleCallback) ? _a : win.setTimeout).bind(win)((() => emitEvent("qidle")));\n                if (events.has("qvisible")) {\n                    const results = querySelectorAll("[on\\\\:qvisible]");\n                    const observer = new IntersectionObserver((entries => {\n                        for (const entry of entries) {\n                            if (entry.isIntersecting) {\n                                observer.unobserve(entry.target);\n                                dispatch(entry.target, "", createEvent("qvisible", entry));\n                            }\n                        }\n                    }));\n                    results.forEach((el => observer.observe(el)));\n                }\n            }\n        };\n        const addEventListener = (el, eventName, handler, capture = !1) => el.addEventListener(eventName, handler, {\n            capture: capture,\n            passive: !1\n        });\n        const push = eventNames => {\n            for (const eventName of eventNames) {\n                if (!events.has(eventName)) {\n                    addEventListener(doc, eventName, processDocumentEvent, !0);\n                    addEventListener(win, eventName, processWindowEvent, !0);\n                    events.add(eventName);\n                }\n            }\n        };\n        if (!(Q_CONTEXT in doc)) {\n            doc[Q_CONTEXT] = 0;\n            const qwikevents = win.qwikevents;\n            Array.isArray(qwikevents) && push(qwikevents);\n            win.qwikevents = {\n                push: (...e) => push(e)\n            };\n            addEventListener(doc, "readystatechange", processReadyStateChange);\n            processReadyStateChange();\n        }\n    })(document);\n})()';
function getQwikLoaderScript(opts = {}) {
  return opts.debug ? QWIK_LOADER_DEFAULT_DEBUG : QWIK_LOADER_DEFAULT_MINIFIED;
}
function getPrefetchResources(snapshotResult, opts, resolvedManifest) {
  if (!resolvedManifest) {
    return [];
  }
  const prefetchStrategy = opts.prefetchStrategy;
  const buildBase = getBuildBase(opts);
  if (prefetchStrategy !== null) {
    if (!prefetchStrategy || !prefetchStrategy.symbolsToPrefetch || prefetchStrategy.symbolsToPrefetch === "auto") {
      return getAutoPrefetch(snapshotResult, resolvedManifest, buildBase);
    }
    if (typeof prefetchStrategy.symbolsToPrefetch === "function") {
      try {
        return prefetchStrategy.symbolsToPrefetch({ manifest: resolvedManifest.manifest });
      } catch (e) {
        console.error("getPrefetchUrls, symbolsToPrefetch()", e);
      }
    }
  }
  return [];
}
function getAutoPrefetch(snapshotResult, resolvedManifest, buildBase) {
  const prefetchResources = [];
  const qrls = snapshotResult == null ? void 0 : snapshotResult.qrls;
  const { mapper, manifest: manifest2 } = resolvedManifest;
  const urls = /* @__PURE__ */ new Map();
  if (Array.isArray(qrls)) {
    for (const obj of qrls) {
      const qrlSymbolName = obj.getHash();
      const resolvedSymbol = mapper[qrlSymbolName];
      if (resolvedSymbol) {
        addBundle(manifest2, urls, prefetchResources, buildBase, resolvedSymbol[1]);
      }
    }
  }
  return prefetchResources;
}
function addBundle(manifest2, urls, prefetchResources, buildBase, bundleFileName) {
  const url = buildBase + bundleFileName;
  let prefetchResource = urls.get(url);
  if (!prefetchResource) {
    prefetchResource = {
      url,
      imports: []
    };
    urls.set(url, prefetchResource);
    const bundle = manifest2.bundles[bundleFileName];
    if (bundle) {
      if (Array.isArray(bundle.imports)) {
        for (const importedFilename of bundle.imports) {
          addBundle(manifest2, urls, prefetchResource.imports, buildBase, importedFilename);
        }
      }
    }
  }
  prefetchResources.push(prefetchResource);
}
function getValidManifest(manifest2) {
  if (manifest2 != null && manifest2.mapping != null && typeof manifest2.mapping === "object" && manifest2.symbols != null && typeof manifest2.symbols === "object" && manifest2.bundles != null && typeof manifest2.bundles === "object") {
    return manifest2;
  }
  return void 0;
}
function workerFetchScript() {
  const fetch = `Promise.all(e.data.map(u=>fetch(u))).finally(()=>{setTimeout(postMessage({}),9999)})`;
  const workerBody = `onmessage=(e)=>{${fetch}}`;
  const blob = `new Blob(['${workerBody}'],{type:"text/javascript"})`;
  const url = `URL.createObjectURL(${blob})`;
  let s = `const w=new Worker(${url});`;
  s += `w.postMessage(u.map(u=>new URL(u,origin)+''));`;
  s += `w.onmessage=()=>{w.terminate()};`;
  return s;
}
function prefetchUrlsEventScript(prefetchResources) {
  const data = {
    bundles: flattenPrefetchResources(prefetchResources).map((u) => u.split("/").pop())
  };
  return `(${PREFETCH_BUNDLES_CODE})(
    document.currentScript.closest('[q\\\\:container]'),
    window.qwikPrefetchSW||(window.qwikPrefetchSW=[]),
    ${JSON.stringify(data.bundles)}
  );`;
}
var PREFETCH_BUNDLES_CODE = /* @__PURE__ */ ((qc, q, bundles) => {
  q.push(["prefetch", qc.getAttribute("q:base"), ...bundles]);
}).toString();
function flattenPrefetchResources(prefetchResources) {
  const urls = [];
  const addPrefetchResource = (prefetchResources2) => {
    if (Array.isArray(prefetchResources2)) {
      for (const prefetchResource of prefetchResources2) {
        if (!urls.includes(prefetchResource.url)) {
          urls.push(prefetchResource.url);
          addPrefetchResource(prefetchResource.imports);
        }
      }
    }
  };
  addPrefetchResource(prefetchResources);
  return urls;
}
function getMostReferenced(prefetchResources) {
  const common = /* @__PURE__ */ new Map();
  let total = 0;
  const addPrefetchResource = (prefetchResources2, visited2) => {
    if (Array.isArray(prefetchResources2)) {
      for (const prefetchResource of prefetchResources2) {
        const count = common.get(prefetchResource.url) || 0;
        common.set(prefetchResource.url, count + 1);
        total++;
        if (!visited2.has(prefetchResource.url)) {
          visited2.add(prefetchResource.url);
          addPrefetchResource(prefetchResource.imports, visited2);
        }
      }
    }
  };
  const visited = /* @__PURE__ */ new Set();
  for (const resource of prefetchResources) {
    visited.clear();
    addPrefetchResource(resource.imports, visited);
  }
  const threshold = total / common.size * 2;
  const urls = Array.from(common.entries());
  urls.sort((a, b) => b[1] - a[1]);
  return urls.slice(0, 5).filter((e) => e[1] > threshold).map((e) => e[0]);
}
function applyPrefetchImplementation(prefetchStrategy, prefetchResources, nonce) {
  const prefetchImpl = normalizePrefetchImplementation(prefetchStrategy == null ? void 0 : prefetchStrategy.implementation);
  const prefetchNodes = [];
  if (prefetchImpl.prefetchEvent === "always") {
    prefetchUrlsEvent(prefetchNodes, prefetchResources, nonce);
  }
  if (prefetchImpl.linkInsert === "html-append") {
    linkHtmlImplementation(prefetchNodes, prefetchResources, prefetchImpl);
  }
  if (prefetchImpl.linkInsert === "js-append") {
    linkJsImplementation(prefetchNodes, prefetchResources, prefetchImpl, nonce);
  } else if (prefetchImpl.workerFetchInsert === "always") {
    workerFetchImplementation(prefetchNodes, prefetchResources, nonce);
  }
  if (prefetchNodes.length > 0) {
    return jsx(Fragment, { children: prefetchNodes });
  }
  return null;
}
function prefetchUrlsEvent(prefetchNodes, prefetchResources, nonce) {
  const mostReferenced = getMostReferenced(prefetchResources);
  for (const url of mostReferenced) {
    prefetchNodes.push(
      jsx("link", {
        rel: "modulepreload",
        href: url,
        nonce
      })
    );
  }
  prefetchNodes.push(
    jsx("script", {
      "q:type": "prefetch-bundles",
      dangerouslySetInnerHTML: prefetchUrlsEventScript(prefetchResources) + `document.dispatchEvent(new CustomEvent('qprefetch', {detail:{links: [location.pathname]}}))`,
      nonce
    })
  );
}
function linkHtmlImplementation(prefetchNodes, prefetchResources, prefetchImpl) {
  const urls = flattenPrefetchResources(prefetchResources);
  const rel = prefetchImpl.linkRel || "prefetch";
  for (const url of urls) {
    const attributes = {};
    attributes["href"] = url;
    attributes["rel"] = rel;
    if (rel === "prefetch" || rel === "preload") {
      if (url.endsWith(".js")) {
        attributes["as"] = "script";
      }
    }
    prefetchNodes.push(jsx("link", attributes));
  }
}
function linkJsImplementation(prefetchNodes, prefetchResources, prefetchImpl, nonce) {
  const rel = prefetchImpl.linkRel || "prefetch";
  let s = ``;
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `let supportsLinkRel = true;`;
  }
  s += `const u=${JSON.stringify(flattenPrefetchResources(prefetchResources))};`;
  s += `u.map((u,i)=>{`;
  s += `const l=document.createElement('link');`;
  s += `l.setAttribute("href",u);`;
  s += `l.setAttribute("rel","${rel}");`;
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `if(i===0){`;
    s += `try{`;
    s += `supportsLinkRel=l.relList.supports("${rel}");`;
    s += `}catch(e){}`;
    s += `}`;
  }
  s += `document.body.appendChild(l);`;
  s += `});`;
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `if(!supportsLinkRel){`;
    s += workerFetchScript();
    s += `}`;
  }
  if (prefetchImpl.workerFetchInsert === "always") {
    s += workerFetchScript();
  }
  prefetchNodes.push(
    jsx("script", {
      type: "module",
      "q:type": "link-js",
      dangerouslySetInnerHTML: s,
      nonce
    })
  );
}
function workerFetchImplementation(prefetchNodes, prefetchResources, nonce) {
  let s = `const u=${JSON.stringify(flattenPrefetchResources(prefetchResources))};`;
  s += workerFetchScript();
  prefetchNodes.push(
    jsx("script", {
      type: "module",
      "q:type": "prefetch-worker",
      dangerouslySetInnerHTML: s,
      nonce
    })
  );
}
function normalizePrefetchImplementation(input) {
  return { ...PrefetchImplementationDefault, ...input };
}
var PrefetchImplementationDefault = {
  linkInsert: null,
  linkRel: null,
  workerFetchInsert: null,
  prefetchEvent: "always"
};
var DOCTYPE = "<!DOCTYPE html>";
async function renderToStream(rootNode, opts) {
  var _a, _b, _c;
  let stream = opts.stream;
  let bufferSize = 0;
  let totalSize = 0;
  let networkFlushes = 0;
  let firstFlushTime = 0;
  let buffer = "";
  let snapshotResult;
  const inOrderStreaming = ((_a = opts.streaming) == null ? void 0 : _a.inOrder) ?? {
    strategy: "auto",
    maximunInitialChunk: 5e4,
    maximunChunk: 3e4
  };
  const containerTagName = opts.containerTagName ?? "html";
  const containerAttributes = opts.containerAttributes ?? {};
  const nativeStream = stream;
  const firstFlushTimer = createTimer();
  const buildBase = getBuildBase(opts);
  const resolvedManifest = resolveManifest(opts.manifest);
  function flush() {
    if (buffer) {
      nativeStream.write(buffer);
      buffer = "";
      bufferSize = 0;
      networkFlushes++;
      if (networkFlushes === 1) {
        firstFlushTime = firstFlushTimer();
      }
    }
  }
  function enqueue(chunk) {
    const len = chunk.length;
    bufferSize += len;
    totalSize += len;
    buffer += chunk;
  }
  switch (inOrderStreaming.strategy) {
    case "disabled":
      stream = {
        write: enqueue
      };
      break;
    case "direct":
      stream = nativeStream;
      break;
    case "auto":
      let count = 0;
      let forceFlush = false;
      const minimunChunkSize = inOrderStreaming.maximunChunk ?? 0;
      const initialChunkSize = inOrderStreaming.maximunInitialChunk ?? 0;
      stream = {
        write(chunk) {
          if (chunk === "<!--qkssr-f-->") {
            forceFlush || (forceFlush = true);
          } else if (chunk === "<!--qkssr-pu-->") {
            count++;
          } else if (chunk === "<!--qkssr-po-->") {
            count--;
          } else {
            enqueue(chunk);
          }
          const chunkSize = networkFlushes === 0 ? initialChunkSize : minimunChunkSize;
          if (count === 0 && (forceFlush || bufferSize >= chunkSize)) {
            forceFlush = false;
            flush();
          }
        }
      };
      break;
  }
  if (containerTagName === "html") {
    stream.write(DOCTYPE);
  } else {
    stream.write("<!--cq-->");
    if (opts.qwikLoader) {
      if (opts.qwikLoader.include === void 0) {
        opts.qwikLoader.include = "never";
      }
      if (opts.qwikLoader.position === void 0) {
        opts.qwikLoader.position = "bottom";
      }
    } else {
      opts.qwikLoader = {
        include: "never"
      };
    }
    if (!opts.qwikPrefetchServiceWorker) {
      opts.qwikPrefetchServiceWorker = {};
    }
    if (!opts.qwikPrefetchServiceWorker.include) {
      opts.qwikPrefetchServiceWorker.include = false;
    }
    if (!opts.qwikPrefetchServiceWorker.position) {
      opts.qwikPrefetchServiceWorker.position = "top";
    }
  }
  if (!opts.manifest) {
    console.warn(
      `Missing client manifest, loading symbols in the client might 404. Please ensure the client build has run and generated the manifest for the server build.`
    );
  }
  await setServerPlatform(opts, resolvedManifest);
  const injections = resolvedManifest == null ? void 0 : resolvedManifest.manifest.injections;
  const beforeContent = injections ? injections.map((injection) => jsx(injection.tag, injection.attributes ?? {})) : [];
  const includeMode = ((_b = opts.qwikLoader) == null ? void 0 : _b.include) ?? "auto";
  const positionMode = ((_c = opts.qwikLoader) == null ? void 0 : _c.position) ?? "bottom";
  if (positionMode === "top" && includeMode !== "never") {
    const qwikLoaderScript = getQwikLoaderScript({
      debug: opts.debug
    });
    beforeContent.push(
      jsx("script", {
        id: "qwikloader",
        dangerouslySetInnerHTML: qwikLoaderScript
      })
    );
    beforeContent.push(
      jsx("script", {
        dangerouslySetInnerHTML: `window.qwikevents.push('click')`
      })
    );
  }
  const renderTimer = createTimer();
  const renderSymbols = [];
  let renderTime = 0;
  let snapshotTime = 0;
  await _renderSSR(rootNode, {
    stream,
    containerTagName,
    containerAttributes,
    serverData: opts.serverData,
    base: buildBase,
    beforeContent,
    beforeClose: async (contexts, containerState, _dynamic, textNodes) => {
      var _a2, _b2, _c2, _d, _e;
      renderTime = renderTimer();
      const snapshotTimer = createTimer();
      snapshotResult = await _pauseFromContexts(contexts, containerState, void 0, textNodes);
      const children = [];
      if (opts.prefetchStrategy !== null) {
        const prefetchResources = getPrefetchResources(snapshotResult, opts, resolvedManifest);
        if (prefetchResources.length > 0) {
          const prefetchImpl = applyPrefetchImplementation(
            opts.prefetchStrategy,
            prefetchResources,
            (_a2 = opts.serverData) == null ? void 0 : _a2.nonce
          );
          if (prefetchImpl) {
            children.push(prefetchImpl);
          }
        }
      }
      const jsonData = JSON.stringify(snapshotResult.state, void 0, void 0);
      children.push(
        jsx("script", {
          type: "qwik/json",
          dangerouslySetInnerHTML: escapeText(jsonData),
          nonce: (_b2 = opts.serverData) == null ? void 0 : _b2.nonce
        })
      );
      if (snapshotResult.funcs.length > 0) {
        children.push(
          jsx("script", {
            "q:func": "qwik/json",
            dangerouslySetInnerHTML: serializeFunctions(snapshotResult.funcs),
            nonce: (_c2 = opts.serverData) == null ? void 0 : _c2.nonce
          })
        );
      }
      const needLoader = !snapshotResult || snapshotResult.mode !== "static";
      const includeLoader = includeMode === "always" || includeMode === "auto" && needLoader;
      if (includeLoader) {
        const qwikLoaderScript = getQwikLoaderScript({
          debug: opts.debug
        });
        children.push(
          jsx("script", {
            id: "qwikloader",
            dangerouslySetInnerHTML: qwikLoaderScript,
            nonce: (_d = opts.serverData) == null ? void 0 : _d.nonce
          })
        );
      }
      const extraListeners = Array.from(containerState.$events$, (s) => JSON.stringify(s));
      if (extraListeners.length > 0) {
        const content = (includeLoader ? `window.qwikevents` : `(window.qwikevents||=[])`) + `.push(${extraListeners.join(", ")})`;
        children.push(
          jsx("script", {
            dangerouslySetInnerHTML: content,
            nonce: (_e = opts.serverData) == null ? void 0 : _e.nonce
          })
        );
      }
      collectRenderSymbols(renderSymbols, contexts);
      snapshotTime = snapshotTimer();
      return jsx(Fragment, { children });
    },
    manifestHash: (resolvedManifest == null ? void 0 : resolvedManifest.manifest.manifestHash) || "dev"
  });
  if (containerTagName !== "html") {
    stream.write("<!--/cq-->");
  }
  flush();
  const isDynamic = snapshotResult.resources.some((r) => r._cache !== Infinity);
  const result = {
    prefetchResources: void 0,
    snapshotResult,
    flushes: networkFlushes,
    manifest: resolvedManifest == null ? void 0 : resolvedManifest.manifest,
    size: totalSize,
    isStatic: !isDynamic,
    timing: {
      render: renderTime,
      snapshot: snapshotTime,
      firstFlush: firstFlushTime
    },
    _symbols: renderSymbols
  };
  return result;
}
function resolveManifest(manifest2) {
  if (!manifest2) {
    return void 0;
  }
  if ("mapper" in manifest2) {
    return manifest2;
  }
  manifest2 = getValidManifest(manifest2);
  if (manifest2) {
    const mapper = {};
    Object.entries(manifest2.mapping).forEach(([key, value]) => {
      mapper[getSymbolHash(key)] = [key, value];
    });
    return {
      mapper,
      manifest: manifest2
    };
  }
  return void 0;
}
var escapeText = (str) => {
  return str.replace(/<(\/?script)/gi, "\\x3C$1");
};
function collectRenderSymbols(renderSymbols, elements) {
  var _a;
  for (const ctx of elements) {
    const symbol = (_a = ctx.$componentQrl$) == null ? void 0 : _a.getSymbol();
    if (symbol && !renderSymbols.includes(symbol)) {
      renderSymbols.push(symbol);
    }
  }
}
var Q_FUNCS_PREFIX = 'document.currentScript.closest("[q\\\\:container]").qFuncs=';
function serializeFunctions(funcs) {
  return Q_FUNCS_PREFIX + `[${funcs.join(",\n")}]`;
}
async function setServerPlatform2(manifest2) {
  const platform = createPlatform({ manifest: manifest2 }, resolveManifest(manifest2));
  setPlatform(platform);
}
const manifest = { "manifestHash": "vkmpix", "symbols": { "s_02wMImzEAbk": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "QwikCityProvider_component_useTask", "canonicalFilename": "s_02wmimzeabk", "hash": "02wMImzEAbk", "ctxKind": "function", "ctxName": "useTask$", "captures": true, "parent": "s_TxCFOy819ag", "loc": [27380, 36565] }, "s_yxtomTAcFP0": { "origin": "routes/index.tsx", "displayName": "routes_component_useTask", "canonicalFilename": "s_yxtomtacfp0", "hash": "yxtomTAcFP0", "ctxKind": "function", "ctxName": "useTask$", "captures": false, "parent": "s_B0lqk5IDDy4", "loc": [198, 601] }, "s_0vphQYqOdZI": { "origin": "components/router-head/router-head.tsx", "displayName": "RouterHead_component", "canonicalFilename": "s_0vphqyqodzi", "hash": "0vphQYqOdZI", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [243, 1201] }, "s_8gdLBszqbaM": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "Link_component", "canonicalFilename": "s_8gdlbszqbam", "hash": "8gdLBszqbaM", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [38549, 41209] }, "s_B0lqk5IDDy4": { "origin": "routes/index.tsx", "displayName": "routes_component", "canonicalFilename": "s_b0lqk5iddy4", "hash": "B0lqk5IDDy4", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [179, 824] }, "s_Nk9PlpjQm9Y": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "GetForm_component", "canonicalFilename": "s_nk9plpjqm9y", "hash": "Nk9PlpjQm9Y", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [53873, 55644] }, "s_TxCFOy819ag": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "QwikCityProvider_component", "canonicalFilename": "s_txcfoy819ag", "hash": "TxCFOy819ag", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [23840, 36852] }, "s_VKFlAWJuVm8": { "origin": "routes/layout.tsx", "displayName": "layout_component", "canonicalFilename": "s_vkflawjuvm8", "hash": "VKFlAWJuVm8", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [340, 409] }, "s_WmYC5H00wtI": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "QwikCityMockProvider_component", "canonicalFilename": "s_wmyc5h00wti", "hash": "WmYC5H00wtI", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [37136, 38430] }, "s_dT0sDkUStYI": { "origin": "routes/about/index.tsx", "displayName": "about_component", "canonicalFilename": "s_dt0sdkustyi", "hash": "dT0sDkUStYI", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [134, 319] }, "s_e0ssiDXoeAM": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "RouterOutlet_component", "canonicalFilename": "s_e0ssidxoeam", "hash": "e0ssiDXoeAM", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [7828, 8542] }, "s_tntnak2DhJ8": { "origin": "root.tsx", "displayName": "root_component", "canonicalFilename": "s_tntnak2dhj8", "hash": "tntnak2DhJ8", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [298, 603] }, "s_tySZ00tiUmE": { "origin": "routes/contact/index.tsx", "displayName": "contact_component", "canonicalFilename": "s_tysz00tiume", "hash": "tySZ00tiUmE", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [134, 338] }, "s_wFy1avhM7i4": { "origin": "components/nav/nav.tsx", "displayName": "Nav_component", "canonicalFilename": "s_wfy1avhm7i4", "hash": "wFy1avhM7i4", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [125, 402] }, "s_RPDJAz33WLA": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "QwikCityProvider_component_useStyles", "canonicalFilename": "s_rpdjaz33wla", "hash": "RPDJAz33WLA", "ctxKind": "function", "ctxName": "useStyles$", "captures": false, "parent": "s_TxCFOy819ag", "loc": [23895, 23929] }, "s_A5bZC7WO00A": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "routeActionQrl_action_submit", "canonicalFilename": "s_a5bzc7wo00a", "hash": "A5bZC7WO00A", "ctxKind": "function", "ctxName": "submit", "captures": true, "parent": null, "loc": [42279, 43946] }, "s_DyVc0YBIqQU": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "spa_init", "canonicalFilename": "s_dyvc0ybiqqu", "hash": "DyVc0YBIqQU", "ctxKind": "function", "ctxName": "spaInit", "captures": false, "parent": null, "loc": [1366, 6841] }, "s_SGytLJ8uq8I": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "serverQrl_rpc", "canonicalFilename": "s_sgytlj8uq8i", "hash": "SGytLJ8uq8I", "ctxKind": "function", "ctxName": "rpc", "captures": true, "parent": null, "loc": [47701, 50608] }, "s_uPHV2oGn4wc": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "Form_form_onSubmit", "canonicalFilename": "s_uphv2ogn4wc", "hash": "uPHV2oGn4wc", "ctxKind": "function", "ctxName": "_jsxS", "captures": true, "parent": null, "loc": [52785, 52934] }, "s_BUbtvTyvVRE": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "QwikCityMockProvider_component_goto", "canonicalFilename": "s_bubtvtyvvre", "hash": "BUbtvTyvVRE", "ctxKind": "function", "ctxName": "goto", "captures": false, "parent": "s_WmYC5H00wtI", "loc": [37551, 37629] }, "s_KK5BfmKH4ZI": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "GetForm_component_form_onSubmit_1", "canonicalFilename": "s_kk5bfmkh4zi", "hash": "KK5BfmKH4ZI", "ctxKind": "function", "ctxName": "_jsxS", "captures": false, "parent": "s_Nk9PlpjQm9Y", "loc": [54979, 55303] }, "s_Osdg8FnYTw4": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "Link_component_handlePrefetch", "canonicalFilename": "s_osdg8fnytw4", "hash": "Osdg8FnYTw4", "ctxKind": "function", "ctxName": "handlePrefetch", "captures": false, "parent": "s_8gdLBszqbaM", "loc": [39249, 39580] }, "s_fX0bDjeJa0E": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "QwikCityProvider_component_goto", "canonicalFilename": "s_fx0bdjeja0e", "hash": "fX0bDjeJa0E", "ctxKind": "function", "ctxName": "goto", "captures": true, "parent": "s_TxCFOy819ag", "loc": [25238, 26768] }, "s_p9MSze0ojs4": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "GetForm_component_form_onSubmit", "canonicalFilename": "s_p9msze0ojs4", "hash": "p9MSze0ojs4", "ctxKind": "function", "ctxName": "_jsxS", "captures": true, "parent": "s_Nk9PlpjQm9Y", "loc": [54464, 54873] }, "s_pIf0khHUxfY": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "Link_component_handleClick", "canonicalFilename": "s_pif0khhuxfy", "hash": "pIf0khHUxfY", "ctxKind": "function", "ctxName": "handleClick", "captures": true, "parent": "s_8gdLBszqbaM", "loc": [40007, 40527] } }, "mapping": { "s_02wMImzEAbk": "q-RZj6nE4l.js", "s_yxtomTAcFP0": "q-BsOk4gEL.js", "s_0vphQYqOdZI": "q-CNrtghqX.js", "s_8gdLBszqbaM": "q-DEI5Cd53.js", "s_B0lqk5IDDy4": "q-BsOk4gEL.js", "s_Nk9PlpjQm9Y": "q-Bu7bx-ei.js", "s_TxCFOy819ag": "q-RZj6nE4l.js", "s_VKFlAWJuVm8": "q-DogreDBT.js", "s_WmYC5H00wtI": "q-CB42n-K3.js", "s_dT0sDkUStYI": "q-DnIiBuLN.js", "s_e0ssiDXoeAM": "q-C33VT2u9.js", "s_tntnak2DhJ8": "q-DJlPZCr5.js", "s_tySZ00tiUmE": "q-C2c6kTa8.js", "s_wFy1avhM7i4": "q-CZc4KWyE.js", "s_RPDJAz33WLA": "q-RZj6nE4l.js", "s_A5bZC7WO00A": "q-y_0TniEN.js", "s_DyVc0YBIqQU": "q-D3WBTSLL.js", "s_SGytLJ8uq8I": "q-noP6Dt6X.js", "s_uPHV2oGn4wc": "q-CaqSWp3X.js", "s_BUbtvTyvVRE": "q-CB42n-K3.js", "s_KK5BfmKH4ZI": "q-Bu7bx-ei.js", "s_Osdg8FnYTw4": "q-DEI5Cd53.js", "s_fX0bDjeJa0E": "q-RZj6nE4l.js", "s_p9MSze0ojs4": "q-Bu7bx-ei.js", "s_pIf0khHUxfY": "q-DEI5Cd53.js" }, "bundles": { "q-B-MtWErC.js": { "size": 63490, "origins": ["@builder.io/qwik/build", "node_modules/@builder.io/qwik/core.prod.mjs"] }, "q-BdxbG0N0.js": { "size": 282, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js"], "dynamicImports": ["q-C2c6kTa8.js"], "origins": ["src/routes/contact/index.tsx"] }, "q-Bq36Wx9q.js": { "size": 2539, "origins": ["node_modules/@builder.io/qwik-city/service-worker.mjs", "src/routes/service-worker.ts"] }, "q-BsOk4gEL.js": { "size": 38024, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js"], "dynamicImports": ["q-D0wUyzt0.js", "q-DCmgQxSA.js"], "origins": ["node_modules/@firebase/app/dist/esm/index.esm2017.js", "node_modules/@firebase/component/dist/esm/index.esm2017.js", "node_modules/@firebase/logger/dist/esm/index.esm2017.js", "node_modules/@firebase/util/dist/index.esm2017.js", "node_modules/firebase/app/dist/esm/index.esm.js", "node_modules/idb/build/index.js", "node_modules/idb/build/wrap-idb-value.js", "src/entry_routes.js", "src/firebase.ts", "src/s_b0lqk5iddy4.js", "src/s_yxtomtacfp0.js"], "symbols": ["s_B0lqk5IDDy4", "s_yxtomTAcFP0"] }, "q-Bu7bx-ei.js": { "size": 1356, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js", "q-wyVAsFIh.js"], "origins": ["src/entry_GetForm.js", "src/s_kk5bfmkh4zi.js", "src/s_nk9plpjqm9y.js", "src/s_p9msze0ojs4.js"], "symbols": ["s_KK5BfmKH4ZI", "s_Nk9PlpjQm9Y", "s_p9MSze0ojs4"] }, "q-C0ajQEww.js": { "size": 274, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js"], "dynamicImports": ["q-DogreDBT.js"], "origins": ["src/routes/layout.tsx"] }, "q-C2c6kTa8.js": { "size": 318, "imports": ["q-B-MtWErC.js"], "origins": ["src/entry_contact.js", "src/s_tysz00tiume.js"], "symbols": ["s_tySZ00tiUmE"] }, "q-C33VT2u9.js": { "size": 491, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js", "q-wyVAsFIh.js"], "origins": ["src/entry_RouterOutlet.js", "src/s_e0ssidxoeam.js"], "symbols": ["s_e0ssiDXoeAM"] }, "q-CaqSWp3X.js": { "size": 125, "imports": ["q-B-MtWErC.js"], "origins": ["src/entry_Form.js", "src/s_uphv2ogn4wc.js"], "symbols": ["s_uPHV2oGn4wc"] }, "q-CB42n-K3.js": { "size": 845, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js", "q-wyVAsFIh.js"], "origins": ["src/entry_QwikCityMockProvider.js", "src/s_bubtvtyvvre.js", "src/s_wmyc5h00wti.js"], "symbols": ["s_BUbtvTyvVRE", "s_WmYC5H00wtI"] }, "q-CNrtghqX.js": { "size": 903, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js", "q-wyVAsFIh.js"], "origins": ["src/entry_RouterHead.js", "src/s_0vphqyqodzi.js"], "symbols": ["s_0vphQYqOdZI"] }, "q-CZc4KWyE.js": { "size": 458, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js", "q-wyVAsFIh.js"], "origins": ["src/entry_Nav.js", "src/s_wfy1avhm7i4.js"], "symbols": ["s_wFy1avhM7i4"] }, "q-D0wUyzt0.js": { "size": 159, "imports": ["q-B-MtWErC.js", "q-BsOk4gEL.js", "q-uemlvruI.js"] }, "q-D3WBTSLL.js": { "size": 2280, "origins": ["src/entry_spaInit.js", "src/s_dyvc0ybiqqu.js"], "symbols": ["s_DyVc0YBIqQU"] }, "q-DCmgQxSA.js": { "size": 34567, "imports": ["q-B-MtWErC.js", "q-BsOk4gEL.js", "q-uemlvruI.js"], "origins": ["node_modules/@firebase/analytics/dist/esm/index.esm2017.js", "node_modules/@firebase/installations/dist/esm/index.esm2017.js", "node_modules/firebase/analytics/dist/esm/index.esm.js"] }, "q-DEI5Cd53.js": { "size": 1519, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js", "q-wyVAsFIh.js"], "origins": ["src/entry_Link.js", "src/s_8gdlbszqbam.js", "src/s_osdg8fnytw4.js", "src/s_pif0khhuxfy.js"], "symbols": ["s_8gdLBszqbaM", "s_Osdg8FnYTw4", "s_pIf0khHUxfY"] }, "q-DJlPZCr5.js": { "size": 507, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js", "q-wyVAsFIh.js"], "dynamicImports": ["q-CNrtghqX.js"], "origins": ["src/components/router-head/router-head.tsx", "src/entry_root.js", "src/s_tntnak2dhj8.js"], "symbols": ["s_tntnak2DhJ8"] }, "q-DkE1KGcv.js": { "size": 171, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js"], "dynamicImports": ["q-DJlPZCr5.js"], "origins": ["src/global.css", "src/root.tsx"] }, "q-DnIiBuLN.js": { "size": 299, "imports": ["q-B-MtWErC.js"], "origins": ["src/entry_about.js", "src/s_dt0sdkustyi.js"], "symbols": ["s_dT0sDkUStYI"] }, "q-DogreDBT.js": { "size": 264, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js"], "dynamicImports": ["q-CZc4KWyE.js"], "origins": ["src/components/nav/nav.tsx", "src/entry_layout.js", "src/s_vkflawjuvm8.js"], "symbols": ["s_VKFlAWJuVm8"] }, "q-HWK0bETK.js": { "size": 274, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js"], "dynamicImports": ["q-DnIiBuLN.js"], "origins": ["src/routes/about/index.tsx"] }, "q-jMD-pBAc.js": { "size": 125, "imports": ["q-uemlvruI.js"], "dynamicImports": ["q-Bq36Wx9q.js"], "origins": ["@qwik-city-entries"] }, "q-noP6Dt6X.js": { "size": 1215, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js", "q-wyVAsFIh.js"], "origins": ["src/entry_serverQrl.js", "src/s_sgytlj8uq8i.js"], "symbols": ["s_SGytLJ8uq8I"] }, "q-rrJbSY-E.js": { "size": 269, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js"], "dynamicImports": ["q-D0wUyzt0.js"], "origins": ["src/routes/index.tsx"] }, "q-RZj6nE4l.js": { "size": 5843, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js", "q-wyVAsFIh.js"], "dynamicImports": ["q-BdxbG0N0.js", "q-C0ajQEww.js", "q-HWK0bETK.js", "q-jMD-pBAc.js", "q-rrJbSY-E.js"], "origins": ["@qwik-city-plan", "src/entry_QwikCityProvider.js", "src/s_02wmimzeabk.js", "src/s_fx0bdjeja0e.js", "src/s_rpdjaz33wla.js", "src/s_txcfoy819ag.js"], "symbols": ["s_02wMImzEAbk", "s_fX0bDjeJa0E", "s_RPDJAz33WLA", "s_TxCFOy819ag"] }, "q-uemlvruI.js": { "size": 1077 }, "q-wyVAsFIh.js": { "size": 7943, "imports": ["q-B-MtWErC.js", "q-uemlvruI.js"], "dynamicImports": ["q-C33VT2u9.js", "q-D3WBTSLL.js", "q-DEI5Cd53.js", "q-RZj6nE4l.js"], "origins": ["@qwik-city-sw-register", "node_modules/@builder.io/qwik-city/index.qwik.mjs"] }, "q-y_0TniEN.js": { "size": 761, "imports": ["q-B-MtWErC.js"], "origins": ["src/entry_routeActionQrl.js", "src/s_a5bzc7wo00a.js"], "symbols": ["s_A5bZC7WO00A"] } }, "injections": [{ "tag": "link", "location": "head", "attributes": { "rel": "stylesheet", "href": "/build/q-Cv7Jo5vQ.css" } }], "version": "1", "options": { "target": "client", "buildMode": "production", "entryStrategy": { "type": "smart" } }, "platform": { "qwik": "1.5.7", "vite": "", "rollup": "4.18.0", "env": "node", "os": "linux", "node": "20.14.0" } };
const s_0vphQYqOdZI = () => {
  const head = useDocumentHead();
  const loc = useLocation();
  return /* @__PURE__ */ _jsxC(Fragment, {
    children: [
      /* @__PURE__ */ _jsxQ("title", null, null, head.title, 1, null),
      /* @__PURE__ */ _jsxQ("link", null, {
        rel: "canonical",
        href: _fnSignal((p0) => p0.url.href, [
          loc
        ], "p0.url.href")
      }, null, 3, null),
      /* @__PURE__ */ _jsxQ("meta", null, {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0"
      }, null, 3, null),
      /* @__PURE__ */ _jsxQ("link", null, {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg"
      }, null, 3, null),
      head.meta.map((m) => /* @__PURE__ */ _jsxS("meta", {
        ...m
      }, null, 0, m.key)),
      head.links.map((l) => /* @__PURE__ */ _jsxS("link", {
        ...l
      }, null, 0, l.key)),
      head.styles.map((s) => {
        var _a;
        return /* @__PURE__ */ _jsxS("style", {
          ...s.props,
          ...((_a = s.props) == null ? void 0 : _a.dangerouslySetInnerHTML) ? {} : {
            dangerouslySetInnerHTML: s.style
          }
        }, null, 0, s.key);
      }),
      head.scripts.map((s) => {
        var _a;
        return /* @__PURE__ */ _jsxS("script", {
          ...s.props,
          ...((_a = s.props) == null ? void 0 : _a.dangerouslySetInnerHTML) ? {} : {
            dangerouslySetInnerHTML: s.script
          }
        }, null, 0, s.key);
      })
    ]
  }, 1, "0D_0");
};
const RouterHead = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_0vphQYqOdZI, "s_0vphQYqOdZI"));
const s_tntnak2DhJ8 = () => {
  return /* @__PURE__ */ _jsxC(QwikCityProvider, {
    children: [
      /* @__PURE__ */ _jsxQ("head", null, null, [
        /* @__PURE__ */ _jsxQ("meta", null, {
          charset: "utf-8"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("link", null, {
          rel: "manifest",
          href: "/manifest.json"
        }, null, 3, null),
        /* @__PURE__ */ _jsxC(RouterHead, null, 3, "vp_0")
      ], 1, null),
      /* @__PURE__ */ _jsxQ("body", null, {
        lang: "en"
      }, [
        /* @__PURE__ */ _jsxC(RouterOutlet, null, 3, "vp_1"),
        /* @__PURE__ */ _jsxC(ServiceWorkerRegister, null, 3, "vp_2")
      ], 1, null)
    ]
  }, 1, "vp_3");
};
const Root = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_tntnak2DhJ8, "s_tntnak2DhJ8"));
function render(opts) {
  return renderToStream(/* @__PURE__ */ _jsxC(Root, null, 3, "Qb_0"), {
    manifest,
    ...opts,
    // Use container attributes to set attributes on the html tag.
    containerAttributes: {
      lang: "en-us",
      ...opts.containerAttributes
    },
    serverData: {
      ...opts.serverData
    }
  });
}
export {
  manifest as m,
  render as r,
  setServerPlatform2 as s
};

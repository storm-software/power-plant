/* -------------------------------------------------------------------

                  🗲 Storm Software - Power Plant

 This code was released as part of the Power Plant project. Power Plant
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/power-plant.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/power-plant
 Documentation:            https://docs.stormsoftware.com/projects/power-plant
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import {
  getDefaultContext as __emnapiGetDefaultContext,
  instantiateNapiModuleSync as __emnapiInstantiateNapiModuleSync,
  WASI as __WASI
} from "@napi-rs/wasm-runtime";

const __wasi = new __WASI({
  version: "preview1"
});

const __wasmUrl = new URL(
  "./power-plant-bindings.wasm32-wasi.wasm",
  import.meta.url
).href;
const __emnapiContext = __emnapiGetDefaultContext();

const __sharedMemory = new WebAssembly.Memory({
  initial: 4000,
  maximum: 65536,
  shared: true
});

const __wasmFile = await fetch(__wasmUrl).then(res => res.arrayBuffer());

const {
  instance: __napiInstance,
  module: __wasiModule,
  napiModule: __napiModule
} = __emnapiInstantiateNapiModuleSync(__wasmFile, {
  context: __emnapiContext,
  asyncWorkPoolSize: 4,
  wasi: __wasi,
  onCreateWorker() {
    const worker = new Worker(
      new URL("./wasi-worker-browser.mjs", import.meta.url),
      {
        type: "module"
      }
    );

    return worker;
  },
  overwriteImports(importObject) {
    importObject.env = {
      ...importObject.env,
      ...importObject.napi,
      ...importObject.emnapi,
      memory: __sharedMemory
    };
    return importObject;
  },
  beforeInit({ instance }) {
    for (const name of Object.keys(instance.exports)) {
      if (name.startsWith("__napi_register__")) {
        instance.exports[name]();
      }
    }
  }
});
export default __napiModule.exports;
export const Severity = __napiModule.exports.Severity;
export const ParseResult = __napiModule.exports.ParseResult;
export const ExportExportNameKind = __napiModule.exports.ExportExportNameKind;
export const ExportImportNameKind = __napiModule.exports.ExportImportNameKind;
export const ExportLocalNameKind = __napiModule.exports.ExportLocalNameKind;
export const ImportNameKind = __napiModule.exports.ImportNameKind;
export const parseAsync = __napiModule.exports.parseAsync;
export const parseSync = __napiModule.exports.parseSync;
export const rawTransferSupported = __napiModule.exports.rawTransferSupported;
export const ResolverFactory = __napiModule.exports.ResolverFactory;
export const EnforceExtension = __napiModule.exports.EnforceExtension;
export const ModuleType = __napiModule.exports.ModuleType;
export const sync = __napiModule.exports.sync;
export const HelperMode = __napiModule.exports.HelperMode;
export const isolatedDeclaration = __napiModule.exports.isolatedDeclaration;
export const moduleRunnerTransform = __napiModule.exports.moduleRunnerTransform;
export const transform = __napiModule.exports.transform;
export const transformAsync = __napiModule.exports.transformAsync;
export const BindingEngine = __napiModule.exports.BindingEngine;
export const TraceSubscriberGuard = __napiModule.exports.TraceSubscriberGuard;
export const BindingLogLevel = __napiModule.exports.BindingLogLevel;
export const createTokioRuntime = __napiModule.exports.createTokioRuntime;
export const initTraceSubscriber = __napiModule.exports.initTraceSubscriber;
export const shutdownAsyncRuntime = __napiModule.exports.shutdownAsyncRuntime;
export const startAsyncRuntime = __napiModule.exports.startAsyncRuntime;

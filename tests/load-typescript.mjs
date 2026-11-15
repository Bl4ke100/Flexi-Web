import ts from "typescript";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

export function loadTypescript(path, mocks = {}, env = process.env) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const javascript = ts.transpileModule(source, { fileName: path, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  const localRequire = name => Object.hasOwn(mocks, name) ? mocks[name] : require(name);
  new Function("require", "module", "exports", "process", javascript)(localRequire, module, module.exports, { env });
  return module.exports;
}

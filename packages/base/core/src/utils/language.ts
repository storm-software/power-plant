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

import { findFileExtensionSafe } from "@stryke/path/find";
import type { Language } from "../types/execution";

const EXTENSION_LANGUAGE_MAP = {
  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  pyw: "python",
  pyi: "python",
  java: "java",
  cs: "c#",
  cpp: "c++",
  cxx: "c++",
  cc: "c++",
  hpp: "c++",
  hxx: "c++",
  hh: "c++",
  c: "c",
  h: "c",
  rs: "rust",
  go: "go",
  php: "php",
  rb: "ruby",
  rake: "ruby",
  gemspec: "ruby",
  swift: "swift",
  kt: "kotlin",
  kts: "kotlin",
  scala: "scala",
  sc: "scala",
  hs: "haskell",
  lhs: "haskell",
  elm: "elm",
  ex: "elixir",
  exs: "elixir",
  erl: "erlang",
  hrl: "erlang",
  ml: "ocaml",
  mli: "ocaml",
  fs: "f#",
  fsi: "f#",
  fsx: "f#",
  groovy: "groovy",
  gvy: "groovy",
  gy: "groovy",
  gsh: "groovy",
  gsp: "groovy-server-pages",
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  less: "less",
  sass: "sass",
  style: "stylus",
  pug: "pug",
  jade: "pug",
  haml: "haml",
  slim: "slim",
  md: "markdown",
  markdown: "markdown",
  mdown: "markdown",
  mkd: "markdown",
  mkdn: "markdown",
  rst: "rst",
  adoc: "asciidoc",
  asciidoc: "asciidoc",
  asc: "asciidoc",
  org: "org",
  textile: "textile",
  creole: "creole",
  wiki: "creole",
  mediawiki: "mediawiki",
  mw: "mediawiki",
  yaml: "yaml",
  yml: "yaml",
  json: "json",
  toml: "toml",
  xml: "xml",
  xsd: "xml",
  xsl: "xml",
  xslt: "xml",
  csv: "csv",
  tsv: "tsv",
  sql: "sql",
  graphql: "graphql",
  gql: "graphql",
  proto: "protobuf",
  thrift: "thrift",
  capnp: "capnp",
  avro: "avro",
  avsc: "avro-json",
  avdl: "avro"
} as const satisfies Record<string, Language>;

/**
 * Resolves a file path to a {@link Language}.
 *
 * @remarks
 * This function will extract the file extension from the path and use it to determine the language.
 *
 * @example
 * ```ts
 * getLanguage("src/index.ts"); // "typescript"
 * getLanguage("src/index.js"); // "javascript"
 * getLanguage("src/index.py"); // "python"
 * getLanguage("src/index.java"); // "java"
 * getLanguage("src/index.cs"); // "c#"
 * getLanguage("src/index.cpp"); // "c++"
 * getLanguage("src/index.c"); // "c"
 * getLanguage("src/index.rs"); // "rust"
 * getLanguage("src/index.go"); // "go"
 * getLanguage("src/index.php"); // "php"
 * getLanguage("src/index.rb"); // "ruby"
 * getLanguage("src/index.swift"); // "swift"
 * getLanguage("src/index.kt"); // "kotlin"
 * getLanguage("src/index.scala"); // "scala"
 * getLanguage("src/index.hs"); // "haskell"
 * getLanguage("src/index.elm"); // "elm"
 * getLanguage("src/index.ex"); // "elixir"
 * getLanguage("src/index.erl"); // "erlang"
 * getLanguage("src/index.ml"); // "ocaml"
 * getLanguage("src/index.fs"); // "f#"
 * getLanguage("src/index.groovy"); // "groovy"
 * getLanguage("src/index.html"); // "html"
 * getLanguage("src/index.css"); // "css"
 * getLanguage("src/index.scss"); // "scss"
 * getLanguage("src/index.less"); // "less"
 * getLanguage("src/index.sass"); // "sass"
 * getLanguage("src/index.style"); // "stylus"
 * getLanguage("src/index.pug"); // "pug"
 * getLanguage("src/index.jade"); // "pug"
 * getLanguage("src/index.haml"); // "haml"
 * getLanguage("src/index.slim"); // "slim"
 * getLanguage("src/index.md"); // "markdown"
 * getLanguage("src/index.markdown"); // "markdown"
 * getLanguage("src/index.mdown"); // "markdown"
 * getLanguage("src/index.mkd"); // "markdown"
 * getLanguage("src/index.mkdn"); // "markdown"
 * getLanguage("src/index.rst"); // "rst"
 * getLanguage("src/index.adoc"); // "asciidoc"
 * getLanguage("src/index.asciidoc"); // "asciidoc"
 * getLanguage("src/index.asc"); // "asciidoc"
 * getLanguage("src/index.org"); // "org"
 * getLanguage("src/index.textile"); // "textile"
 * getLanguage("src/index.creole"); // "creole"
 * getLanguage("src/index.wiki"); // "creole"
 * getLanguage("src/index.mediawiki"); // "mediawiki"
 * getLanguage("src/index.mw"); // "mediawiki"
 * getLanguage("src/index.yaml"); // "yaml"
 * getLanguage("src/index.yml"); // "yaml"
 * getLanguage("src/index.json"); // "json"
 * getLanguage("src/index.toml"); // "toml"
 * getLanguage("src/index.xml"); // "xml"
 * getLanguage("src/index.xsd"); // "xml"
 * getLanguage("src/index.xsl"); // "xml"
 * getLanguage("src/index.xslt"); // "xml"
 * getLanguage("src/index.csv"); // "csv"
 * getLanguage("src/index.tsv"); // "tsv"
 * getLanguage("src/index.sql"); // "sql"
 * getLanguage("src/index.graphql"); // "graphql"
 * getLanguage("src/index.gql"); // "graphql"
 * getLanguage("src/index.proto"); // "protobuf"
 * getLanguage("src/index.thrift"); // "thrift"
 * getLanguage("src/index.capnp"); // "capnp"
 * getLanguage("src/index.avro"); // "avro"
 * getLanguage("src/index.avsc"); // "avro-json"
 * getLanguage("src/index.avdl"); // "avro"
 * getLanguage("src/unknown"); // "other"
 * getLanguage("src/unknown.unk"); // "other"
 * ```
 *
 * @param path - The path to the file.
 * @returns The language associated with the path, or `"other"` when unknown.
 */
export function getLanguage(path: string): Language {
  return (
    EXTENSION_LANGUAGE_MAP[
      findFileExtensionSafe(path) as keyof typeof EXTENSION_LANGUAGE_MAP
    ] || "other"
  );
}

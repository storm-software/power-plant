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

import type { TypeAnnotation } from "@deepkit/core";

export * from "@deepkit/type-compiler";

/**
 * Schema metadata options mirroring JSON Schema metadata keywords.
 *
 * @see https://deepkit.io/en/documentation/runtime-types/types#custom-type-annotations
 */
export interface SchemaMetaOptions {
  id?: string;
  title?: string;
  description?: string;
  docs?: string;
  alias?: string[];
  tags?: string[];
  deprecated?: boolean;
  hidden?: boolean;
  ignore?: boolean;
  internal?: boolean;
  runtime?: boolean;
  examples?: (
    unknown | { name?: string; description?: string; value: unknown }
  )[];
  readOnly?: boolean;
  writeOnly?: boolean;
  contentEncoding?: string;
  contentMediaType?: string;
  contentSchema?: string;
}

/**
 * Combined schema metadata annotation.
 *
 * @example
 * ```ts
 * type Username = string & SchemaMeta<{ title: "Username"; deprecated: true }>;
 * ```
 */
export type SchemaMeta<T extends SchemaMetaOptions> = TypeAnnotation<
  "schemaMeta",
  T
>;

/**
 * Unique schema / property identifier.
 *
 * @example
 * ```ts
 * type UserId = string & Id<"user">;
 * ```
 */
export type Id<T extends string> = TypeAnnotation<"id", T>;

/**
 * Human-readable title.
 *
 * @example
 * ```ts
 * type Name = string & Title<"Display name">;
 * ```
 */
export type Title<T extends string> = TypeAnnotation<"title", T>;

/**
 * Human-readable description.
 *
 * @example
 * ```ts
 * type Bio = string & Description<"Short biography">;
 * ```
 */
export type Description<T extends string> = TypeAnnotation<"description", T>;

/**
 * External documentation URL.
 *
 * @example
 * ```ts
 * type Token = string & Docs<"https://example.com/docs/token">;
 * ```
 */
export type Docs<T extends string> = TypeAnnotation<"docs", T>;

/**
 * Alternate names for the field.
 *
 * @example
 * ```ts
 * type Email = string & Alias<["mail", "e-mail"]>;
 * ```
 */
export type Alias<T extends readonly string[]> = TypeAnnotation<"alias", T>;

/**
 * Categorization tags / groups.
 *
 * @example
 * ```ts
 * type Password = string & Tags<["credentials", "secret"]>;
 * ```
 */
export type Tags<T extends readonly string[]> = TypeAnnotation<"tags", T>;

/**
 * Marks the field as deprecated.
 *
 * @example
 * ```ts
 * type LegacyId = string & Deprecated;
 * ```
 */
export type Deprecated = TypeAnnotation<"deprecated">;

/**
 * Hides the field from documentation / UI surfaces.
 *
 * @example
 * ```ts
 * type Secret = string & Hidden;
 * ```
 */
export type Hidden = TypeAnnotation<"hidden">;

/**
 * Ignores the field during schema processing.
 *
 * @example
 * ```ts
 * type Scratch = string & Ignore;
 * ```
 */
export type Ignore = TypeAnnotation<"ignore">;

/**
 * Marks the field as internal.
 *
 * @example
 * ```ts
 * type InternalId = string & Internal;
 * ```
 */
export type Internal = TypeAnnotation<"internal">;

/**
 * Marks the field as populated only at runtime.
 *
 * @example
 * ```ts
 * type Computed = string & Runtime;
 * ```
 */
export type Runtime = TypeAnnotation<"runtime">;

/**
 * Example value shape for documentation.
 */
export type SchemaExample =
  unknown | { name?: string; description?: string; value: unknown };

/**
 * Example values for documentation.
 *
 * @example
 * ```ts
 * type Status = string & Examples<[{ value: "active" }, { name: "Off", value: "inactive" }]>;
 * ```
 */
export type Examples<T extends readonly SchemaExample[]> = TypeAnnotation<
  "examples",
  T
>;

/**
 * Marks the field as read-only.
 *
 * @example
 * ```ts
 * type CreatedAt = string & ReadOnly;
 * ```
 */
export type ReadOnly = TypeAnnotation<"readOnly">;

/**
 * Marks the field as write-only.
 *
 * @example
 * ```ts
 * type Password = string & WriteOnly;
 * ```
 */
export type WriteOnly = TypeAnnotation<"writeOnly">;

/**
 * Content encoding (e.g. `base64`).
 *
 * @example
 * ```ts
 * type Blob = string & ContentEncoding<"base64">;
 * ```
 */
export type ContentEncoding<T extends string> = TypeAnnotation<
  "contentEncoding",
  T
>;

/**
 * Content media type (e.g. `application/json`).
 *
 * @example
 * ```ts
 * type Payload = string & ContentMediaType<"application/json">;
 * ```
 */
export type ContentMediaType<T extends string> = TypeAnnotation<
  "contentMediaType",
  T
>;

/**
 * Content schema reference.
 *
 * @example
 * ```ts
 * type Body = string & ContentSchema<"https://example.com/schemas/body.json">;
 * ```
 */
export type ContentSchema<T extends string> = TypeAnnotation<
  "contentSchema",
  T
>;


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

import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { JSON_SCHEMA_METADATA_KEYS } from "./constants";
import { readSchemaTypes } from "./metadata";
import {
  isJsonSchema,
  isJsonSchemaArray,
  isJsonSchemaObject
} from "./type-checks";
import type { JsonSchema, JsonSchemaLike, JsonSchemaType } from "./types";

const METADATA_KEYS = new Set<string>([
  ...JSON_SCHEMA_METADATA_KEYS,
  "default",
  "examples"
]);

function isMetadataKey(key: string): boolean {
  return METADATA_KEYS.has(key);
}

/**
 * Returns true when `schema` is unconstrained (`JsonSchemaAny`):
 * empty, metadata-only, or otherwise lacking structural keywords.
 */
function isUnconstrainedSchema(schema: JsonSchema): boolean {
  if (!isSetObject(schema)) {
    return true;
  }

  const structuralKeys = Object.keys(schema).filter(key => !isMetadataKey(key));

  return structuralKeys.length === 0;
}

function resolveSchemaTypes(schema: JsonSchema): JsonSchemaType[] | "any" {
  if (isUnconstrainedSchema(schema)) {
    return "any";
  }

  const schemaType = (schema as JsonSchemaLike).type;

  if (isSetString(schemaType)) {
    return [schemaType];
  }

  if (Array.isArray(schemaType)) {
    return schemaType.filter(isSetString);
  }

  const primitiveTypes = readSchemaTypes(schema);
  if (primitiveTypes.length > 0) {
    return primitiveTypes;
  }

  if (isJsonSchemaObject(schema)) {
    return ["object"];
  }

  if (isJsonSchemaArray(schema)) {
    return ["array"];
  }

  return "any";
}

function formatPath(path: string): string {
  return path.length > 0 ? path : "schema";
}

function valuesEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

/**
 * Finds structural contradictions between two JSON Schema fragments.
 *
 * @remarks
 * Metadata-only keywords are ignored. Either schema may be unconstrained
 * (`JsonSchemaAny`, empty object, or missing structural keywords) without
 * producing contradictions.
 *
 * @param base - The base JSON Schema fragment.
 * @param override - The JSON Schema fragment to compare against the base.
 * @param path - Optional dot-separated path used in issue messages.
 * @returns A list of human-readable contradiction descriptions.
 */
export function findSchemaContradictions(
  base: JsonSchema,
  override: JsonSchema,
  path = ""
): string[] {
  const issues: string[] = [];

  if (isUnconstrainedSchema(base) || isUnconstrainedSchema(override)) {
    return issues;
  }

  const baseTypes = resolveSchemaTypes(base);
  const overrideTypes = resolveSchemaTypes(override);

  if (baseTypes !== "any" && overrideTypes !== "any") {
    const overlap = baseTypes.filter(type => overrideTypes.includes(type));
    if (overlap.length === 0) {
      issues.push(
        `${formatPath(path)} has conflicting types: ${baseTypes.join("|")} vs ${overrideTypes.join("|")}`
      );
      return issues;
    }
  }

  const baseConst = (base as { const?: unknown }).const;
  const overrideConst = (override as { const?: unknown }).const;
  if (
    baseConst !== undefined &&
    overrideConst !== undefined &&
    !valuesEqual(baseConst, overrideConst)
  ) {
    issues.push(`${formatPath(path)} has conflicting const values`);
  }

  const baseEnum = (base as { enum?: unknown[] }).enum;
  const overrideEnum = (override as { enum?: unknown[] }).enum;
  if (baseEnum?.length && overrideEnum?.length) {
    const overlap = overrideEnum.some(value =>
      baseEnum.some(baseValue => valuesEqual(baseValue, value))
    );
    if (!overlap) {
      issues.push(`${formatPath(path)} has enum values that do not overlap`);
    }
  }

  if (isJsonSchemaObject(base) && isJsonSchemaObject(override)) {
    const baseProperties = base.properties ?? {};
    const overrideProperties = override.properties ?? {};

    for (const [key, overrideProperty] of Object.entries(overrideProperties)) {
      const baseProperty = baseProperties[key];
      const propertyPath = path ? `${path}.${key}` : key;

      if (
        baseProperty &&
        isJsonSchema(baseProperty) &&
        isJsonSchema(overrideProperty)
      ) {
        issues.push(
          ...findSchemaContradictions(
            baseProperty,
            overrideProperty,
            propertyPath
          )
        );
      }
    }
  }

  if (isJsonSchemaArray(base) && isJsonSchemaArray(override)) {
    const baseItems = base.items;
    const overrideItems = override.items;

    if (
      baseItems &&
      overrideItems &&
      isJsonSchema(baseItems) &&
      isJsonSchema(overrideItems)
    ) {
      issues.push(
        ...findSchemaContradictions(
          baseItems,
          overrideItems,
          path ? `${path}[]` : "items"
        )
      );
    }

    const basePrefix = base.prefixItems;
    const overridePrefix = override.prefixItems;

    if (Array.isArray(basePrefix) && Array.isArray(overridePrefix)) {
      const length = Math.min(basePrefix.length, overridePrefix.length);
      for (let index = 0; index < length; index++) {
        const baseItem = basePrefix[index];
        const overrideItem = overridePrefix[index];
        if (isJsonSchema(baseItem) && isJsonSchema(overrideItem)) {
          issues.push(
            ...findSchemaContradictions(
              baseItem,
              overrideItem,
              path ? `${path}[${index}]` : `[${index}]`
            )
          );
        }
      }
    }
  }

  return issues;
}

/**
 * Asserts that two JSON Schema fragments do not structurally contradict each other.
 *
 * @param base - The base JSON Schema fragment.
 * @param override - The JSON Schema fragment to compare against the base.
 * @param label - A label used in the thrown error message.
 * @throws Will throw an Error when one or more structural contradictions are found.
 */
export function assertSchemasDoNotContradict(
  base: JsonSchema,
  override: JsonSchema,
  label = "schema"
): void {
  const issues = findSchemaContradictions(base, override);
  if (issues.length > 0) {
    throw new Error(
      `The ${label} schema contradicts the generator schema:\n${issues.map(issue => `- ${issue}`).join("\n")}`
    );
  }
}

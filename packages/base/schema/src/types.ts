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

import type { StandardJSONSchemaV1 } from "@standard-schema/spec";
import type { InferLoadOptions, LoadReference } from "@stryke/resolve/types";
import type { InputObject, Schema as UntypedBaseSchema } from "untyped";
import type { BaseIssue, BaseSchema } from "valibot";
import type * as z3 from "zod/v3";
import type {
  JSON_SCHEMA_PRIMITIVE_TYPES,
  JSON_SCHEMA_TYPES
} from "./constants";

// #region JSON Schema Types

/**
 * Primitive JSON Schema `type` keyword values.
 *
 * @see https://json-schema.org/draft/2020-12/json-schema-core#section-7.6.1
 */
export type JsonSchemaPrimitiveType =
  (typeof JSON_SCHEMA_PRIMITIVE_TYPES)[number];

/**
 * JSON Schema type names for the `type` keyword.
 *
 * @see https://json-schema.org/draft/2020-12/json-schema-core#section-7.6.1
 */
export type JsonSchemaType = (typeof JSON_SCHEMA_TYPES)[number];

/**
 * Semantic format names for JSON Schema integer types.
 */
export type JsonSchemaIntegerFormat =
  | "int8"
  | "uint8"
  | "int16"
  | "uint16"
  | "int32"
  | "uint32"
  | "int64"
  | "uint64";

/**
 * Semantic format names for JSON Schema decimal types.
 */
export type JsonSchemaDecimalFormat = "float" | "double";

/**
 * Semantic format names for JSON Schema numeric types, including both integer and decimal formats.
 */
export type JsonSchemaNumberFormat =
  JsonSchemaDecimalFormat | JsonSchemaIntegerFormat;

/**
 * Semantic format names for JSON Schema string types.
 */
export type JsonSchemaStringFormat =
  | "binary"
  | "date"
  | "time"
  | "date-time"
  | "iso-time"
  | "iso-date-time"
  | "duration"
  | "uri"
  | "uri-reference"
  | "uri-template"
  | "url"
  | "email"
  | "hostname"
  | "ipv4"
  | "ipv6"
  | "regex"
  | "uuid"
  | "json-pointer"
  | "json-pointer-uri-fragment"
  | "relative-json-pointer"
  | "byte"
  | "password";

/**
 * Metadata and annotation keywords shared across JSON Schema shapes.
 *
 * @see https://json-schema.org/draft/2020-12/json-schema-core#section-8
 */
export interface JsonSchemaMetadataKeywords {
  /**
   * A unique identifier keyword that is used to identify a schema and can be used for referencing the schema within other schemas. It is a URI that serves as a unique identifier for the schema.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.1
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.1
   */
  $id?: string;

  /**
   * A keyword used to specify the version of the JSON Schema specification that the schema adheres to. It is a URI that indicates which version of the JSON Schema specification the schema is written against.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-8.1.1
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.2
   */
  $schema?: string;

  /**
   * A keyword that is used in meta-schemas to identify the vocabularies available for use in schemas described by that meta-schema.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-8.1.2
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.2
   */
  $vocabulary?: Record<string, boolean>;

  /**
   * A comment or annotation for the schema, which can be used to provide additional context or information about the schema. It allows schema authors to include human-readable explanations or notes within the schema without affecting its validation behavior.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-8.3
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.3
   */
  $comment?: string;

  /**
   * A plain-name fragment identifier for the schema resource.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.2
   */
  $anchor?: string;

  /**
   * The `$defs` keyword is used to define reusable sub-schemas within a JSON Schema. It allows you to define sub-schemas that can be referenced elsewhere in the schema using the `$ref` keyword. The `$defs` keyword is an object where each key is a unique identifier for the sub-schema, and the value is the sub-schema itself.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.4
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.4
   * @see https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-8.2.4
   * @see https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#appendix-A
   */
  $defs?: Record<string, JsonSchema>;

  /**
   * The `$dynamicRef` keyword is used to reference a dynamic anchor defined in a JSON Schema. It allows you to reference a sub-schema that is determined at runtime based on the context of the validation. The value of `$dynamicRef` is a URI that points to the dynamic anchor defined using the `$dynamicAnchor` keyword.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.3.2
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.6
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.7
   */
  $dynamicRef?: string;

  /**
   * The `$dynamicAnchor` keyword is used to define a dynamic anchor within a JSON Schema. A dynamic anchor is a placeholder that can be referenced using the `$dynamicRef` keyword. It allows for more flexible referencing of sub-schemas, as the actual schema that the dynamic anchor points to can be determined at runtime based on the context of the validation.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.6
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.7
   */
  $dynamicAnchor?: string;

  /**
   * A name for the schema, which can be used by documentation tools or other libraries that support this feature to provide a human-readable name or description for the schema. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the schema when used in conjunction with compatible tools.
   */
  name?: string;

  /**
   * A version for the schema, which can be used by documentation tools or other libraries that support this feature to provide additional context or information about the schema's version. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the schema when used in conjunction with compatible tools.
   */
  version?: string | number;

  /**
   * A title for the schema, which can be used by documentation tools or other libraries that support this feature to provide a human-readable name or description for the schema. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the schema when used in conjunction with compatible tools.
   */
  title?: string;

  /**
   * A description for the schema, which can be used by documentation tools or other libraries that support this feature to provide a human-readable explanation or summary of the schema's purpose and usage. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the schema when used in conjunction with compatible tools.
   */
  description?: string;

  /**
   * A URL to external documentation for the schema, which can be used by documentation tools or other libraries that support this feature to provide additional information or resources related to the schema. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the schema when used in conjunction with compatible tools.
   */
  docs?: string;

  /**
   * An array of example values that conform to the schema. This property can be used to provide sample data for documentation purposes or to assist developers in understanding the expected structure and content of the data that the schema represents. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  examples?: (
    unknown | { name?: string; description?: string; value: unknown }
  )[];

  /**
   * An array of strings or an alias reference to indicate that the field is an alias for one or more other fields.
   */
  alias?: string[];

  /**
   * An array of strings indicating groups that the schema belongs to. This property can be used for organizational or categorization purposes in documentation tools or other libraries that support this feature. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the schema when used in conjunction with compatible tools.
   */
  tags?: string[];

  /**
   * An indicator specifying if the field is deprecated or not. This property can be used by documentation tools or other libraries that support this feature to provide additional information or warnings about the usage of the schema. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the schema when used in conjunction with compatible tools.
   */
  deprecated?:
    | boolean
    | string
    | { message?: string; since?: string; alternative?: string };

  /**
   * An indicator specifying if the field should be marked as hidden or not. This property can be used by documentation tools or other libraries that support this feature to provide additional information or warnings about the usage of the schema. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the schema when used in conjunction with compatible tools.
   */
  hidden?: boolean;

  /**
   * An indicator specifying if the field should be ignored or not. This property can be used by documentation tools or other libraries that support this feature to provide additional information or warnings about the usage of the schema. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the schema when used in conjunction with compatible tools.
   */
  ignore?: boolean;

  /**
   * An indicator specifying if the field is internal or not.
   *
   * @internal
   */
  internal?: boolean;

  /**
   * An indicator specifying if the field should only be populated at runtime or not.
   */
  runtime?: boolean;

  /**
   * An indicator specifying if the field is read-only or not.
   */
  readOnly?: boolean;

  /**
   * An indicator specifying if the field is write-only or not. This property can be used by documentation tools or other libraries that support this feature to provide additional information or warnings about the usage of the schema. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the schema when used in conjunction with compatible tools.
   */
  writeOnly?: boolean;
}

/**
 * A keyword group corresponding to logical operators for combining or modifying the boolean assertion results of the subschemas. They have no direct impact on annotation collection, although they enable the same annotation keyword to be applied to an instance location with different values.
 *
 * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.1
 * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.5
 */
export interface JsonSchemaLogicKeywords {
  /**
   * A set of schemas where the data must satisfy all members.
   *
   * @remarks
   * An instance validates successfully against this keyword if it validates successfully against all schemas defined by this keyword's value.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.1.1
   */
  allOf?: JsonSchema[];

  /**
   * A set of schemas where the data must satisfy at least one member.
   *
   * @remarks
   * An instance validates successfully against this keyword if it validates successfully against at least one schema defined by this keyword's value. Note that when annotations are being collected, all subschemas **MUST** be examined so that annotations are collected from each subschema that validates successfully.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.1.2
   */
  anyOf?: JsonSchema[];

  /**
   * A set of schemas where the data must satisfy exactly one member.
   *
   * @remarks
   * An instance validates successfully against this keyword if it validates successfully against exactly one schema defined by this keyword's value.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.1.3
   */
  oneOf?: JsonSchema[];

  /**
   * A schema that must not match the data.
   *
   * @remarks
   * An instance is valid against this keyword if it fails to validate successfully against the schema defined by this keyword
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.1.4
   */
  not?: JsonSchema;
}

/**
 * A set of JSON Schema keywords that define conditional combination rules for schemas. These keywords work together to implement conditional application of a subschema based on the outcome of another subschema.
 *
 * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.2
 * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.5
 */
export interface JsonSchemaConditionalKeywords {
  /**
   * A schema that the data must not satisfy.
   *
   * @remarks
   * Instances that successfully validate against this keyword's subschema **MUST** also be valid against the subschema value of the {@link then} keyword, if present. Instances that fail to validate against this keyword's subschema **MUST** also be valid against the subschema value of the {@link else} keyword, if present.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.2.1
   */
  if?: JsonSchema;

  /**
   * A schema applied when {@link if} matches.
   *
   * @remarks
   * When {@link if} is present, and the instance successfully validates against its subschema, then validation succeeds against this keyword if the instance also successfully validates against this keyword's subschema.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.2.2
   */
  then?: JsonSchema;

  /**
   * A schema applied when {@link if} does not match.
   *
   * @remarks
   * When {@link if} is present, and the instance fails to validate against its subschema, then validation succeeds against this keyword if the instance successfully validates against this keyword's subschema.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.2.3
   */
  else?: JsonSchema;
}

/**
 * Shared JSON Schema keyword groups applied to most schema variants.
 */
export type JsonSchemaKeywords = JsonSchemaMetadataKeywords &
  JsonSchemaLogicKeywords &
  JsonSchemaConditionalKeywords;

/**
 * A schema that can point to another schema via `$ref`.
 */
export interface JsonSchemaAny extends JsonSchemaKeywords {
  /**
   * A URI reference to another schema.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.3.1
   */
  $ref?: string;
}

/**
 * JSON Schema keywords for array validation.
 *
 * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.3.1
 */
export interface JsonSchemaArray extends JsonSchemaKeywords {
  /**
   * Declares that the instance must be an array.
   */
  type: "array";

  /**
   * Schemas for positional items at each tuple index.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.3.1.1
   */
  prefixItems?: JsonSchema[];

  /**
   * Schema for array items beyond `prefixItems`, or all items when `prefixItems` is omitted.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.3.1.2
   */
  items?: JsonSchema;

  /**
   * A subschema that at least one array item must satisfy.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.3.1.3
   */
  contains?: JsonSchema;

  /**
   * Minimum number of items allowed.
   */
  minItems?: number;

  /**
   * Maximum number of items allowed.
   */
  maxItems?: number;

  /**
   * Whether all items must be unique.
   */
  uniqueItems?: boolean;

  /**
   * Minimum count of items that must satisfy `contains`.
   */
  minContains?: number;

  /**
   * Maximum count of items that may satisfy `contains`.
   */
  maxContains?: number;

  /**
   * Controls validation of array items not covered by prior applicators.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-11.2
   */
  unevaluatedItems?: boolean | JsonSchema;
}

/**
 * Integer schema specialized for 64-bit integer semantics.
 */
export interface JsonSchemaBigint extends JsonSchemaKeywords {
  /**
   * Declares that the instance must be an integer.
   */
  type: "integer";

  /**
   * Identifies an `int64` integer representation.
   */
  format: "int64";

  /**
   * Inclusive lower bound for valid values.
   */
  minimum?: bigint;

  /**
   * Exclusive lower bound for valid values.
   */
  exclusiveMinimum?: bigint;

  /**
   * Inclusive upper bound for valid values.
   */
  maximum?: bigint;

  /**
   * Exclusive upper bound for valid values.
   */
  exclusiveMaximum?: bigint;

  /**
   * Constraint requiring values to be divisible by this number.
   */
  multipleOf?: bigint;

  /**
   * A keyword that is used to specify a default value for a property in a JSON Schema. It provides a default value that can be used when an instance does not provide a value for that property.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.2
   */
  default?: bigint;

  /**
   * Fixed set of allowed integer values.
   */
  enum?: bigint[];
}

/**
 * Boolean schema keywords.
 */
export interface JsonSchemaBoolean extends JsonSchemaKeywords {
  /**
   * Declares that the instance must be a boolean.
   */
  type: "boolean";

  /**
   * A keyword that is used to specify a default value for a property in a JSON Schema. It provides a default value that can be used when an instance does not provide a value for that property.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.2
   */
  default?: boolean;
}

/**
 * Date and time schema variants.
 *
 * @remarks
 * This type supports either direct date/time format constraints or recursive unions through `anyOf`.
 *
 * @see https://json-schema.org/draft/2020-12/json-schema-validation#section-7
 */
export type JsonSchemaDate = JsonSchemaKeywords &
  (
    | {
        /**
         * Declares the storage type used for temporal values.
         */
        type: "integer" | "string";

        /**
         * A date/time format name used for semantic validation.
         */
        format:
          | "date"
          | "time"
          | "date-time"
          | "iso-time"
          | "iso-date-time"
          | "unix-time";

        /**
         * Inclusive lower bound for numeric time representations.
         */
        minimum?: number;

        /**
         * Inclusive upper bound for numeric time representations.
         */
        maximum?: number;

        /**
         * A keyword that is used to specify a default value for a property in a JSON Schema. It provides a default value that can be used when an instance does not provide a value for that property.
         *
         * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.2
         */
        default?: string | number;
      }
    | {
        /**
         * Alternative date/time schemas where at least one must match.
         */
        anyOf: JsonSchemaDate[];
      }
  );

/**
 * Enum-constrained schema.
 *
 * @template T - The literal type allowed by the enum values.
 */
export interface JsonSchemaEnum<
  T extends string | number | bigint | boolean | null =
    string | number | bigint | boolean | null
> extends JsonSchemaKeywords {
  /**
   * Primitive type of the enum values.
   */
  type: JsonSchemaPrimitiveType;

  /**
   * The complete set of allowed literal values.
   */
  enum: T[];

  /**
   * A keyword that is used to specify a default value for a property in a JSON Schema. It provides a default value that can be used when an instance does not provide a value for that property.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.2
   */
  default?: T;
}

export interface JsonSchemaAllOf extends JsonSchemaKeywords {
  /**
   * Subschemas that must all validate successfully.
   */
  allOf: JsonSchema[];

  /**
   * Controls validation for object properties not evaluated by prior keywords.
   */
  unevaluatedProperties?: boolean | JsonSchema;
}

/**
 * A schema that matches exactly one literal value.
 */
export interface JsonSchemaLiteral extends JsonSchemaKeywords {
  /**
   * Constant value that an instance must equal.
   */
  const: unknown;

  /**
   * Optional explicit type constraint for the constant.
   */
  type?: JsonSchemaType | JsonSchemaType[];
}

/**
 * Array representation for map-like entries as `[key, value]` tuples.
 */
export interface JsonSchemaMap extends JsonSchemaKeywords {
  /**
   * Declares that the map is represented as an array.
   */
  type: "array";

  /**
   * Maximum number of entries allowed.
   */
  maxItems: 125;

  /**
   * Tuple schema describing each map entry as `[key, value]`.
   */
  items: {
    /**
     * Declares that each entry is an array tuple.
     */
    type: "array";

    /**
     * Two-position tuple schemas for key and value.
     */
    prefixItems: [JsonSchema, JsonSchema];

    /**
     * Disallows additional tuple positions.
     */
    items?: false;

    /**
     * Minimum tuple length.
     */
    minItems: 2;

    /**
     * Maximum tuple length.
     */
    maxItems: 2;
  };
}

/**
 * Enum schema that allows both string and numeric enum members.
 */
export interface JsonSchemaNativeEnum extends JsonSchemaKeywords {
  /**
   * Type domain allowed by the native enum.
   */
  type: "string" | "number" | ["string", "number"];

  /**
   * Allowed enum member values.
   */
  enum: (string | number)[];
}

/**
 * A schema that intentionally matches no values.
 */
export interface JsonSchemaNever extends JsonSchemaKeywords {
  /**
   * Negated schema used to make validation impossible.
   */
  not: JsonSchemaAny;
}

/**
 * Schema representing the JSON `null` literal type.
 */
export interface JsonSchemaNull extends JsonSchemaKeywords {
  /**
   * The JSON Schema null type. This property is used to indicate that the schema represents a null value, which is a special value in JSON that represents the absence of a value or a null reference. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  type: "null";

  /**
   * A constant value constrained to null when the schema is nullable.
   */
  const?: null;

  /**
   * Allowed values, including null when the schema is nullable.
   */
  enum?: null[];

  /**
   * A keyword that is used to specify a default value for a property in a JSON Schema. It provides a default value that can be used when an instance does not provide a value for that property.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.2
   */
  default?: null;
}

/**
 * Nullable schema variants that include an explicit `null` branch.
 */
export type JsonSchemaNullable = JsonSchemaKeywords &
  (
    | {
        /**
         * Two-branch union that includes a non-null schema and explicit `null` schema.
         */
        anyOf: [JsonSchema, JsonSchemaNull];
      }
    | {
        /**
         * Primitive `type` tuple that explicitly includes `null`.
         */
        type:
          | [Exclude<JsonSchemaType, "null">, "null"]
          | ["null", Exclude<JsonSchemaType, "null">];
      }
  );

/**
 * Numeric schema keywords for numbers and integers.
 *
 * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6.2
 */
export interface JsonSchemaNumber extends JsonSchemaKeywords {
  /**
   * Declares whether values are numbers or integers.
   */
  type: "number" | "integer";

  /**
   * Optional semantic format for numeric values.
   */
  format?: JsonSchemaNumberFormat | string;

  /**
   * Inclusive lower bound for numeric values.
   */
  minimum?: number;

  /**
   * Exclusive lower bound for numeric values.
   */
  exclusiveMinimum?: number;

  /**
   * Inclusive upper bound for numeric values.
   */
  maximum?: number;

  /**
   * Exclusive upper bound for numeric values.
   */
  exclusiveMaximum?: number;

  /**
   * Constraint requiring values to be divisible by this value.
   */
  multipleOf?: number;

  /**
   * A keyword that is used to specify a default value for a property in a JSON Schema. It provides a default value that can be used when an instance does not provide a value for that property.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.2
   */
  default?: number;

  /**
   * Fixed set of allowed numeric values.
   */
  enum?: number[];
}

/**
 * Integer-only numeric schema.
 */
export interface JsonSchemaInteger extends JsonSchemaNumber {
  /**
   * Declares that values must be integers.
   */
  type: "integer";

  /**
   * Optional integer-specific format.
   */
  format?: JsonSchemaIntegerFormat | string;
}

/**
 * Floating-point numeric schema.
 */
export interface JsonSchemaDecimal extends JsonSchemaNumber {
  /**
   * Declares that values are non-integer numbers.
   */
  type: "number";

  /**
   * Optional floating-point format.
   */
  format?: JsonSchemaDecimalFormat | string;
}

/**
 * Object schema keywords.
 *
 * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.3.2
 */
export interface JsonSchemaObject extends JsonSchemaKeywords {
  /**
   * The JSON Schema object type. This property is used to indicate that the schema represents an object, which is a collection of key-value pairs where the keys are strings and the values can be of any type defined by the schema. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  type: "object";

  /**
   * The declared object properties and their schemas. This property can be used to define the expected structure of an object, where each key represents a property name and the corresponding value is a schema that defines the expected type and constraints for that property. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.3.2.1
   */
  properties?: Record<string, JsonSchema>;

  /**
   * The schemas for properties whose names match the given patterns.
   *
   * @remarks
   * Each property name of this object **SHOULD** be a valid regular expression, according to the [ECMA-262 regular expression dialect](https://www.ecma-international.org/ecma-262/). Each property value of this object **MUST** be a valid JSON Schema.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.3.2.2
   */
  patternProperties?: Record<string, JsonSchema>;

  /**
   * The schema for properties not matched by {@link properties} or {@link patternProperties}. This property can be used to allow additional properties in the object that are not explicitly defined in the {@link properties} or {@link patternProperties} keywords. The value of this property can be a boolean, where `true` allows any additional properties and `false` disallows any additional properties, or it can be a schema that defines the expected structure of the additional properties. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.3.2.3
   */
  additionalProperties?: boolean | JsonSchema;

  /**
   * A list of property names that are required for the object. This property can be used by validation libraries or other tools that support this feature to enforce the presence of certain properties in the data that the schema represents. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  required?: string[];

  /**
   * A keyword that is used to specify a default value for a property in a JSON Schema. It provides a default value that can be used when an instance does not provide a value for that property.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.2
   */
  default?: Record<string, unknown>;

  /**
   * The schema for properties that have not yet been evaluated by other object keywords. This property can be used to apply a schema to properties that are not explicitly defined in the {@link properties} or {@link patternProperties} keywords, and that have not been evaluated by any other object keywords such as {@link additionalProperties} or {@link dependencies}. The value of this property can be a boolean, where `true` allows any unevaluated properties and `false` disallows any unevaluated properties, or it can be a schema that defines the expected structure of the unevaluated properties. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  unevaluatedProperties?: boolean | JsonSchema;

  /**
   * A map of property-specific dependency requirements.
   */
  dependencies?: Record<string, string[] | JsonSchema>;

  /**
   * Properties that become required when the key property is present.
   */
  dependentRequired?: Record<string, string[]>;

  /**
   * Subschemas that apply when the key property is present.
   *
   * @remarks
   * If the object key is a property in the instance, the entire instance must validate against the subschema. Its use is dependent on the presence of the property.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.2.4
   */
  dependentSchemas?: Record<string, JsonSchema>;

  /**
   * The minimum number of own properties allowed.
   */
  minProperties?: number;

  /**
   * The maximum number of own properties allowed.
   */
  maxProperties?: number;

  /**
   * An optional array of property names that are considered primary keys for the object. This property can be used by validation libraries or other tools that support this feature to provide additional validation rules or constraints for the data that the schema represents. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  primaryKey?: string[];

  /**
   * A name for the database schema associated with the data represented by this schema. This property can be used by documentation tools or other libraries that support this feature to provide additional context or information about the data model that the schema represents. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  databaseSchema?: string;
}

export interface JsonSchemaString extends JsonSchemaKeywords {
  /**
   * Declares that the instance must be a string.
   */
  type: "string";

  /**
   * The minimum number of characters allowed in the string.
   */
  minLength?: number;

  /**
   * The maximum number of characters allowed in the string.
   */
  maxLength?: number;

  /**
   * A regular expression that matching strings must satisfy.
   */
  pattern?: string;

  /**
   * A format for the schema, which can be used by validation libraries or other tools that support this feature to provide additional validation or formatting rules for the data that the schema represents. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   *
   * @see https://ajv.js.org/packages/ajv-formats.html
   *
   * @remarks
   * The `format` property is a string that specifies the format of the data that the schema represents. It can be used to indicate that a string should be validated as an email address, a date-time, a URI, or any other format supported by compatible validation libraries. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  format?: JsonSchemaStringFormat | string;

  /**
   * A keyword that is used to specify a default value for a property in a JSON Schema. It provides a default value that can be used when an instance does not provide a value for that property.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.2
   */
  default?: string;

  /**
   * Fixed set of allowed string values.
   */
  enum?: string[];

  /**
   * A keyword used to specify the media type of the content that the schema represents. It can be used by validation libraries or other tools that support this feature to provide additional validation or processing rules for the data based on its media type. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.8
   */
  contentMediaType?: string;

  /**
   * A keyword used to specify the content encoding of the data that the schema represents. It can be used by validation libraries or other tools that support this feature to provide additional validation or processing rules for the data based on its content encoding. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.8
   */
  contentEncoding?: string;

  /**
   * A keyword used to specify a schema for the content that the schema represents. It can be used by validation libraries or other tools that support this feature to provide additional validation or processing rules for the data based on its schema. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-8.2.9
   */
  contentSchema?: string;
}

/**
 * Set-like array schema that enforces item uniqueness.
 */
export interface JsonSchemaSet extends JsonSchemaKeywords {
  /**
   * Declares that set values are serialized as arrays.
   */
  type: "array";

  /**
   * Enforces set semantics by requiring distinct elements.
   */
  uniqueItems: true;

  /**
   * Schemas for positional items at each tuple index.
   */
  prefixItems?: JsonSchema[];

  /**
   * Schema for remaining items.
   */
  items?: JsonSchema;

  /**
   * Subschema that at least one item must satisfy.
   */
  contains?: JsonSchema;

  /**
   * Minimum number of items allowed.
   */
  minItems?: number;

  /**
   * Maximum number of items allowed.
   */
  maxItems?: number;

  /**
   * Minimum number of items that must satisfy {@link JsonSchemaSet.contains | contains}.
   */
  minContains?: number;

  /**
   * Maximum number of items that may satisfy {@link JsonSchemaSet.contains | contains}.
   */
  maxContains?: number;

  /**
   * Controls validation for items not otherwise evaluated.
   */
  unevaluatedItems?: boolean | JsonSchema;
}

/**
 * Schema used to validate record keys.
 */
export type JsonSchemaRecordPropertyNames = JsonSchema;

/**
 * Record/object schema with key constraints.
 */
export interface JsonSchemaRecord extends JsonSchemaKeywords {
  /**
   * Declares that the instance must be an object.
   */
  type: "object";

  /**
   * The schemas for properties whose names match the given patterns.
   *
   * @remarks
   * Each property name of this object **SHOULD** be a valid regular expression, according to the [ECMA-262 regular expression dialect](https://www.ecma-international.org/ecma-262/). Each property value of this object **MUST** be a valid JSON Schema.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.3.2.2
   */
  patternProperties?: Record<string, JsonSchema>;

  /**
   * The schema for properties not matched by {@link properties} or {@link patternProperties}. This property can be used to allow additional properties in the object that are not explicitly defined in the `properties` or `patternProperties` keywords. The value of this property can be a boolean, where `true` allows any additional properties and `false` disallows any additional properties, or it can be a schema that defines the expected structure of the additional properties. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.3.2.3
   */
  additionalProperties?: boolean | JsonSchema;

  /**
   * The schema that each property name must satisfy.
   */
  propertyNames?: JsonSchemaRecordPropertyNames;

  /**
   * A keyword that is used to specify a default value for a property in a JSON Schema. It provides a default value that can be used when an instance does not provide a value for that property.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.2
   */
  default?: Record<string, unknown>;
}

/**
 * Tuple schema modeled with positional {@link JsonSchemaTuple.prefixItems | prefixItems} plus optional trailing {@link JsonSchemaTuple.items | items}.
 */
export type JsonSchemaTuple = JsonSchemaKeywords & {
  /**
   * Declares that tuple values are represented as arrays.
   */
  type: "array";

  /**
   * Minimum number of elements required.
   */
  minItems?: number;

  /**
   * Maximum number of elements allowed.
   */
  maxItems?: number;

  /**
   * Positional schemas for tuple elements.
   */
  prefixItems: JsonSchema[];

  /**
   * The schema applied to items beyond {@link prefixItems}. In draft 2020-12,
   * tuple positions are modeled with {@link prefixItems}, while {@link items}
   * applies to the remaining elements.
   *
   * @remarks
   * The behavior of {@link items} without {@link prefixItems} is identical to that of the schema form of {@link items} in drafts prior to 2020-12. When {@link prefixItems} is present, the behavior of {@link items} is identical to the former {@link additionalItems} keyword.
   *
   * @see https://json-schema.org/draft/2020-12/json-schema-core#section-10.3.1.2
   */
  items?: JsonSchema;

  /**
   * Subschema that at least one tuple element must satisfy.
   */
  contains?: JsonSchema;

  /**
   * Whether tuple elements must be unique.
   */
  uniqueItems?: boolean;

  /**
   * Minimum number of elements that must satisfy {@link JsonSchemaTuple.contains | contains}.
   */
  minContains?: number;

  /**
   * Maximum number of elements that may satisfy {@link JsonSchemaTuple.contains | contains}.
   */
  maxContains?: number;

  /**
   * Controls validation of unevaluated tuple elements.
   */
  unevaluatedItems?: boolean | JsonSchema;
};

/**
 * Schema used to represent undefined-like semantics through negation.
 */
export interface JsonSchemaUndefined extends JsonSchemaKeywords {
  /**
   * Negated schema marker used to represent undefined-like semantics.
   */
  not: JsonSchemaAny;

  /**
   * A keyword that is used to specify a default value for a property in a JSON Schema. It provides a default value that can be used when an instance does not provide a value for that property.
   *
   * @see https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.2
   */
  default?: undefined;
}

/**
 * Union schema represented as either primitive type unions or `anyOf` compositions.
 */
export type JsonSchemaUnion = JsonSchemaKeywords &
  (JsonSchemaPrimitiveUnion | JsonSchemaAnyOf);

/**
 * Union of primitive type combinations and enum-backed primitive unions.
 */
export type JsonSchemaPrimitiveUnion = JsonSchemaKeywords &
  (
    | {
        /**
         * Primitive `type` or list of primitive types accepted by the union.
         */
        type: JsonSchemaPrimitiveType | JsonSchemaPrimitiveType[];
      }
    | {
        /**
         * Enum values that may be of different primitive types.
         */
        enum: (string | number | bigint | boolean | null)[];
      }
  );

/**
 * Permissive schema alias for unknown values.
 */
export type JsonSchemaUnknown = JsonSchemaKeywords & JsonSchemaAny;

/**
 * `anyOf` composition schema.
 */
export interface JsonSchemaAnyOf extends JsonSchemaKeywords {
  /**
   * Subschemas where at least one must validate.
   */
  anyOf: JsonSchema[];
}

/**
 * A reference schema that resolves through a URI.
 */
export interface JsonSchemaRef extends JsonSchemaKeywords {
  /**
   * URI reference to a schema definition.
   */
  $ref: string;
}

/**
 * JSON Schema (draft 2020-12) type that can be used to validate JSON data. It is a union of all the specific JSON Schema types, as well as the metadata properties that can be included in any JSON Schema.
 *
 * @see https://json-schema.org/draft/2020-12
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01
 */
export type JsonSchema =
  | JsonSchemaString
  | JsonSchemaInteger
  | JsonSchemaDecimal
  | JsonSchemaBigint
  | JsonSchemaBoolean
  | JsonSchemaDate
  | JsonSchemaEnum
  | JsonSchemaLiteral
  | JsonSchemaNativeEnum
  | JsonSchemaNull
  | JsonSchemaArray
  | JsonSchemaObject
  | JsonSchemaRecord
  | JsonSchemaTuple
  | JsonSchemaUnion
  | JsonSchemaUndefined
  | JsonSchemaRef
  | JsonSchemaNever
  | JsonSchemaMap
  | JsonSchemaAny
  | JsonSchemaNullable
  | JsonSchemaAllOf
  | JsonSchemaUnknown
  | JsonSchemaSet;

/**
 * An object containing common JSON Schema metadata properties that can be included in any schema type. This interface is used to define the shared metadata properties that can be present in all JSON Schema types, such as `$id`, `$schema`, `title`, `description`, and others. It serves as a base for all specific JSON Schema types, allowing them to include these common metadata properties without having to redefine them in each type.
 */
export interface JsonSchemaLike extends JsonSchemaKeywords {
  $id?: string;
  $schema?: string;
  $vocabulary?: Record<string, boolean>;
  $comment?: string;
  $anchor?: string;
  $defs?: Record<string, JsonSchema>;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
  $ref?: string;

  name?: string;
  title?: string;
  description?: string;
  docs?: string;
  examples?: unknown[];
  alias?: string[];
  tags?: string[];
  deprecated?:
    | boolean
    | string
    | { message?: string; since?: string; alternative?: string };
  hidden?: boolean;
  ignore?: boolean;
  internal?: boolean;
  runtime?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;

  type?:
    | JsonSchemaType
    | JsonSchemaType[]
    | JsonSchemaPrimitiveType
    | JsonSchemaPrimitiveType[]
    | [Exclude<JsonSchemaType, "null">, "null"]
    | ["null", Exclude<JsonSchemaType, "null">];
  const?: unknown;
  enum?: (string | number | bigint | boolean | null)[];
  format?: string;
  default?: unknown;

  allOf?: JsonSchema[];
  anyOf?: JsonSchema[] | [JsonSchema, JsonSchemaNull];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;

  properties?: Record<string, JsonSchema>;
  patternProperties?: Record<string, JsonSchema>;
  additionalProperties?: boolean | JsonSchema;
  required?: string[];
  propertyNames?: JsonSchemaRecordPropertyNames;
  dependencies?: Record<string, string[] | JsonSchema>;
  dependentRequired?: Record<string, string[]>;
  dependentSchemas?: Record<string, JsonSchema>;
  minProperties?: number;
  maxProperties?: number;
  primaryKey?: string[];
  databaseSchema?: string;
  unevaluatedProperties?: boolean | JsonSchema;

  prefixItems?: JsonSchema[];
  items?: JsonSchema | JsonSchemaMap["items"];
  contains?: JsonSchema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  minContains?: number;
  maxContains?: number;
  unevaluatedItems?: boolean | JsonSchema;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  contentMediaType?: string;
  contentEncoding?: string;
  contentSchema?: string;
  minimum?: number | bigint;
  exclusiveMinimum?: number | bigint;
  maximum?: number | bigint;
  exclusiveMaximum?: number | bigint;
  multipleOf?: number | bigint;
}

type IsAny<T> = 0 extends 1 & T ? true : false;

type IsNever<T> = [T] extends [never] ? true : false;

type IsUnknown<T> =
  IsAny<T> extends true
    ? false
    : unknown extends T
      ? [keyof T] extends [never]
        ? true
        : false
      : false;

type IsUnion<T, U = T> =
  IsNever<T> extends true
    ? false
    : T extends any
      ? [U] extends [T]
        ? false
        : true
      : false;

type IsTuple<T extends readonly unknown[]> = number extends T["length"]
  ? false
  : true;

type JsonSchemaPrefixItems<T extends readonly unknown[]> = {
  [K in keyof T]: JsonSchemaOf<T[K]>;
} extends infer P
  ? P extends readonly JsonSchema[]
    ? [...P]
    : JsonSchema[]
  : JsonSchema[];

type JsonSchemaRequiredObjectKeys<T extends object> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T] &
  string;

type JsonSchemaObjectProperties<T extends object> = {
  [K in keyof T]-?: JsonSchemaOf<T[K]>;
};

type JsonSchemaForTuple<T extends readonly unknown[]> = JsonSchemaTuple & {
  prefixItems: JsonSchemaPrefixItems<T>;
  minItems: T["length"];
  maxItems: T["length"];
};

type JsonSchemaForArray<T extends readonly unknown[]> =
  IsTuple<T> extends true
    ? JsonSchemaForTuple<T>
    : JsonSchemaArray & {
        items?: JsonSchemaOf<T[number]>;
      };

type JsonSchemaRecordValue<T extends object> =
  T extends Record<string, infer V> ? V : unknown;

type JsonSchemaForRecord<T extends object> = JsonSchemaRecord & {
  additionalProperties?: JsonSchemaOf<JsonSchemaRecordValue<T>>;
};

type JsonSchemaForObject<T extends object> = string extends keyof T
  ? JsonSchemaForRecord<T>
  : JsonSchemaObject & {
      properties?: JsonSchemaObjectProperties<T>;
      required?: JsonSchemaRequiredObjectKeys<T>[];
    };

type JsonSchemaForNonNull<T> = T extends string
  ? JsonSchemaString
  : T extends bigint
    ? JsonSchemaBigint
    : T extends number
      ? JsonSchemaNumber
      : T extends boolean
        ? JsonSchemaBoolean
        : T extends Date
          ? JsonSchemaDate
          : T extends Map<infer K, infer V>
            ? JsonSchemaMap & {
                items: JsonSchemaMap["items"] & {
                  prefixItems: [JsonSchemaOf<K>, JsonSchemaOf<V>];
                };
              }
            : T extends Set<infer U>
              ? JsonSchemaSet & {
                  items?: JsonSchemaOf<U>;
                }
              : T extends readonly unknown[]
                ? JsonSchemaForArray<T>
                : T extends (...args: any[]) => any
                  ? JsonSchemaNever
                  : T extends object
                    ? JsonSchemaForObject<T>
                    : JsonSchemaUnknown;

/**
 * Validates a JSON Schema type for a given TypeScript type.
 *
 * @remarks
 * This utility type is used to derive a JSON Schema type from a TypeScript type `T`. It ensures that the resulting JSON Schema is compatible with the structure and constraints of the TypeScript type. The specific mapping from TypeScript types to JSON Schema types is determined by the implementation of the schema extraction logic, which may involve analyzing the properties, types, and other characteristics of `T` to produce an appropriate JSON Schema representation.
 *
 * @see https://ajv.js.org/guide/typescript.html#utility-types-for-schemas
 *
 * @template T - The TypeScript type for which to derive the JSON Schema.
 */
export type JsonSchemaOf<T> =
  IsAny<T> extends true
    ? JsonSchemaAny
    : IsNever<T> extends true
      ? JsonSchemaNever
      : IsUnknown<T> extends true
        ? JsonSchemaUnknown
        : IsUnion<T> extends true
          ? null extends T
            ? JsonSchemaNullable & {
                anyOf: [JsonSchemaOf<Exclude<T, null>>, JsonSchemaNull];
              }
            : JsonSchemaAnyOf & {
                anyOf: Array<T extends unknown ? JsonSchemaOf<T> : never>;
              }
          : [T] extends [null]
            ? JsonSchemaNull
            : [T] extends [undefined]
              ? JsonSchemaUndefined
              : JsonSchemaForNonNull<T>;

// #endregion JSON Schema Types

type PrimitiveTypeToSpec<T extends JsonSchemaPrimitiveType> = T extends "string"
  ? string
  : T extends "number" | "integer"
    ? number
    : T extends "boolean"
      ? boolean
      : T extends "null"
        ? null
        : T extends "array"
          ? unknown[]
          : T extends "object"
            ? Record<string, unknown>
            : unknown;

type TypeKeywordToSpec<T> = T extends readonly unknown[]
  ? PrimitiveTypeToSpec<Extract<T[number], JsonSchemaPrimitiveType>>
  : T extends JsonSchemaPrimitiveType
    ? PrimitiveTypeToSpec<T>
    : unknown;

type RequiredPropertyKeys<T> = T extends readonly (infer K)[]
  ? K & string
  : never;

type SpecFromPropertyMap<
  TProperties extends Record<string, JsonSchema>,
  TRequired
> = {
  [
    K in keyof TProperties as K extends RequiredPropertyKeys<TRequired>
      ? K
      : never
  ]-?: SpecOf<TProperties[K]>;
} & {
  [
    K in keyof TProperties as K extends RequiredPropertyKeys<TRequired>
      ? never
      : K
  ]?: SpecOf<TProperties[K]>;
};

type EmptyObject = Record<never, never>;

type SpecFromObjectSchema<TSchema extends JsonSchemaObject | JsonSchemaRecord> =
  (TSchema extends {
    properties: infer TProperties extends Record<string, JsonSchema>;
  }
    ? SpecFromPropertyMap<
        TProperties,
        TSchema extends { required: infer TRequired } ? TRequired : never
      >
    : EmptyObject) &
    (TSchema extends { additionalProperties: infer TAdditional }
      ? TAdditional extends JsonSchema
        ? Record<string, SpecOf<TAdditional>>
        : TAdditional extends true
          ? Record<string, unknown>
          : EmptyObject
      : EmptyObject);

type SpecFromPrefixItems<T extends readonly JsonSchema[]> = {
  [K in keyof T]: SpecOf<T[K]>;
};

type SpecFromTupleSchema<TSchema extends JsonSchemaTuple> = TSchema extends {
  prefixItems: infer TPrefixItems extends readonly JsonSchema[];
}
  ? TSchema extends { items: infer TItems extends JsonSchema }
    ? [...SpecFromPrefixItems<TPrefixItems>, ...Array<SpecOf<TItems>>]
    : [...SpecFromPrefixItems<TPrefixItems>]
  : unknown[];

type UnionToIntersection<T> = (
  T extends any ? (value: T) => void : never
) extends (value: infer I) => void
  ? I
  : never;

type SpecFromAllOf<T extends readonly JsonSchema[]> = UnionToIntersection<
  SpecOf<T[number]>
>;

export type SpecOf<TJsonSchema extends JsonSchema> =
  TJsonSchema extends JsonSchemaNever
    ? never
    : TJsonSchema extends JsonSchemaUnknown | JsonSchemaAny
      ? unknown
      : TJsonSchema extends JsonSchemaUndefined
        ? undefined
        : TJsonSchema extends JsonSchemaNull
          ? null
          : TJsonSchema extends JsonSchemaDate
            ? Date
            : TJsonSchema extends JsonSchemaBigint
              ? bigint
              : TJsonSchema extends { const: infer TConst }
                ? TConst
                : TJsonSchema extends {
                      enum: infer TEnum extends readonly unknown[];
                    }
                  ? TEnum[number]
                  : TJsonSchema extends {
                        anyOf: readonly [
                          infer TValue extends JsonSchema,
                          JsonSchemaNull
                        ];
                      }
                    ? SpecOf<TValue> | null
                    : TJsonSchema extends JsonSchemaMap
                      ? TJsonSchema["items"] extends {
                          prefixItems: readonly [
                            infer TKeySchema extends JsonSchema,
                            infer TValueSchema extends JsonSchema
                          ];
                        }
                        ? Map<SpecOf<TKeySchema>, SpecOf<TValueSchema>>
                        : Map<unknown, unknown>
                      : TJsonSchema extends JsonSchemaSet
                        ? TJsonSchema extends {
                            items: infer TItems extends JsonSchema;
                          }
                          ? Set<SpecOf<TItems>>
                          : Set<unknown>
                        : TJsonSchema extends JsonSchemaTuple
                          ? SpecFromTupleSchema<TJsonSchema>
                          : TJsonSchema extends JsonSchemaArray
                            ? TJsonSchema extends {
                                items: infer TItems extends JsonSchema;
                              }
                              ? Array<SpecOf<TItems>>
                              : unknown[]
                            : TJsonSchema extends
                                  JsonSchemaObject | JsonSchemaRecord
                              ? SpecFromObjectSchema<TJsonSchema>
                              : TJsonSchema extends {
                                    allOf: readonly JsonSchema[];
                                  }
                                ? SpecFromAllOf<
                                    Extract<
                                      TJsonSchema["allOf"],
                                      readonly JsonSchema[]
                                    >
                                  >
                                : TJsonSchema extends {
                                      anyOf: readonly JsonSchema[];
                                    }
                                  ? SpecOf<
                                      Extract<
                                        TJsonSchema["anyOf"],
                                        readonly JsonSchema[]
                                      >[number]
                                    >
                                  : TJsonSchema extends {
                                        oneOf: readonly JsonSchema[];
                                      }
                                    ? SpecOf<
                                        Extract<
                                          TJsonSchema["oneOf"],
                                          readonly JsonSchema[]
                                        >[number]
                                      >
                                    : TJsonSchema extends { type: infer TType }
                                      ? TypeKeywordToSpec<TType>
                                      : unknown;

/**
 * Supported source variants from which a schema can be extracted.
 */
export type SchemaSourceVariant =
  "standard-schema" | "json-schema" | "zod3" | "untyped" | "valibot";

/**
 * Accepted schema input variants, including raw type definitions.
 */
export type SchemaConfigVariant = SchemaSourceVariant | "file-reference";

/**
 * Alias for the Untyped object-input schema shape.
 */
export type UntypedConfigObject = InputObject;

/**
 * Alias for the Untyped schema document shape.
 */
export type UntypedSchema = UntypedBaseSchema;

/**
 * A Valibot schema instance.
 *
 * @template TConfig - The raw input type accepted by the schema.
 * @template TOutput - The parsed output type produced by the schema.
 * @template TIssue - The issue type emitted for validation errors.
 */
export type ValibotSchema<
  TInput = unknown,
  TOutput = unknown,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>
> = BaseSchema<TInput, TOutput, TIssue>;

/**
 * Raw schema source input union before normalization.
 */
export type SchemaSourceConfig<TSpec = any> =
  | StandardJSONSchemaV1<TSpec>
  | JsonSchemaOf<TSpec>
  | z3.ZodType<TSpec, any, any>
  | UntypedConfigObject
  | UntypedSchema
  | ValibotSchema<TSpec>;

/**
 * Any accepted schema input, including normalized schemas and references.
 *
 * @remarks
 * The `SchemaConfig` type can be one of the following variants:
 * - A file path string (for example: `"./src/types.ts"`).
 * - A URL string (for example: `"https://example.com/config.json"`).
 * - A {@link GitHubReference | GitHub repository reference string}, starting with either `"github:"` or `"gh:"`, an optional branch or tag, and optionally including a specific file path within the repository (for example: `"github:main:storm-software/stryke/packages/resolve/src/types.ts"`). It is also valid to provide the branch or tag after the file path (for example: `"github:storm-software/stryke/packages/resolve/src/types.ts@main"`).
 * - A {@link GitLabReference | GitLab repository reference string}, starting with either `"gitlab:"` or `"gl:"`, an optional branch or tag, and optionally including a specific file path within the repository (for example: `"gitlab:master:storm-software/stryke/packages/resolve/src/types.ts"`). It is also valid to provide the branch or tag after the file path (for example: `"gitlab:storm-software/stryke/packages/resolve/src/types.ts@master"`).
 * - A TypeScript module name string (for example: `"@stryke/resolve"`), and optionally a specific module export from the package (for example: `"@stryke/resolve/some-module"`).
 * - A file reference string (this value can include both a path to the TypeScript module and the name of the module export separated by a ":", "#", or ";" character - for example: `"./src/types.ts#ExampleExport"`).
 * - A {@link FileReference} object, which contains information about a file reference.
 * - A {@link URL} object, which represents a URL to fetch the file from.
 * - A {@link SchemaSourceConfig} object, which represents a raw schema input in one of the supported formats (Standard Schema, JSON Schema, Zod v3, Untyped, or Valibot).
 *
 * @template TSpec - The original TypeScript type for which the schema is being extracted. This type parameter is used to derive the appropriate JSON Schema representation based on the structure and constraints of `T`.
 *
 * @see {@link SchemaSourceConfig}
 * @see {@link SchemaEnvelope}
 * @see {@link SchemaConfigWithMeta}
 */
export type SchemaConfig<TSpec = any> =
  | LoadReference
  | SchemaSourceConfig<TSpec>
  | SchemaEnvelope<JsonSchemaOf<TSpec>>;

export type InferExtractOptions<T extends SchemaConfig> =
  T extends LoadReference
    ? InferLoadOptions<T>
    : // eslint-disable-next-line ts/no-empty-object-type
      {};

/**
 * A schema envelope that contains the normalized schema and its source variant.
 */
export interface SchemaEnvelope<TJsonSchema extends JsonSchema = JsonSchema> {
  /**
   * A stable content hash for the normalized schema.
   */
  hash: string;

  /**
   * The source variant used to derive the normalized {@link JsonSchema}.
   */
  variant: SchemaConfigVariant;

  /**
   * The normalized schema definition.
   */
  schema: TJsonSchema;
}

/**
 * A normalized JSON Schema extracted from a source input of type `T`. This type represents the result of the schema extraction process, where a raw schema input (which could be in various formats such as Zod, Untyped, Valibot, or as a type definition in TypeScript source code) is transformed into a standardized JSON Schema format. The `SchemaOf<T>` type captures the normalized JSON Schema along with metadata about the source variant and a content hash for caching or identification purposes.
 *
 * @template TSpec - The original TypeScript type for which the schema is being extracted. This type parameter is used to derive the appropriate JSON Schema representation based on the structure and constraints of `T`.
 *
 * @see {@link SchemaEnvelope}
 */
export type SchemaEnvelopeOf<TSpec> = SchemaEnvelope<JsonSchemaOf<TSpec>>;

/**
 * Base metadata captured for schema source inputs.
 */
export interface BaseSchemaSource<TSpec = any> {
  /** A stable content hash for the original source schema. */
  hash: string;

  /** The specific source format used for the schema input. */
  variant: SchemaSourceVariant;

  /** The original schema input captured before normalization. */
  schema: SchemaSourceConfig<TSpec>;
}

/**
 * Source descriptor for schemas that already use JSON Schema.
 */
export interface JsonSchemaSchemaSource<
  TSpec = any
> extends BaseSchemaSource<TSpec> {
  /** Indicates the source input already uses JSON Schema syntax. */
  variant: "json-schema";

  /** The original JSON Schema document. */
  schema: JsonSchemaOf<TSpec>;
}

/**
 * Source descriptor for Standard Schema inputs.
 */
export interface StandardSchemaSchemaSource<
  TSpec = any
> extends BaseSchemaSource<TSpec> {
  /** Indicates the source input follows the Standard Schema format. */
  variant: "standard-schema";

  /** The original Standard Schema document. */
  schema: StandardJSONSchemaV1<TSpec>;
}

/**
 * Source descriptor for Zod v3 schema inputs.
 */
export interface Zod3SchemaSource<TSpec = any> extends BaseSchemaSource<TSpec> {
  /** Indicates the source input is a Zod v3 schema. */
  variant: "zod3";

  /** The original Zod v3 schema instance. */
  schema: z3.ZodType<TSpec, any, any>;
}

/**
 * Source descriptor for Untyped schema inputs.
 */
export interface UntypedSchemaSource<
  TSpec = any
> extends BaseSchemaSource<TSpec> {
  /** Indicates the source input comes from the Untyped schema model. */
  variant: "untyped";

  /** The original Untyped schema input. */
  schema: UntypedConfigObject | UntypedSchema;
}

/**
 * Source descriptor for Valibot schema inputs.
 */
export interface ValibotSchemaSource<
  TSpec = any
> extends BaseSchemaSource<TSpec> {
  /** Indicates the source input comes from the Valibot schema model. */
  variant: "valibot";

  /** The original Valibot schema input. */
  schema: ValibotSchema<TSpec>;
}

/**
 * Union of all normalized schema source descriptor variants.
 */
export type SchemaSource<TSpec = any> =
  | JsonSchemaSchemaSource<TSpec>
  | StandardSchemaSchemaSource<TSpec>
  | Zod3SchemaSource<TSpec>
  | UntypedSchemaSource<TSpec>
  | ValibotSchemaSource<TSpec>;

/**
 * A normalized schema plus metadata about the source that produced it.
 */
export interface ExtractedSchemaEnvelope<
  TSpec = any
> extends SchemaEnvelopeOf<TSpec> {
  /**
   * The schema source that produced this normalized schema.
   */
  source: SchemaSource<TSpec>;
}

declare module "zod" {
  interface GlobalMeta {
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
    examples?:
      unknown | { name?: string; description?: string; value: unknown }[];
    readOnly?: boolean;
    writeOnly?: boolean;
    contentEncoding?: string;
    contentMediaType?: string;
    contentSchema?: string;
    [keyword: string]: unknown;
  }
}

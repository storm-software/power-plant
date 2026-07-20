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

import { z } from "zod";

/**
 * Design Tokens Format Module (DTCG) Zod schemas.
 *
 * @see https://www.designtokens.org/tr/drafts/format/
 * @see https://www.designtokens.org/schemas/2025.10/format.json
 */

/** Valid token/group name: must not start with `$` and must not contain `{`, `}`, or `.`. */
export const tokenOrGroupNameSchema = z
  .string()
  .regex(
    /^[^${}.][^{}.]*$/,
    "Token/group names must not start with $ or contain {, }, or ."
  );

export type TokenOrGroupName = z.infer<typeof tokenOrGroupNameSchema>;

/** Curly-brace token reference, e.g. `{colors.blue}` or `{color.accent.$root}`. */
export const tokenCurlyBraceReferenceSchema = z
  .string()
  .regex(
    /^\{[^${}.][^{}.]*(\.[^${}.][^{}.]*)*\}$/,
    "Must be a curly-brace token reference (e.g. {group.token})"
  );

export type TokenCurlyBraceReference = z.infer<
  typeof tokenCurlyBraceReferenceSchema
>;

/** JSON Pointer URI fragment reference, e.g. `#/colors/blue`. */
export const tokenJsonPointerReferenceSchema = z
  .string()
  .regex(/^#\//, "Must be a JSON Pointer fragment (e.g. #/path/to/token)");

export type TokenJsonPointerReference = z.infer<
  typeof tokenJsonPointerReferenceSchema
>;

/** Object form of a JSON Pointer reference for property-level refs. */
export const tokenJsonPointerReferenceObjectSchema = z
  .object({
    $ref: tokenJsonPointerReferenceSchema
  })
  .strict();

export type TokenJsonPointerReferenceObject = z.infer<
  typeof tokenJsonPointerReferenceObjectSchema
>;

/** Token value reference via curly braces or JSON Pointer object. */
export const tokenValueReferenceSchema = z.union([
  tokenCurlyBraceReferenceSchema,
  tokenJsonPointerReferenceObjectSchema
]);

export type TokenValueReference = z.infer<typeof tokenValueReferenceSchema>;

/** Group `$extends` reference (curly brace or JSON Pointer string). */
export const tokenExtendsReferenceSchema = z.union([
  tokenCurlyBraceReferenceSchema,
  tokenJsonPointerReferenceSchema
]);

export type TokenExtendsReference = z.infer<typeof tokenExtendsReferenceSchema>;

/** `$deprecated` on tokens and groups. */
export const tokenDeprecatedSchema = z.union([z.boolean(), z.string()]);

export type TokenDeprecated = z.infer<typeof tokenDeprecatedSchema>;

/** Vendor-specific `$extensions` bag. */
export const tokenExtensionsSchema = z.record(z.string(), z.unknown());

export type TokenExtensions = z.infer<typeof tokenExtensionsSchema>;

/**
 * DTCG token `$type` values.
 *
 * @see https://www.designtokens.org/tr/drafts/format/#types
 */
export const tokenTypeSchema = z.enum([
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "number",
  "strokeStyle",
  "border",
  "transition",
  "shadow",
  "gradient",
  "typography"
]);

export type TokenType = z.infer<typeof tokenTypeSchema>;

/**
 * Supported color spaces for `$type: "color"`.
 *
 * @see https://www.designtokens.org/tr/drafts/color/
 */
export const tokenColorSpaceSchema = z.enum([
  "srgb",
  "srgb-linear",
  "hsl",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "display-p3",
  "a98-rgb",
  "prophoto-rgb",
  "rec2020",
  "xyz-d65",
  "xyz-d50"
]);

export type TokenColorSpace = z.infer<typeof tokenColorSpaceSchema>;

const noneKeywordSchema = z.literal("none");

const zeroToOneComponentSchema = z.union([
  z.number().min(0).max(1),
  noneKeywordSchema,
  tokenJsonPointerReferenceObjectSchema
]);

const hueComponentSchema = z.union([
  z.number().min(0).lt(360),
  noneKeywordSchema,
  tokenJsonPointerReferenceObjectSchema
]);

const percentageComponentSchema = z.union([
  z.number().min(0).max(100),
  noneKeywordSchema,
  tokenJsonPointerReferenceObjectSchema
]);

const chromaComponentSchema = z.union([
  z.number().min(0),
  noneKeywordSchema,
  tokenJsonPointerReferenceObjectSchema
]);

const unboundedComponentSchema = z.union([
  z.number(),
  noneKeywordSchema,
  tokenJsonPointerReferenceObjectSchema
]);

const rgbComponentsSchema = z.tuple([
  zeroToOneComponentSchema,
  zeroToOneComponentSchema,
  zeroToOneComponentSchema
]);

const xyzComponentsSchema = z.tuple([
  zeroToOneComponentSchema,
  zeroToOneComponentSchema,
  zeroToOneComponentSchema
]);

const colorComponentSchema = z.union([
  z.number(),
  noneKeywordSchema,
  tokenJsonPointerReferenceObjectSchema
]);

const colorHexSchema = z.union([
  z
    .string()
    .regex(
      /^#[0-9a-f]{6}$/i,
      "Hex fallback must be 6-digit CSS hex (e.g. #ff00ff)"
    ),
  tokenJsonPointerReferenceObjectSchema
]);

const colorAlphaSchema = z.union([
  z.number().min(0).max(1),
  tokenJsonPointerReferenceObjectSchema
]);

const colorValueBySpaceSchema = z.discriminatedUnion("colorSpace", [
  z
    .object({
      colorSpace: z.literal("srgb"),
      components: rgbComponentsSchema,
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("srgb-linear"),
      components: rgbComponentsSchema,
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("display-p3"),
      components: rgbComponentsSchema,
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("a98-rgb"),
      components: rgbComponentsSchema,
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("prophoto-rgb"),
      components: rgbComponentsSchema,
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("rec2020"),
      components: rgbComponentsSchema,
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("xyz-d65"),
      components: xyzComponentsSchema,
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("xyz-d50"),
      components: xyzComponentsSchema,
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("hsl"),
      components: z.tuple([
        hueComponentSchema,
        percentageComponentSchema,
        percentageComponentSchema
      ]),
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("hwb"),
      components: z.tuple([
        hueComponentSchema,
        percentageComponentSchema,
        percentageComponentSchema
      ]),
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("lab"),
      components: z.tuple([
        percentageComponentSchema,
        unboundedComponentSchema,
        unboundedComponentSchema
      ]),
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("lch"),
      components: z.tuple([
        percentageComponentSchema,
        chromaComponentSchema,
        hueComponentSchema
      ]),
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("oklab"),
      components: z.tuple([
        zeroToOneComponentSchema,
        unboundedComponentSchema,
        unboundedComponentSchema
      ]),
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict(),
  z
    .object({
      colorSpace: z.literal("oklch"),
      components: z.tuple([
        zeroToOneComponentSchema,
        chromaComponentSchema,
        hueComponentSchema
      ]),
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict()
]);

/** Color token `$value` (Color module). */
export const tokenColorValueSchema = z.union([
  colorValueBySpaceSchema,
  z
    .object({
      colorSpace: tokenJsonPointerReferenceObjectSchema,
      components: z.union([
        z.array(colorComponentSchema).min(1),
        tokenJsonPointerReferenceObjectSchema
      ]),
      alpha: colorAlphaSchema.optional(),
      hex: colorHexSchema.optional()
    })
    .strict()
]);

export type TokenColorValue = z.infer<typeof tokenColorValueSchema>;

/** Dimension token `$value`. */
export const tokenDimensionValueSchema = z
  .object({
    value: z.union([z.number(), tokenJsonPointerReferenceObjectSchema]),
    unit: z.union([
      z.enum(["px", "rem"]),
      tokenJsonPointerReferenceObjectSchema
    ])
  })
  .strict();

export type TokenDimensionValue = z.infer<typeof tokenDimensionValueSchema>;

/** Font family token `$value`. */
export const tokenFontFamilyValueSchema = z.union([
  z
    .string()
    .refine(
      value => !tokenCurlyBraceReferenceSchema.safeParse(value).success,
      "Font family string must not be a curly-brace reference"
    ),
  z
    .array(
      z.union([
        z
          .string()
          .refine(
            value => !tokenCurlyBraceReferenceSchema.safeParse(value).success,
            "Font family string must not be a curly-brace reference"
          ),
        tokenJsonPointerReferenceObjectSchema
      ])
    )
    .min(1)
]);

export type TokenFontFamilyValue = z.infer<typeof tokenFontFamilyValueSchema>;

/** Font weight token `$value`. */
export const tokenFontWeightValueSchema = z.union([
  z.number().min(1).max(1000),
  z.enum([
    "thin",
    "hairline",
    "extra-light",
    "ultra-light",
    "light",
    "normal",
    "regular",
    "book",
    "medium",
    "semi-bold",
    "demi-bold",
    "bold",
    "extra-bold",
    "ultra-bold",
    "black",
    "heavy",
    "extra-black",
    "ultra-black"
  ])
]);

export type TokenFontWeightValue = z.infer<typeof tokenFontWeightValueSchema>;

/** Duration token `$value`. */
export const tokenDurationValueSchema = z
  .object({
    value: z.union([z.number(), tokenJsonPointerReferenceObjectSchema]),
    unit: z.union([z.enum(["ms", "s"]), tokenJsonPointerReferenceObjectSchema])
  })
  .strict();

export type TokenDurationValue = z.infer<typeof tokenDurationValueSchema>;

const cubicBezierXSchema = z.union([
  z.number().min(0).max(1),
  tokenJsonPointerReferenceObjectSchema
]);

const cubicBezierYSchema = z.union([
  z.number(),
  tokenJsonPointerReferenceObjectSchema
]);

/** Cubic Bézier token `$value` — `[P1x, P1y, P2x, P2y]`. */
export const tokenCubicBezierValueSchema = z.tuple([
  cubicBezierXSchema,
  cubicBezierYSchema,
  cubicBezierXSchema,
  cubicBezierYSchema
]);

export type TokenCubicBezierValue = z.infer<typeof tokenCubicBezierValueSchema>;

/** Number token `$value`. */
export const tokenNumberValueSchema = z.number();

export type TokenNumberValue = z.infer<typeof tokenNumberValueSchema>;

const strokeStyleKeywordSchema = z.enum([
  "solid",
  "dashed",
  "dotted",
  "double",
  "groove",
  "ridge",
  "outset",
  "inset"
]);

const strokeStyleObjectSchema = z
  .object({
    dashArray: z.union([
      z
        .array(z.union([tokenDimensionValueSchema, tokenValueReferenceSchema]))
        .min(1),
      tokenJsonPointerReferenceObjectSchema
    ]),
    lineCap: z.union([
      z.enum(["round", "butt", "square"]),
      tokenJsonPointerReferenceObjectSchema
    ])
  })
  .strict();

/** Stroke style token `$value`. */
export const tokenStrokeStyleValueSchema = z.union([
  strokeStyleKeywordSchema,
  strokeStyleObjectSchema
]);

export type TokenStrokeStyleValue = z.infer<typeof tokenStrokeStyleValueSchema>;

/** Border token `$value`. */
export const tokenBorderValueSchema = z
  .object({
    color: z.union([tokenColorValueSchema, tokenValueReferenceSchema]),
    width: z.union([tokenDimensionValueSchema, tokenValueReferenceSchema]),
    style: z.union([tokenStrokeStyleValueSchema, tokenValueReferenceSchema])
  })
  .strict();

export type TokenBorderValue = z.infer<typeof tokenBorderValueSchema>;

/** Transition token `$value`. */
export const tokenTransitionValueSchema = z
  .object({
    duration: z.union([tokenDurationValueSchema, tokenValueReferenceSchema]),
    delay: z.union([tokenDurationValueSchema, tokenValueReferenceSchema]),
    timingFunction: z.union([
      tokenCubicBezierValueSchema,
      tokenValueReferenceSchema
    ])
  })
  .strict();

export type TokenTransitionValue = z.infer<typeof tokenTransitionValueSchema>;

const shadowObjectSchema = z
  .object({
    color: z.union([tokenColorValueSchema, tokenValueReferenceSchema]),
    offsetX: z.union([tokenDimensionValueSchema, tokenValueReferenceSchema]),
    offsetY: z.union([tokenDimensionValueSchema, tokenValueReferenceSchema]),
    blur: z.union([tokenDimensionValueSchema, tokenValueReferenceSchema]),
    spread: z.union([tokenDimensionValueSchema, tokenValueReferenceSchema]),
    inset: z
      .union([z.boolean(), tokenJsonPointerReferenceObjectSchema])
      .optional()
  })
  .strict();

/** Shadow token `$value` — single object or layered array. */
export const tokenShadowValueSchema = z.union([
  shadowObjectSchema,
  z.array(z.union([shadowObjectSchema, tokenValueReferenceSchema])).min(1)
]);

export type TokenShadowValue = z.infer<typeof tokenShadowValueSchema>;

const gradientStopSchema = z
  .object({
    color: z.union([tokenColorValueSchema, tokenValueReferenceSchema]),
    position: z.union([z.number().min(0).max(1), tokenValueReferenceSchema])
  })
  .strict();

/** Gradient token `$value`. */
export const tokenGradientValueSchema = z
  .array(z.union([gradientStopSchema, tokenValueReferenceSchema]))
  .min(1);

export type TokenGradientValue = z.infer<typeof tokenGradientValueSchema>;

/** Typography token `$value`. */
export const tokenTypographyValueSchema = z
  .object({
    fontFamily: z.union([
      tokenFontFamilyValueSchema,
      tokenValueReferenceSchema
    ]),
    fontSize: z.union([tokenDimensionValueSchema, tokenValueReferenceSchema]),
    fontWeight: z.union([
      tokenFontWeightValueSchema,
      tokenValueReferenceSchema
    ]),
    letterSpacing: z.union([
      tokenDimensionValueSchema,
      tokenValueReferenceSchema
    ]),
    lineHeight: z.union([tokenNumberValueSchema, tokenValueReferenceSchema])
  })
  .strict();

export type TokenTypographyValue = z.infer<typeof tokenTypographyValueSchema>;

/** Concrete (non-reference) token values for any DTCG type. */
export const tokenConcreteValueSchema = z.union([
  tokenColorValueSchema,
  tokenDimensionValueSchema,
  tokenFontFamilyValueSchema,
  tokenDurationValueSchema,
  tokenCubicBezierValueSchema,
  tokenStrokeStyleValueSchema,
  tokenBorderValueSchema,
  tokenTransitionValueSchema,
  tokenShadowValueSchema,
  tokenGradientValueSchema,
  tokenTypographyValueSchema,
  tokenNumberValueSchema,
  tokenFontWeightValueSchema
]);

export type TokenConcreteValue = z.infer<typeof tokenConcreteValueSchema>;

/** Token `$value`: concrete value or alias reference. */
export const tokenValueSchema = z.union([
  tokenConcreteValueSchema,
  tokenValueReferenceSchema
]);

export type TokenValue = z.infer<typeof tokenValueSchema>;

const typedValueSchemas = {
  color: tokenColorValueSchema,
  dimension: tokenDimensionValueSchema,
  fontFamily: tokenFontFamilyValueSchema,
  fontWeight: tokenFontWeightValueSchema,
  duration: tokenDurationValueSchema,
  cubicBezier: tokenCubicBezierValueSchema,
  number: tokenNumberValueSchema,
  strokeStyle: tokenStrokeStyleValueSchema,
  border: tokenBorderValueSchema,
  transition: tokenTransitionValueSchema,
  shadow: tokenShadowValueSchema,
  gradient: tokenGradientValueSchema,
  typography: tokenTypographyValueSchema
} as const satisfies Record<TokenType, z.ZodType>;

const isTokenValueReference = (value: unknown): boolean =>
  tokenValueReferenceSchema.safeParse(value).success;

/**
 * A design token — object with `$value` or `$ref` (mutually exclusive).
 *
 * @see https://www.designtokens.org/tr/drafts/format/#design-token
 */
export const tokenSchema = z
  .object({
    $value: tokenValueSchema.optional(),
    $type: tokenTypeSchema.optional(),
    $ref: tokenJsonPointerReferenceSchema.optional(),
    $description: z.string().optional(),
    $extensions: tokenExtensionsSchema.optional(),
    $deprecated: tokenDeprecatedSchema.optional()
  })
  .strict()
  .superRefine((token, ctx) => {
    const hasValue = token.$value !== undefined;
    const hasRef = token.$ref !== undefined;

    if (hasValue === hasRef) {
      ctx.addIssue({
        code: "custom",
        message: "Token must define exactly one of $value or $ref"
      });
      return;
    }

    if (
      hasValue &&
      token.$type !== undefined &&
      !isTokenValueReference(token.$value)
    ) {
      const result = typedValueSchemas[token.$type].safeParse(token.$value);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            ...issue,
            path: ["$value", ...issue.path]
          });
        }
      }
    }
  });

export type Token = z.infer<typeof tokenSchema>;

const GROUP_PROPERTY_KEYS = new Set([
  "$type",
  "$description",
  "$extensions",
  "$extends",
  "$deprecated",
  "$root"
]);

const ROOT_PROPERTY_KEYS = new Set(["$schema", ...GROUP_PROPERTY_KEYS]);

interface TokenGroupProperties {
  $type?: TokenType;
  $description?: string;
  $extensions?: TokenExtensions;
  $extends?: TokenExtendsReference;
  $deprecated?: TokenDeprecated;
  $root?: Token;
}

export type TokenGroup = TokenGroupProperties & {
  [key: string]:
    | Token
    | TokenGroup
    | TokenType
    | string
    | TokenExtensions
    | TokenExtendsReference
    | TokenDeprecated
    | undefined;
};

export type TokenGroupOrToken = Token | TokenGroup;

const tokenGroupPropertiesSchema = z.object({
  $type: tokenTypeSchema.optional(),
  $description: z.string().optional(),
  $extensions: tokenExtensionsSchema.optional(),
  $extends: tokenExtendsReferenceSchema.optional(),
  $deprecated: tokenDeprecatedSchema.optional(),
  $root: tokenSchema.optional()
});

const refineGroupChildKeys = (
  value: Record<string, unknown>,
  ctx: z.RefinementCtx,
  reservedKeys: Set<string>
) => {
  for (const key of Object.keys(value)) {
    if (reservedKeys.has(key)) {
      continue;
    }

    if (key.startsWith("$")) {
      ctx.addIssue({
        code: "custom",
        path: [key],
        message: `Unknown reserved property "${key}"`
      });
      continue;
    }

    const nameResult = tokenOrGroupNameSchema.safeParse(key);
    if (!nameResult.success) {
      ctx.addIssue({
        code: "custom",
        path: [key],
        message: "Token/group names must not start with $ or contain {, }, or ."
      });
    }
  }
};

const isTokenNode = (value: unknown): value is Token => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return "$value" in value || "$ref" in value;
};

/**
 * Nested group or token node inside a DTCG document.
 *
 * Presence of `$value` or `$ref` identifies a token; otherwise the node is a group.
 */
export const tokenGroupOrTokenSchema: z.ZodType<TokenGroupOrToken> =
  // eslint-disable-next-line ts/no-use-before-define
  z.lazy(() => z.union([tokenSchema, tokenGroupSchema]));

/**
 * A DTCG group — object without `$value` / `$ref`, optionally holding nested tokens/groups.
 *
 * @see https://www.designtokens.org/tr/drafts/format/#groups
 */
export const tokenGroupSchema: z.ZodType<TokenGroup> = z.lazy(() =>
  tokenGroupPropertiesSchema
    .catchall(tokenGroupOrTokenSchema)
    .superRefine((group, ctx) => {
      if (isTokenNode(group)) {
        ctx.addIssue({
          code: "custom",
          message: "Group must not define $value or $ref"
        });
        return;
      }

      refineGroupChildKeys(group, ctx, GROUP_PROPERTY_KEYS);
    })
);

export type Tokens = TokenGroup & {
  $schema?: string;
};

/**
 * Root design tokens document (`.tokens` / `.tokens.json`).
 *
 * Same structure as a group, plus optional `$schema`.
 *
 * @see https://www.designtokens.org/tr/drafts/format/#file-format
 */
export const tokensSchema: z.ZodType<Tokens> = z.lazy(() =>
  tokenGroupPropertiesSchema
    .extend({
      $schema: z.string().optional()
    })
    .catchall(tokenGroupOrTokenSchema)
    .superRefine((document, ctx) => {
      if (isTokenNode(document)) {
        ctx.addIssue({
          code: "custom",
          message: "Design tokens document root must be a group, not a token"
        });
        return;
      }

      refineGroupChildKeys(document, ctx, ROOT_PROPERTY_KEYS);
    })
);

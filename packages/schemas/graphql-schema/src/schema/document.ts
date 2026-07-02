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

import * as z from "zod/mini";
import {
  directiveDefinitionSchema,
  schemaDefinitionSchema,
  typeDefinitionSchema
} from "./definition";
import { externalDocsSchema, infoSchema, tagSchema } from "./shared";
import type { TypeReference } from "./value";
import { collectNamedTypeReferences } from "./value";

const graphqlVersionSchema = z
  .string()
  .check(z.regex(/^1\.\d+$/, "GraphQL document version must be 1.x"));

const BUILTIN_SCALARS = new Set(["String", "Int", "Float", "Boolean", "ID"]);

const BUILTIN_DIRECTIVES = new Set([
  "skip",
  "include",
  "deprecated",
  "specifiedBy",
  "oneOf"
]);

function isKnownType(name: string, definedTypes: Set<string>): boolean {
  return BUILTIN_SCALARS.has(name) || definedTypes.has(name);
}

function validateTypeReference(
  typeReference: TypeReference,
  definedTypes: Set<string>,
  context: z.core.$RefinementCtx<unknown>,
  path: (string | number)[]
) {
  for (const typeName of collectNamedTypeReferences(typeReference)) {
    if (!isKnownType(typeName, definedTypes)) {
      context.addIssue({
        code: "custom",
        message: `Type "${typeName}" is referenced but not defined`,
        path
      });
    }
  }
}

function validateDirectiveApplications(
  directives: Array<{ name: string }> | undefined,
  definedDirectives: Set<string>,
  context: z.core.$RefinementCtx<unknown>,
  path: (string | number)[]
) {
  if (!directives?.length) {
    return;
  }

  for (const [index, directive] of directives.entries()) {
    if (
      !BUILTIN_DIRECTIVES.has(directive.name) &&
      !definedDirectives.has(directive.name)
    ) {
      context.addIssue({
        code: "custom",
        message: `Directive "@${directive.name}" is referenced but not defined`,
        path: [...path, index, "name"]
      });
    }
  }
}

export const graphqlSchema = z
  .object({
    graphql: graphqlVersionSchema,
    info: infoSchema,
    schema: z.optional(schemaDefinitionSchema),
    types: z
      .array(typeDefinitionSchema)
      .check(
        z.refine(
          value => value.length > 0,
          "At least one type definition must be provided"
        )
      ),
    directives: z.optional(z.array(directiveDefinitionSchema)),
    tags: z.optional(z.array(tagSchema)),
    externalDocs: z.optional(externalDocsSchema),
    extensions: z.optional(z.record(z.string(), z.unknown()))
  })
  .check(
    z.superRefine((document, context) => {
      const definedTypes = new Set(document.types.map(type => type.name));
      const definedDirectives = new Set(
        document.directives?.map(directive => directive.name) ?? []
      );

      const duplicateTypeNames = document.types
        .map(type => type.name)
        .filter((name, index, names) => names.indexOf(name) !== index);

      for (const duplicateName of new Set(duplicateTypeNames)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate type definition "${duplicateName}"`,
          path: ["types"]
        });
      }

      const duplicateDirectiveNames =
        document.directives
          ?.map(directive => directive.name)
          .filter((name, index, names) => names.indexOf(name) !== index) ?? [];

      for (const duplicateName of new Set(duplicateDirectiveNames)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate directive definition "@${duplicateName}"`,
          path: ["directives"]
        });
      }

      const rootOperations = [
        document.schema?.query,
        document.schema?.mutation,
        document.schema?.subscription
      ].filter((operation): operation is string => Boolean(operation));

      if (!rootOperations.length && !definedTypes.has("Query")) {
        context.addIssue({
          code: "custom",
          message:
            "Schema must define a query root type or include a Query type definition",
          path: ["schema"]
        });
      }

      validateDirectiveApplications(
        document.schema?.directives,
        definedDirectives,
        context,
        ["schema", "directives"]
      );

      for (const rootType of rootOperations) {
        const rootTypeDefinition = document.types.find(
          type => type.name === rootType
        );

        if (!rootTypeDefinition) {
          context.addIssue({
            code: "custom",
            message: `Root operation type "${rootType}" is not defined in types`,
            path: ["schema"]
          });
          continue;
        }

        if (rootTypeDefinition.kind !== "OBJECT") {
          context.addIssue({
            code: "custom",
            message: `Root operation type "${rootType}" must be an object type`,
            path: ["schema"]
          });
        }
      }

      for (const [typeIndex, typeDefinition] of document.types.entries()) {
        validateDirectiveApplications(
          typeDefinition.directives,
          definedDirectives,
          context,
          ["types", typeIndex, "directives"]
        );

        if (
          typeDefinition.kind === "OBJECT" ||
          typeDefinition.kind === "INTERFACE"
        ) {
          for (const interfaceName of typeDefinition.interfaces ?? []) {
            const interfaceType = document.types.find(
              type => type.name === interfaceName
            );

            if (!interfaceType) {
              context.addIssue({
                code: "custom",
                message: `Interface "${interfaceName}" is referenced but not defined`,
                path: ["types", typeIndex, "interfaces"]
              });
              continue;
            }

            if (interfaceType.kind !== "INTERFACE") {
              context.addIssue({
                code: "custom",
                message: `"${interfaceName}" must be an interface type`,
                path: ["types", typeIndex, "interfaces"]
              });
            }
          }

          for (const [fieldIndex, field] of typeDefinition.fields.entries()) {
            validateTypeReference(field.type, definedTypes, context, [
              "types",
              typeIndex,
              "fields",
              fieldIndex,
              "type"
            ]);

            validateDirectiveApplications(
              field.directives,
              definedDirectives,
              context,
              ["types", typeIndex, "fields", fieldIndex, "directives"]
            );

            for (const [argIndex, arg] of (field.args ?? []).entries()) {
              validateTypeReference(arg.type, definedTypes, context, [
                "types",
                typeIndex,
                "fields",
                fieldIndex,
                "args",
                argIndex,
                "type"
              ]);

              validateDirectiveApplications(
                arg.directives,
                definedDirectives,
                context,
                [
                  "types",
                  typeIndex,
                  "fields",
                  fieldIndex,
                  "args",
                  argIndex,
                  "directives"
                ]
              );
            }
          }
        }

        if (typeDefinition.kind === "UNION") {
          for (const [
            memberIndex,
            memberType
          ] of typeDefinition.types.entries()) {
            if (!definedTypes.has(memberType)) {
              context.addIssue({
                code: "custom",
                message: `Union member type "${memberType}" is not defined`,
                path: ["types", typeIndex, "types", memberIndex]
              });
              continue;
            }

            const memberDefinition = document.types.find(
              type => type.name === memberType
            );

            if (
              memberDefinition &&
              memberDefinition.kind !== "OBJECT" &&
              memberDefinition.kind !== "INTERFACE"
            ) {
              context.addIssue({
                code: "custom",
                message: `Union member type "${memberType}" must be an object or interface type`,
                path: ["types", typeIndex, "types", memberIndex]
              });
            }
          }
        }

        if (typeDefinition.kind === "INPUT_OBJECT") {
          for (const [fieldIndex, field] of typeDefinition.fields.entries()) {
            validateTypeReference(field.type, definedTypes, context, [
              "types",
              typeIndex,
              "fields",
              fieldIndex,
              "type"
            ]);

            validateDirectiveApplications(
              field.directives,
              definedDirectives,
              context,
              ["types", typeIndex, "fields", fieldIndex, "directives"]
            );
          }
        }

        if (typeDefinition.kind === "ENUM") {
          for (const [valueIndex, value] of typeDefinition.values.entries()) {
            validateDirectiveApplications(
              value.directives,
              definedDirectives,
              context,
              ["types", typeIndex, "values", valueIndex, "directives"]
            );
          }
        }
      }

      for (const [directiveIndex, directive] of (
        document.directives ?? []
      ).entries()) {
        validateDirectiveApplications(
          directive.directives,
          definedDirectives,
          context,
          ["directives", directiveIndex, "directives"]
        );

        for (const [argIndex, arg] of (directive.args ?? []).entries()) {
          validateTypeReference(arg.type, definedTypes, context, [
            "directives",
            directiveIndex,
            "args",
            argIndex,
            "type"
          ]);

          validateDirectiveApplications(
            arg.directives,
            definedDirectives,
            context,
            ["directives", directiveIndex, "args", argIndex, "directives"]
          );
        }
      }
    })
  );

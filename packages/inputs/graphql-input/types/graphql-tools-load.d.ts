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

declare module "@graphql-tools/load" {
  import type { BaseLoaderOptions, Loader, Source } from "@graphql-tools/utils";
  import type { BuildSchemaOptions, GraphQLSchema } from "graphql";

  /**
   * @see https://github.com/ardatan/graphql-tools/blob/master/packages/load/src/load-typedefs.ts
   */
  export type UnnormalizedTypeDefPointer = { [key: string]: any } | string;

  /**
   * @see https://github.com/ardatan/graphql-tools/blob/master/packages/load/src/load-typedefs.ts
   */
  export type LoadTypedefsOptions<ExtraConfig = { [key: string]: any }> =
    BaseLoaderOptions &
      ExtraConfig & {
        cache?: { [key: string]: Source[] };
        loaders: Loader[];
        filterKinds?: string[];
        sort?: boolean;
      };

  /**
   * Schema load options. Upstream also intersects `Partial<IExecutableSchemaDefinition>`
   * from `@graphql-tools/schema`; those fields are covered by the default
   * `ExtraConfig` index signature on {@link LoadTypedefsOptions}.
   *
   * @see https://github.com/ardatan/graphql-tools/blob/master/packages/load/src/schema.ts
   */
  export type LoadSchemaOptions = BuildSchemaOptions &
    LoadTypedefsOptions & {
      /**
       * Adds a list of Sources in to `extensions.sources`
       *
       * Disabled by default.
       */
      includeSources?: boolean;
    };

  /**
   * Asynchronously loads a schema from the provided pointers.
   *
   * @see https://github.com/ardatan/graphql-tools/blob/master/packages/load/src/schema.ts
   */
  export function loadSchema(
    schemaPointers: UnnormalizedTypeDefPointer | UnnormalizedTypeDefPointer[],
    options: LoadSchemaOptions
  ): Promise<GraphQLSchema>;
}

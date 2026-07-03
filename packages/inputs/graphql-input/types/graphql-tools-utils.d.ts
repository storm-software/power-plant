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

declare module "@graphql-tools/utils" {
  import type {
    BuildSchemaOptions,
    DocumentNode,
    GraphQLSchema
  } from "graphql";

  export interface GraphQLParseOptions {
    noLocation?: boolean;
    allowLegacySDLEmptyFields?: boolean;
    allowLegacySDLImplementsInterfaces?: boolean;
    experimentalFragmentVariables?: boolean;
    /**
     * Set to `true` in order to convert all GraphQL comments (marked with # sign) to descriptions (""")
     * GraphQL has built-in support for transforming descriptions to comments (with `print`), but not while
     * parsing. Turning the flag on will support the other way as well (`parse`)
     */
    commentDescriptions?: boolean;
  }

  export interface Source {
    document?: DocumentNode;
    schema?: GraphQLSchema;
    rawSDL?: string;
    location?: string;
  }

  export type BaseLoaderOptions = GraphQLParseOptions &
    BuildSchemaOptions & {
      cwd?: string;
      ignore?: string | string[];
      includeSources?: boolean;
    };

  export type WithList<T> = T | T[];
  export type ElementOf<TList> =
    TList extends Array<infer TElement> ? TElement : never;

  export interface Loader<
    TOptions extends BaseLoaderOptions = BaseLoaderOptions
  > {
    load: (pointer: string, options: TOptions) => Promise<Source[] | null>;
    loadSync: (pointer: string, options: TOptions) => Source[] | null;
  }
}

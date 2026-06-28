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

export interface OpenAPIReference {
  $ref: string;
}

export interface OpenAPIContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface OpenAPILicense {
  name: string;
  url?: string;
  identifier?: string;
}

export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: OpenAPIContact;
  license?: OpenAPILicense;
  summary?: string;
}

export interface OpenAPIServerVariable {
  default: string;
  enum?: string[];
  description?: string;
}

export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: Record<string, OpenAPIServerVariable>;
}

export interface OpenAPITag {
  name: string;
  description?: string;
  externalDocs?: OpenAPIExternalDocs;
}

export interface OpenAPIExternalDocs {
  description?: string;
  url: string;
}

export interface OpenAPIExample {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
  $ref?: string;
}

export type OpenAPIJsonSchema = OpenAPIReference | Record<string, unknown>;

export interface OpenAPIMediaType {
  schema?: OpenAPIJsonSchema;
  example?: unknown;
  examples?: Record<string, OpenAPIExample | OpenAPIReference>;
  encoding?: Record<string, unknown>;
}

export interface OpenAPIParameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: OpenAPIJsonSchema;
  example?: unknown;
  examples?: Record<string, OpenAPIExample | OpenAPIReference>;
}

export interface OpenAPIHeader {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: OpenAPIJsonSchema;
  example?: unknown;
  examples?: Record<string, OpenAPIExample | OpenAPIReference>;
}

export interface OpenAPIRequestBody {
  description?: string;
  content: Record<string, OpenAPIMediaType>;
  required?: boolean;
}

export interface OpenAPIResponse {
  description: string;
  headers?: Record<string, OpenAPIHeader | OpenAPIReference>;
  content?: Record<string, OpenAPIMediaType>;
  links?: Record<string, unknown>;
}

export type OpenAPISecurityScheme =
  | {
      type: "apiKey";
      name: string;
      in: "query" | "header" | "cookie";
      description?: string;
    }
  | {
      type: "http";
      scheme: string;
      bearerFormat?: string;
      description?: string;
    }
  | {
      type: "oauth2";
      description?: string;
      flows: Record<string, unknown>;
    }
  | {
      type: "openIdConnect";
      openIdConnectUrl: string;
      description?: string;
    };

export type OpenAPISecurityRequirement = Record<string, string[]>;

export interface OpenAPIOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: OpenAPIExternalDocs;
  operationId?: string;
  parameters?: Array<OpenAPIParameter | OpenAPIReference>;
  requestBody?: OpenAPIRequestBody | OpenAPIReference;
  responses: Record<string, OpenAPIResponse | OpenAPIReference>;
  callbacks?: Record<string, unknown>;
  deprecated?: boolean;
  security?: OpenAPISecurityRequirement[];
  servers?: OpenAPIServer[];
}

export interface OpenAPIPathItem {
  $ref?: string;
  summary?: string;
  description?: string;
  servers?: OpenAPIServer[];
  parameters?: Array<OpenAPIParameter | OpenAPIReference>;
  get?: OpenAPIOperation;
  put?: OpenAPIOperation;
  post?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  options?: OpenAPIOperation;
  head?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  trace?: OpenAPIOperation;
}

export interface OpenAPIComponents {
  schemas?: Record<string, OpenAPIJsonSchema>;
  responses?: Record<string, OpenAPIResponse | OpenAPIReference>;
  parameters?: Record<string, OpenAPIParameter | OpenAPIReference>;
  examples?: Record<string, OpenAPIExample | OpenAPIReference>;
  requestBodies?: Record<string, OpenAPIRequestBody | OpenAPIReference>;
  headers?: Record<string, OpenAPIHeader | OpenAPIReference>;
  securitySchemes?: Record<string, OpenAPISecurityScheme>;
  links?: Record<string, unknown>;
  callbacks?: Record<string, unknown>;
  pathItems?: Record<string, OpenAPIPathItem | OpenAPIReference>;
}

/**
 * OpenAPI 3.0, 3.1, or 3.2 specification document.
 *
 * @see https://spec.openapis.org/oas/latest.html
 */
export interface OpenAPIDocument {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: Record<string, OpenAPIPathItem>;
  webhooks?: Record<string, OpenAPIPathItem>;
  components?: OpenAPIComponents;
  security?: OpenAPISecurityRequirement[];
  tags?: OpenAPITag[];
  externalDocs?: OpenAPIExternalDocs;
  jsonSchemaDialect?: string;
}

import * as z from "zod/mini";
import {
  infoSchema,
  securityRequirementSchema,
  operationSchema,
  pathItemSchema
} from "@power-plant/openapi-schema";
import { jsonSchema } from "@power-plant/schema/zod";

export type OperationSchema = z.infer<typeof operationSchema>;
export type PathSchema = z.infer<typeof pathItemSchema>;
export type ModelSchema = z.infer<typeof jsonSchema>;
export type InfoSchema = z.infer<typeof infoSchema>;
export type SecuritySchema = z.infer<typeof securityRequirementSchema>;

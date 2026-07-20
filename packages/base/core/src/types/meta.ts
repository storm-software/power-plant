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

export type MetaDeprecated =
  true | string | { message?: string; since?: string; alternative?: string };

export type MetaLink = string | { href: string; description?: string };

export interface BaseMetaConfig {
  /**
   * Additional data associated with the object.
   */
  data?: Record<string, any>;
}

export interface MetaConfig extends BaseMetaConfig {
  /**
   * A name for the object, which can be used to identify or reference the object in documentation, tooling, or other contexts. The presence of this property does not affect the validation behavior of the object itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   *
   * @remarks
   * The `name` property is a string that can be used to give the object a human-readable identifier. It can be used in documentation, error messages, or other contexts where it is helpful to have a name associated with the object. The presence of this property does not affect the validation behavior of the object itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  name?: string;

  /**
   * A version string that indicates the version of the object. This property can be used to track changes or updates to the object over time, allowing consumers of the object to determine which version they are working with. The presence of this property does not affect the validation behavior of the object itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   *
   * @remarks
   * The `version` property is a string that can follow any versioning scheme, such as semantic versioning (e.g., "1.0.0", "2.1.3"), date-based versioning (e.g., "2023-06-15"), or any other format that conveys the version of the object. It is recommended to use a consistent versioning scheme across all objects to facilitate easier tracking and management of object versions.
   *
   * @defaultValue "1.0"
   */
  version?: string | Date | number;

  /**
   * A string that describes the object in some way.
   */
  description?: string;

  /**
   * A string that provides a human-readable name for the object, which can be used in documentation, tooling, or other contexts to identify or reference the object. The presence of this property does not affect the validation behavior of the object itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   *
   * @remarks
   * The `title` property is a string that can be used to give the object a more user-friendly or descriptive name. It can be used in documentation, error messages, or other contexts where it is helpful to have a display name associated with the object. The presence of this property does not affect the validation behavior of the object itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  title?: string;

  /**
   * A string that describes when the object is used.
   */
  usage?: string;

  /**
   * Indicates whether the object is deprecated, and optionally provides additional information about the deprecation, such as a message, the version since which it is deprecated, and an alternative object to use instead.
   *
   * @remarks
   * The `deprecated` property can be a boolean value, where `true` indicates that the object is deprecated and `false` indicates that it is not. It can also be a string that provides a message explaining the deprecation, or an object that includes additional details such as a message, the version since which it is deprecated, and an alternative object to use instead. The presence of this property does not affect the validation behavior of the object itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  deprecated?: MetaDeprecated;

  /**
   * An array of tags associated with the object. Tags can be used to categorize or label objects for organizational purposes, making it easier to search, filter, or group related objects together. The presence of this property does not affect the validation behavior of the object itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   *
   * @remarks
   * Each tag in the array should be a string that represents a meaningful label or category for the object. It is recommended to use consistent and descriptive tags across objects to facilitate easier management and discovery of related objects.
   */
  tags?: string[];

  /**
   * An array of links associated with the object. Each link can be a string representing a URL or an object containing a `href` property and an optional `description` property.
   */
  links?: MetaLink[];
}

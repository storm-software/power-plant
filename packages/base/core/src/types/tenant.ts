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

import type { Base } from "./base";

export interface Tenant extends Base {
  /**
   * The name of the tenant.
   */
  name: string;

  /**
   * The logo of the tenant.
   */
  logo?: string;

  /**
   * The website of the tenant.
   */
  website?: string;

  /**
   * The contact email of the tenant.
   */
  email?: string;

  /**
   * The phone number of the tenant.
   */
  phone?: string;

  /**
   * The address of the tenant.
   */
  address?: string;

  /**
   * The city of the tenant.
   */
  city?: string;

  /**
   * The state of the tenant.
   */
  state?: string;

  /**
   * The country of the tenant.
   */
  country?: string;

  /**
   * The default timezone of the tenant.
   *
   * @defaultValue "UTC"
   */
  timezone: string;

  /**
   * The default currency of the tenant.
   *
   * @defaultValue "USD"
   */
  currency: string;

  /**
   * The default language of the tenant.
   *
   * @defaultValue "en-US"
   */
  language: string;
}

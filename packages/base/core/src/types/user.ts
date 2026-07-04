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

import type { Model } from "./model";
import type { Tenant } from "./tenant";

export type UserRole = "user" | "admin" | "superadmin";

export interface User extends Model {
  /**
   * The username of the user.
   */
  username: string;

  /**
   * The email of the user.
   */
  email?: string;

  /**
   * The avatar of the user.
   */
  avatar?: string;

  /**
   * The role of the user.
   *
   * @default "user"
   */
  role: UserRole;

  /**
   * The tenant the user belongs to.
   */
  tenant: Tenant;
}

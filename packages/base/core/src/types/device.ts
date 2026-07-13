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

export interface DeviceOperatingSystem {
  /**
   * The type of the operating system.
   *
   * @remarks
   * This is the type of the operating system as returned by `os.type()`.
   *
   * @see https://nodejs.org/api/os.html#ostype
   * @see https://en.wikipedia.org/wiki/Uname#Examples
   */
  type: string;

  /**
   * The release of the operating system.
   *
   * @remarks
   * This is the release of the operating system as returned by `os.release()`.
   *
   * @see https://nodejs.org/api/os.html#osrelease
   * @see https://en.wikipedia.org/wiki/Uname#Examples
   */
  release: string;
}

export interface Device extends Base {
  /**
   * The name of the device.
   *
   * @remarks
   * This is the name of the device as returned by `os.hostname()`.
   *
   * @see https://nodejs.org/api/os.html#oshostname
   * @see https://en.wikipedia.org/wiki/Uname#Examples
   */
  name: string;

  /**
   * The IP address of the device.
   */
  ip?: string;

  /**
   * The architecture of the device.
   *
   * @see https://nodejs.org/api/os.html#osarch
   * @see https://en.wikipedia.org/wiki/Uname#Examples
   */
  arch: NodeJS.Architecture;

  /**
   * The platform of the device.
   *
   * @see https://nodejs.org/api/os.html#osplatform
   * @see https://en.wikipedia.org/wiki/Uname#Examples
   */
  platform: NodeJS.Platform;

  /**
   * The operating system of the device.
   *
   * @see https://nodejs.org/api/os.html#osrelease
   * @see https://en.wikipedia.org/wiki/Uname#Examples
   */
  os: DeviceOperatingSystem;
}

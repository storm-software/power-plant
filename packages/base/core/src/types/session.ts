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

export interface SessionUserInfo {
  /**
   * The user name for the active session.
   */
  name: string;

  /**
   * The display name for the active user.
   */
  displayName: string;

  /**
   * The user's language preferences.
   */
  languagePreferences: string[];
}

export interface SessionDeviceInfo {
  /**
   * The device name for the active session.
   */
  name: string;

  /**
   * The display name for the active device.
   */
  displayName: string;

  /**
   * The platform identifier for the active device.
   */
  platform: string;

  /**
   * The OS distribution for the active device.
   */
  distro: string;

  /**
   * The desktop environment for the active device.
   */
  desktopEnv: string;

  /**
   * The CPU architecture for the active device.
   */
  cpuArch: string;
}

export interface Session {
  /**
   * A unique identifier for the session.
   */
  sessionId: string;

  /**
   * The timestamp indicating when the session started.
   */
  startedAt: Date;

  /**
   * Information about the current user.
   */
  user: SessionUserInfo;

  /**
   * Information about the current device.
   */
  device: SessionDeviceInfo;
}

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

import type { ExecutionContext } from "./context";
import type { ExecutionDocument } from "./execution";
import type { Input } from "./input";
import type { Output } from "./output";
import type { SchemaOf } from "./schema";

// eslint-disable-next-line ts/naming-convention
export interface Unstable_ExecutionContext<
  TSpec,
  TOptions extends object,
  TReturns = void
> extends ExecutionContext<TSpec, TOptions, TReturns> {
  "~spec": TSpec;
  schema: SchemaOf<TSpec, TOptions>;
  input: Input<TSpec, TOptions>;
  output: Output<TSpec, TOptions, TReturns>;
  documents: Record<string, ExecutionDocument<TSpec, TOptions>>;
}

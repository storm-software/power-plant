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

import type { OutputProps as OutputPropsExternal } from "@alloy-js/core";
import { Output as OutputExternal, ref, splitProps } from "@alloy-js/core";
import type {
  ExecutionContext as ExecutionContextCore,
  MetaConfig
} from "@power-plant/core";
import { ExecutionContext } from "../contexts/execution";
import { MetaContext } from "../contexts/meta";
import { SpecContext } from "../contexts/spec";

export interface OutputProps<
  TContext extends ExecutionContextCore<any, any, any> = ExecutionContextCore<
    any,
    any,
    any
  >
> extends Omit<OutputPropsExternal, "basePath"> {
  /**
   * The current execution context.
   */
  context: TContext;

  /**
   * The current meta context.
   */
  meta?: Record<string, MetaConfig<any, TContext["options"]>>;

  /**
   * The current specification.
   */
  spec?: TContext["spec"];
}

/**
 * Output component for rendering the execution's output files via templates.
 */
export function Output<
  TContext extends ExecutionContextCore<any, any, any> = ExecutionContextCore<
    any,
    any,
    any
  >
>(props: OutputProps<TContext>) {
  const [{ children, context, spec, meta }, rest] = splitProps(props, [
    "children",
    "context",
    "spec",
    "meta"
  ]);

  const contextRef = ref(context);
  const metaRef = ref(meta ?? {});
  const specRef = ref(spec);

  return (
    <ExecutionContext.Provider value={contextRef.value}>
      <SpecContext.Provider value={specRef.value}>
        <MetaContext.Provider value={metaRef.value}>
          <OutputExternal {...rest} basePath={contextRef.value.cwd}>
            {children}
          </OutputExternal>
        </MetaContext.Provider>
      </SpecContext.Provider>
    </ExecutionContext.Provider>
  );
}

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

import type { Children } from "@alloy-js/core";
import { For, Indent, Show } from "@alloy-js/core";
import type { TypeParameterDescriptor } from "@alloy-js/typescript";
import { TypeRefContext } from "@alloy-js/typescript";

/** Props for type parameters */
export interface TypeParametersProps {
  /** Parameters */
  parameters?: TypeParameterDescriptor[] | string[];
  /** Jsx Children */
  children?: Children;
}

function typeParameter(param: TypeParameterDescriptor | string) {
  return (
    <Show when={typeof param === "object"} fallback={<>{param}</>}>
      <group>
        {(param as TypeParameterDescriptor).name}
        <Show when={!!(param as TypeParameterDescriptor).extends}>
          {" "}
          extends
          <indent>
            {" "}
            <TypeRefContext>
              {(param as TypeParameterDescriptor).extends}
            </TypeRefContext>
          </indent>
        </Show>
        <Show when={!!(param as TypeParameterDescriptor).default}>
          {" = "}
          <TypeRefContext>
            {(param as TypeParameterDescriptor).default}
          </TypeRefContext>
        </Show>
      </group>{" "}
    </Show>
  );
}

/**
 * Represent type parameters
 *
 * @example
 * ```ts
 * <A, B extends string>
 * ```
 */
export function TypeParameters(props: TypeParametersProps) {
  if (props.children) {
    return props.children;
  }

  if (!props.parameters) {
    return undefined;
  }

  return (
    <>
      {"<"}
      <group>
        <Indent softline>
          <For each={props.parameters} comma line>
            {param => typeParameter(param)}
          </For>
          <ifBreak>,</ifBreak>
        </Indent>
      </group>
      {">"}
    </>
  );
}

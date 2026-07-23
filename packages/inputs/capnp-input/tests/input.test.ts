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

import { capnpSchema } from "@power-plant/capnp-schema";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { capnpcMock, resolveOptionsMock } = vi.hoisted(() => ({
  capnpcMock: vi.fn(),
  resolveOptionsMock: vi.fn()
}));

vi.mock("@stryke/capnp/compile", () => ({
  capnpc: capnpcMock
}));

vi.mock("@stryke/capnp/helpers", () => ({
  resolveOptions: resolveOptionsMock
}));

vi.mock("@power-plant/core", async importOriginal => {
  const actual = await importOriginal<typeof import("@power-plant/core")>();

  return {
    ...actual,
    useExecution: () => ({
      cwd: process.cwd()
    })
  };
});

const { input } = await import("../src/input");
const { toAbsolutePath, toCapnpSchema, toTypeId } =
  await import("../src/utilities");

const fixturePath = fileURLToPath(
  new URL("./fixtures/addressbook.capnp", import.meta.url)
);

function createMockCapnpcResult() {
  const personId = 0x8a1f_1234_5678_9abcn;
  const addressBookId = 0x8a1f_1234_5678_9abdn;
  const phoneNumberId = 0x8a1f_1234_5678_9aben;
  const fileId = 0xdbb9_ad1f_14bf_0b36n;

  const makeList = <T>(items: T[]) => ({
    length: items.length,
    at: (index: number) => items[index]!
  });

  const nameField = {
    name: "name",
    codeOrder: 0,
    discriminantValue: 0xffff,
    ordinal: { _isExplicit: true, explicit: 0 },
    _isGroup: false,
    slot: {
      type: {
        which: () => 12,
        list: { elementType: null },
        enum: { typeId: 0n },
        struct: { typeId: 0n },
        interface: { typeId: 0n }
      },
      hadExplicitDefault: false
    },
    group: { typeId: 0n }
  };

  const emailField = {
    ...nameField,
    name: "email",
    codeOrder: 1,
    ordinal: { _isExplicit: true, explicit: 1 }
  };

  const phonesField = {
    ...nameField,
    name: "phones",
    codeOrder: 2,
    ordinal: { _isExplicit: true, explicit: 2 },
    slot: {
      type: {
        which: () => 14,
        list: {
          elementType: {
            which: () => 16,
            list: { elementType: null },
            enum: { typeId: 0n },
            struct: { typeId: phoneNumberId },
            interface: { typeId: 0n }
          }
        },
        enum: { typeId: 0n },
        struct: { typeId: 0n },
        interface: { typeId: 0n }
      },
      hadExplicitDefault: false
    }
  };

  const employmentField = {
    name: "employment",
    codeOrder: 3,
    discriminantValue: 0xffff,
    ordinal: { _isExplicit: true, explicit: 3 },
    _isGroup: true,
    slot: nameField.slot,
    group: { typeId: 0x8a1f_1234_5678_9abfn }
  };

  const personNode = {
    id: personId,
    displayName: "addressbook.capnp:Person",
    displayNamePrefixLength: "addressbook.capnp:".length,
    _isFile: false,
    _isStruct: true,
    _isEnum: false,
    _isInterface: false,
    _isConst: false,
    _isAnnotation: false,
    parameters: makeList([]),
    nestedNodes: makeList([{ name: "PhoneNumber", id: phoneNumberId }]),
    struct: {
      isGroup: false,
      discriminantCount: 0,
      dataWordCount: 0,
      pointerCount: 3,
      fields: makeList([nameField, emailField, phonesField, employmentField])
    },
    enum: { enumerants: makeList([]) },
    interface: { methods: makeList([]), superclasses: makeList([]) },
    const: { type: nameField.slot.type },
    annotation: {
      type: nameField.slot.type,
      targetsFile: false,
      targetsConst: false,
      targetsEnum: false,
      targetsEnumerant: false,
      targetsStruct: false,
      targetsField: false,
      targetsUnion: false,
      targetsGroup: false,
      targetsInterface: false,
      targetsMethod: false,
      targetsParam: false,
      targetsAnnotation: false
    }
  };

  const phoneNumberNode = {
    ...personNode,
    id: phoneNumberId,
    displayName: "addressbook.capnp:Person.PhoneNumber",
    displayNamePrefixLength: "addressbook.capnp:Person.".length,
    nestedNodes: makeList([]),
    struct: {
      isGroup: false,
      discriminantCount: 0,
      dataWordCount: 0,
      pointerCount: 1,
      fields: makeList([
        {
          ...nameField,
          name: "number"
        }
      ])
    }
  };

  const addressBookNode = {
    ...personNode,
    id: addressBookId,
    displayName: "addressbook.capnp:AddressBook",
    nestedNodes: makeList([]),
    struct: {
      isGroup: false,
      discriminantCount: 0,
      dataWordCount: 0,
      pointerCount: 1,
      fields: makeList([
        {
          ...phonesField,
          name: "people",
          ordinal: { _isExplicit: true, explicit: 0 },
          slot: {
            type: {
              which: () => 14,
              list: {
                elementType: {
                  which: () => 16,
                  list: { elementType: null },
                  enum: { typeId: 0n },
                  struct: { typeId: personId },
                  interface: { typeId: 0n }
                }
              },
              enum: { typeId: 0n },
              struct: { typeId: 0n },
              interface: { typeId: 0n }
            },
            hadExplicitDefault: false
          }
        }
      ])
    }
  };

  const fileNode = {
    ...personNode,
    id: fileId,
    displayName: fixturePath,
    displayNamePrefixLength: 0,
    _isFile: true,
    _isStruct: false,
    nestedNodes: makeList([
      { name: "Person", id: personId },
      { name: "AddressBook", id: addressBookId }
    ]),
    struct: {
      isGroup: false,
      discriminantCount: 0,
      dataWordCount: 0,
      pointerCount: 0,
      fields: makeList([])
    }
  };

  return {
    ctx: {
      files: [
        {
          nodes: [fileNode, personNode, phoneNumberNode, addressBookNode],
          imports: makeList([]),
          tsPath: "addressbook.ts",
          file: { filename: fixturePath }
        }
      ]
    },
    files: new Map([["addressbook.ts", "export class Person {}"]])
  };
}

describe("toAbsolutePath", () => {
  it("resolves relative paths against cwd", () => {
    expect(toAbsolutePath("./schema.capnp", "/tmp")).toBe("/tmp/schema.capnp");
  });

  it("keeps absolute paths unchanged", () => {
    expect(toAbsolutePath("/abs/schema.capnp", "/tmp")).toBe(
      "/abs/schema.capnp"
    );
  });
});

describe("toTypeId", () => {
  it("formats bigint ids as hex", () => {
    expect(toTypeId(0xdbb9ad1f14bf0b36n)).toBe("0xdbb9ad1f14bf0b36");
  });
});

describe("toCapnpSchema", () => {
  it("maps capnpc nodes into a Cap'n Proto schema document", () => {
    const document = toCapnpSchema(createMockCapnpcResult() as never);

    expect(capnpSchema.safeParse(document).success).toBe(true);
    expect(document.files[0]?.structs.map(struct => struct.name)).toEqual(
      expect.arrayContaining(["Person", "AddressBook", "PhoneNumber"])
    );

    const person = document.files[0]?.structs.find(
      struct => struct.name === "Person"
    );
    expect(person?.fields.map(field => field.name)).toEqual(
      expect.arrayContaining(["name", "email", "phones", "employment"])
    );
    expect(person?.fields.find(field => field.name === "employment")?.kind).toBe(
      "group"
    );
  });
});

describe("input", () => {
  beforeEach(() => {
    resolveOptionsMock.mockReset();
    capnpcMock.mockReset();
  });

  it("loads a Cap'n Proto schema file into a schema document via capnpc", async () => {
    resolveOptionsMock.mockResolvedValue({
      schemas: [fixturePath],
      output: "/tmp/out",
      projectRoot: process.cwd(),
      workspaceRoot: process.cwd(),
      ts: true,
      importPath: [],
      tsconfig: {}
    });
    capnpcMock.mockResolvedValue(createMockCapnpcResult());

    const document = await input({
      inputPath: fixturePath,
      tsconfigPath: fileURLToPath(new URL("../tsconfig.json", import.meta.url))
    });

    expect(resolveOptionsMock).toHaveBeenCalled();
    expect(capnpcMock).toHaveBeenCalled();
    expect(capnpSchema.safeParse(document).success).toBe(true);
    expect(document.files.flatMap(file => file.structs).map(s => s.name)).toEqual(
      expect.arrayContaining(["Person", "AddressBook", "PhoneNumber"])
    );
  });

  it("wraps load failures with a descriptive error", async () => {
    await expect(
      input({
        inputPath: fileURLToPath(
          new URL("./fixtures/missing.capnp", import.meta.url)
        )
      })
    ).rejects.toThrow(/Failed to load Cap'n Proto schema from/);
  });
});

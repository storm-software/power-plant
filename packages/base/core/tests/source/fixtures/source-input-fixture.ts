export type SourceFixtureSpec = {
  enabled: boolean;
  name: string;
};

export const spec: SourceFixtureSpec = {
  enabled: true,
  name: "fixture"
};

export async function fromParams(name: string): Promise<SourceFixtureSpec> {
  return {
    enabled: true,
    name
  };
}

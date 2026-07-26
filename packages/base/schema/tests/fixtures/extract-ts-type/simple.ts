/** Display name for a user. */
export type UserName = string;

/** A user record. */
export interface User {
  /** User id. */
  id: string;
  /** User display name. */
  name: UserName;
  /** Optional age in years. */
  age?: number;
}

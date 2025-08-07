/* src/types/db-helpers.ts */
export type Override<Base, Patch> = Omit<Base, keyof Patch> & Patch; // keeps all other columns

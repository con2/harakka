/**
 * Make all fields of a type non-nullable
 * Useful for supabase Views which make all fields nullable by default
 * Read more in the docs
 */
export type StripNull<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export type StripNullFrom<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: NonNullable<T[P]>;
};
# Helper Types

## StripNull<T>

This is useful for views particularly, since supabase treat all fields of views as optional. Using `StripNull`, all fields will once again be **required**.

```ts
export type StripNull<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};
```

### Usage

```ts
/* Create type from supabase view. 
* All fields of the view are nullable by default */
export type BookingUserView =
  Database["public"]["Views"]["view_bookings_with_user_info"];
export type BookingUserViewRow = BookingUserView["Row"];

// Create a type which is non-nullable
export type BookingPreview = StripNull<BookingUserViewRow>;
```

### Caveats
If you wish to keep ***some*** fields nullable, you first need to **Omit** them, and re-apply them as such
```ts
type BookingRequired = Omit<StripNull<BookingPreview>, 'email' | 'payment_status'> & {
  email: string | null;
  payment_status: string | null;
};
```
Meaning, we remove them from the stripped type, and add them as nullable types

## StripNullFrom<T, K>
If you have a nullable type and wish to keep ***most*** fields nullable, but some fields not, you can
```ts
type StripNullFrom<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: NonNullable<T[P]>;
};
```

## Usage
```ts
/**
 * Keep most fields nullable, except for a select few.
 */
type BookingWithSomeRequired = StripNullFrom<BookingPreview, 'booking_number' | 'id' | 'status'>;
```
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  NotAcceptableException,
} from "@nestjs/common";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Maps a Supabase {@link PostgrestError} to an appropriate NestJS `HttpException`
 * so controllers/services can consistently surface proper HTTP status codes
 * and payload structures to the frontend.
 *
 * @param error  The raw Postgrest error returned by Supabase
 *
 * @throws HttpException matching the error category; never returns.
 *
 * @example
 * ```ts
 * // In a NestJS service (no local try/catch needed)
 * const { data, error } = await supabase
 *   .from("organization_items")
 *   .insert(item)
 *   .select("*")
 *   .single();
 *
 * if (error) handleSupabaseError(error);
 *
 * return data; // success
 * ```
 */
export function handleSupabaseError(error: PostgrestError): never {
  // Most common Postgres / PostgREST error codes we care about
  // https://www.postgresql.org/docs/current/errcodes-appendix.html
  // https://postgrest.org/en/stable/errors.html
  switch (error.code) {
    case "23505": // unique_violation
      throw new ConflictException({
        success: false,
        message: error.message,
        code: error.code,
      });

    case "23503": // foreign_key_violation
      throw new BadRequestException({
        success: false,
        message: error.message,
        code: error.code,
      });

    case "23502": // not_null_violation
      throw new BadRequestException({
        success: false,
        message: error.message,
        code: error.code,
      });

    case "22P02": // invalid_text_representation (e.g., bad UUID)
    case "PGRST100": // PostgREST invalid input
      throw new BadRequestException({
        success: false,
        message: error.message,
        code: error.code,
      });

    case "PGRST202": // Function or resource not found in schema cache (HTTP 404)
      throw new NotFoundException({
        success: false,
        message: error.message,
        code: error.code,
      });

    case "404": // Some clients surface string "404"
      throw new NotFoundException({
        success: false,
        message: error.message,
        code: error.code,
      });

    case "PGRST116": // Singular response expected exactly one row (HTTP 406)
      throw new NotAcceptableException({
        success: false,
        message: error.message,
        code: error.code,
      });

    case "42501": // insufficient_privilege
    case "PGRST128": // PostgREST permission denied
      throw new ForbiddenException({
        success: false,
        message: error.message,
        code: error.code,
      });

    default:
      // Fallback – treat anything else as an internal server error
      throw new InternalServerErrorException({
        success: false,
        message: error.message,
        code: error.code,
      });
  }
}

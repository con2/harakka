import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  NotAcceptableException,
} from "@nestjs/common";
import { PostgrestError } from "@supabase/supabase-js";
import { StorageError } from "@supabase/storage-js";

/**
 * Maps a Supabase {@link PostgrestError} or {@link StorageError} to an appropriate NestJS `HttpException`
 * so controllers/services can consistently surface proper HTTP status codes
 * and payload structures to the frontend.
 *
 * This utility supports both Supabase PostgREST errors (database/table operations)
 * and Supabase Storage errors (file/bucket operations). It inspects the error type
 * and throws a matching NestJS exception for consistent API error handling.
 *
 * @param error The raw error returned by Supabase (PostgrestError or StorageError)
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
 * @example
 * ```ts
 * // Handling Supabase Storage errors
 * const { data, error } = await supabase.storage
 *   .from("bucket")
 *   .upload("path/file.png", fileBuffer);
 *
 * if (error) handleSupabaseError(error);
 *
 * return data; // success
 * ```
 */

export function handleSupabaseError(
  error: PostgrestError | StorageError,
): never {
  // Handle StorageError (has statusCode property)
  if ("statusCode" in error) {
    switch (error.statusCode) {
      case "404":
      case 404:
        throw new NotFoundException({
          success: false,
          message: error.message,
          code: error.statusCode,
        });
      case "401":
      case 401:
        throw new ForbiddenException({
          success: false,
          message: error.message,
          code: error.statusCode,
        });
      case "400":
      case 400:
        throw new BadRequestException({
          success: false,
          message: error.message,
          code: error.statusCode,
        });
      default:
        throw new InternalServerErrorException({
          success: false,
          message: error.message,
          code: error.statusCode,
        });
    }
  }

  // Handle PostgrestError
  // Most common Postgres / PostgREST error codes we care about
  // https://www.postgresql.org/docs/current/errcodes-appendix.html
  // https://postgrest.org/en/stable/errors.html
  const pgError = error as PostgrestError;
  switch (pgError.code) {
    case "42P01": // undefined_table (e.g., missing view/table)
      throw new NotFoundException({
        success: false,
        message:
          pgError.message ||
          "Database object not found (did you run latest migrations?)",
        code: pgError.code,
      });
    case "23505": // unique_violation
      throw new ConflictException({
        success: false,
        message: pgError.message,
        code: pgError.code,
      });

    case "23503": // foreign_key_violation
      throw new BadRequestException({
        success: false,
        message: pgError.message,
        code: pgError.code,
      });

    case "23502": // not_null_violation
      throw new BadRequestException({
        success: false,
        message: pgError.message,
        code: pgError.code,
      });

    case "22P02": // invalid_text_representation (e.g., bad UUID)
    case "PGRST100": // PostgREST invalid input
      throw new BadRequestException({
        success: false,
        message: pgError.message,
        code: pgError.code,
      });

    case "PGRST202": // Function or resource not found in schema cache (HTTP 404)
      throw new NotFoundException({
        success: false,
        message: pgError.message,
        code: pgError.code,
      });

    case "404": // Some clients surface string "404"
      throw new NotFoundException({
        success: false,
        message: pgError.message,
        code: pgError.code,
      });

    case "PGRST116": // Singular response expected exactly one row (HTTP 406)
      throw new NotAcceptableException({
        success: false,
        message: pgError.message,
        code: pgError.code,
      });

    case "42501": // insufficient_privilege
    case "PGRST128": // PostgREST permission denied
      throw new ForbiddenException({
        success: false,
        message: pgError.message,
        code: pgError.code,
      });

    default:
      // Fallback – treat anything else as an internal server error
      throw new InternalServerErrorException({
        success: false,
        message: pgError.message,
        code: pgError.code,
      });
  }
}

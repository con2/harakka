import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  NotAcceptableException,
} from "@nestjs/common";
import { PostgrestError } from "@supabase/supabase-js";
import { StorageError } from "@supabase/storage-js";

const GENERIC_ERROR_MESSAGES = {
  badRequest: "Invalid request.",
  conflict: "Resource already exists.",
  forbidden: "You do not have permission to perform this action.",
  internal: "Unexpected server error. Please try again later.",
  notAcceptable: "Request cannot be fulfilled.",
  notFound: "Resource not found.",
} as const;

type GenericMessageKey = keyof typeof GENERIC_ERROR_MESSAGES;

const logger = new Logger("SupabaseErrorHandler");

function isProductionEnvironment(): boolean {
  return (process.env.NODE_ENV || "").toLowerCase() === "production";
}

function getClientMessage(
  detailedMessage: string,
  fallbackKey: GenericMessageKey,
): string {
  const fallback = GENERIC_ERROR_MESSAGES[fallbackKey];
  const message = detailedMessage?.trim() ? detailedMessage : fallback;
  return isProductionEnvironment() ? fallback : message;
}

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
    logger.error({
      context: "SupabaseStorageError",
      statusCode: error.statusCode,
      message: error.message,
      details: error,
    });
    switch (error.statusCode) {
      case "404":
      case 404:
        throw new NotFoundException({
          success: false,
          message: getClientMessage(error.message, "notFound"),
          code: error.statusCode,
        });
      case "401":
      case 401:
        throw new ForbiddenException({
          success: false,
          message: getClientMessage(error.message, "forbidden"),
          code: error.statusCode,
        });
      case "400":
      case 400:
        throw new BadRequestException({
          success: false,
          message: getClientMessage(error.message, "badRequest"),
          code: error.statusCode,
        });
      default:
        throw new InternalServerErrorException({
          success: false,
          message: getClientMessage(error.message, "internal"),
          code: error.statusCode,
        });
    }
  }

  // Handle PostgrestError
  // Most common Postgres / PostgREST error codes we care about
  // https://www.postgresql.org/docs/current/errcodes-appendix.html
  // https://postgrest.org/en/stable/errors.html
  const pgError = error as PostgrestError;
  logger.error({
    context: "SupabasePostgrestError",
    code: pgError.code,
    message: pgError.message,
    details: pgError,
  });
  switch (pgError.code) {
    case "42P01": // undefined_table (e.g., missing view/table)
      throw new NotFoundException({
        success: false,
        message: getClientMessage(
          pgError.message ||
            "Database object not found (did you run latest migrations?)",
          "notFound",
        ),
        code: pgError.code,
      });
    case "23505": // unique_violation
      throw new ConflictException({
        success: false,
        message: getClientMessage(pgError.message, "conflict"),
        code: pgError.code,
      });

    case "23503": // foreign_key_violation
      throw new BadRequestException({
        success: false,
        message: getClientMessage(pgError.message, "badRequest"),
        code: pgError.code,
      });

    case "23502": // not_null_violation
      throw new BadRequestException({
        success: false,
        message: getClientMessage(pgError.message, "badRequest"),
        code: pgError.code,
      });

    case "22P02": // invalid_text_representation (e.g., bad UUID)
    case "PGRST100": // PostgREST invalid input
      throw new BadRequestException({
        success: false,
        message: getClientMessage(pgError.message, "badRequest"),
        code: pgError.code,
      });

    case "42703": // undefined_column (likely schema drift)
    case "42601": // syntax_error
      throw new InternalServerErrorException({
        success: false,
        message: getClientMessage(pgError.message, "internal"),
        code: pgError.code,
      });

    case "PGRST202": // Function or resource not found in schema cache (HTTP 404)
      throw new NotFoundException({
        success: false,
        message: getClientMessage(pgError.message, "notFound"),
        code: pgError.code,
      });

    case "404": // Some clients surface string "404"
      throw new NotFoundException({
        success: false,
        message: getClientMessage(pgError.message, "notFound"),
        code: pgError.code,
      });

    case "PGRST116": // Singular response expected exactly one row (HTTP 406)
      throw new NotAcceptableException({
        success: false,
        message: getClientMessage(pgError.message, "notAcceptable"),
        code: pgError.code,
      });

    case "42501": // insufficient_privilege
    case "PGRST128": // PostgREST permission denied
      throw new ForbiddenException({
        success: false,
        message: getClientMessage(pgError.message, "forbidden"),
        code: pgError.code,
      });

    default:
      // Fallback – treat anything else as an internal server error
      throw new InternalServerErrorException({
        success: false,
        message: getClientMessage(pgError.message, "internal"),
        code: pgError.code,
      });
  }
}

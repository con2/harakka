import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { handleSupabaseError } from "./handleError.utils";

describe("handleSupabaseError client messaging", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it("preserves detailed messages outside production", () => {
    expect.assertions(3);
    process.env.NODE_ENV = "development";

    const error = {
      code: "23505",
      message: "Detailed unique violation",
    } as any;

    try {
      handleSupabaseError(error);
    } catch (caught) {
      expect(caught).toBeInstanceOf(ConflictException);
      expect(caught.getStatus()).toBe(409);
      expect(caught.getResponse()).toMatchObject({
        message: "Detailed unique violation",
        code: "23505",
      });
    }
  });

  it("sanitizes messages in production", () => {
    expect.assertions(3);
    process.env.NODE_ENV = "production";

    const error = {
      code: "23505",
      message: "Detailed unique violation",
    } as any;

    try {
      handleSupabaseError(error);
    } catch (caught) {
      expect(caught).toBeInstanceOf(ConflictException);
      expect(caught.getStatus()).toBe(409);
      expect(caught.getResponse()).toMatchObject({
        message: "Resource already exists.",
        code: "23505",
      });
    }
  });

  it("falls back to generic copy when Supabase omits the message", () => {
    expect.assertions(3);
    delete process.env.NODE_ENV;

    const error = {
      statusCode: 404,
      message: "",
      name: "StorageError",
    } as any;

    try {
      handleSupabaseError(error);
    } catch (caught) {
      expect(caught).toBeInstanceOf(NotFoundException);
      expect(caught.getStatus()).toBe(404);
      expect(caught.getResponse()).toMatchObject({
        message: "Resource not found.",
        code: 404,
      });
    }
  });

  it("maps SQL syntax issues to internal errors while hiding details in production", () => {
    expect.assertions(3);
    process.env.NODE_ENV = "production";

    const error = {
      code: "42601",
      message: "syntax error at or near \"FROMM\"",
    } as any;

    try {
      handleSupabaseError(error);
    } catch (caught) {
      expect(caught).toBeInstanceOf(InternalServerErrorException);
      expect(caught.getStatus()).toBe(500);
      expect(caught.getResponse()).toMatchObject({
        message: "Unexpected server error. Please try again later.",
        code: "42601",
      });
    }
  });

  it("keeps undefined column details available to developers", () => {
    expect.assertions(3);
    process.env.NODE_ENV = "development";

    const error = {
      code: "42703",
      message: "column \"profile_name\" does not exist",
    } as any;

    try {
      handleSupabaseError(error);
    } catch (caught) {
      expect(caught).toBeInstanceOf(InternalServerErrorException);
      expect(caught.getStatus()).toBe(500);
      expect(caught.getResponse()).toMatchObject({
        message: "column \"profile_name\" does not exist",
        code: "42703",
      });
    }
  });

  it("logs detailed error but emits override message in production", () => {
    expect.assertions(4);
    process.env.NODE_ENV = "production";
    const loggerSpy = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation(() => undefined);

    const error = {
      code: "23503",
      message: "violates foreign key constraint",
    } as any;

    try {
      handleSupabaseError(error, {
        messageOverrides: { badRequest: "Could not create booking-item" },
        loggerContext: { route: "POST /bookings" },
      });
    } catch (caught) {
      expect(caught).toBeInstanceOf(BadRequestException);
      expect(caught.getStatus()).toBe(400);
      expect(caught.getResponse()).toMatchObject({
        message: "Could not create booking-item",
        code: "23503",
      });
    }

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        context: "SupabasePostgrestError",
        code: "23503",
        message: "violates foreign key constraint",
        route: "POST /bookings",
      }),
    );

    loggerSpy.mockRestore();
  });

  it("ignores override outside production to keep detailed messages", () => {
    expect.assertions(4);
    process.env.NODE_ENV = "development";
    const loggerSpy = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation(() => undefined);

    const error = {
      code: "23503",
      message: "violates foreign key constraint",
    } as any;

    try {
      handleSupabaseError(error, {
        messageOverrides: { badRequest: "Could not create booking-item" },
      });
    } catch (caught) {
      expect(caught).toBeInstanceOf(BadRequestException);
      expect(caught.getStatus()).toBe(400);
      expect(caught.getResponse()).toMatchObject({
        message: "violates foreign key constraint",
        code: "23503",
      });
    }

    expect(loggerSpy).toHaveBeenCalled();
    loggerSpy.mockRestore();
  });
});

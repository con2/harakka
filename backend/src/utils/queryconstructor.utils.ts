import { Logger } from "@nestjs/common";
import { PostgrestResponse, SupabaseClient } from "@supabase/supabase-js";
import { getPaginationRange } from "./pagination";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { GenericSchema } from "@supabase/postgrest-js/dist/cjs/types";
import { ColumnMeta, Eq, Filter } from "src/types/queryconstructor.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const logger = new Logger("QueryConstructorUtils");

/**
 * Get rows of X table that matches your desired constraints.
 * @param supabase The client the query should be done using
 * @param tableName Name of the table to get data from
 * @param select What columns to retrieve. Default all.
 * @param page What page to retrieve. Default 1.
 * @param limit How many rows to retrieve. Default 10.
 * @param ascending Get data in ascending or descending order. Default ascending (a-z)
 * @param order Optional. What columns to order data by. Must be a valid column of the table.
 * @param eq Optional. Get only data that matches certain columns. Can be an array of key/value pairs.
 * @returns An API response which the matching data
 */
export function queryConstructor(
  supabase: SupabaseClient,
  table_name: string,
  select: string = "*",
  eq?: Eq | Eq[],
  page: number = 1,
  limit: number = 10,
  ascending: boolean = true,
  order?: string,
) {
  const { from, to } = getPaginationRange(page, limit);
  const query = supabase
    .from(table_name)
    .select(select as "*", { count: "exact" })
    .range(from, to);

  if (eq) {
    if ("length" in eq) {
      for (const pair of eq) {
        query.eq(pair.column, pair.value);
      }
    } else query.eq(eq.column, eq.value);
  }

  if (order) query.order(order, { ascending: ascending });

  return query;
}

export async function getColumnData(
  supabase: SupabaseClient,
  tableName: string,
) {
  const result: PostgrestResponse<ColumnMeta> = await supabase.rpc(
    "get_table_columns",
    {
      input_table_name: tableName,
    },
  );
  if (result.error) logger.error("Failed to get table columns", result.error);
  return result.data;
}

export function getFilterType(column: ColumnMeta) {
  const type = column.data_type.toLowerCase();

  if (type === "uuid") {
    return "uuid_search";
  }
  if (type === "json" || type === "jsonb") {
    return "skip_search";
  }
  if (type.includes("character") || type === "text") {
    return "text_search";
  }
  if (
    [
      "integer",
      "bigint",
      "numeric",
      "double precision",
      "real",
      "smallint",
    ].includes(type)
  ) {
    return "number_search";
  }
  if (type.includes("timestamp") || type.includes("date")) {
    return "date_search";
  }
  if (type === "boolean") {
    return "boolean_search";
  }

  return "exact_search";
}

export function applySearchAcrossColumns<
  S extends GenericSchema = any,
  Row extends Record<string, unknown> = any,
  Result = Row,
  RelationName = unknown,
>(
  query: PostgrestFilterBuilder<any, S, Row, Result, RelationName>,
  filters: Filter[],
  search: string,
) {
  if (!search) return query;

  const conditions: string[] = [];

  for (const { column, type } of filters) {
    if (type === "skip_search") continue;
    switch (type) {
      case "uuid_search":
        break;

      case "number_search":
        if (!isNaN(Number(search))) {
          conditions.push(`${column}.eq.${Number(search)}`);
        }
        break;

      case "text_search":
        conditions.push(`${column}.ilike.*${search}*`);
        break;

      case "date_search":
        if (!isNaN(Date.parse(search))) {
          conditions.push(`${column}.eq.${encodeURIComponent(search)}`);
        }
        break;

      case "boolean_search":
        if (search === "true" || search === "false") {
          conditions.push(`${column}.eq.${search}`);
        }
        break;

      case "exact_search":
        conditions.push(`${column}.eq.${encodeURIComponent(search)}`);
        break;
    }
  }

  if (conditions.length > 0) {
    query = query.or(conditions.join(","));
  }

  return query;
}

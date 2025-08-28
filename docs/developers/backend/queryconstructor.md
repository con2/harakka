# Query Constructor

## What it is

A function that accepts a range of params, and returns only the table rows which match the criteria.

## Params

- **supabase:** The client the query should be done using
- **tableName:** Name of the table to get data from
- **select:** What columns to retrieve. Default all.
- **page:** What page to retrieve. Default 1.
- **limit:** How many rows to retrieve. Default 10.
- **ascending:** Get data in ascending or descending order. Default ascending (a-z)
- **order:** Optional. What columns to order data by. Must be a valid column of the table.
- **eq:** Optional. Get only data that matches certain columns. Can be an array of key/value pairs.

## Usage
```js
 async getOrderedStorageItems(
    tableName: string,
    select: string = "*",
    page: number = 1,
    limit: number = 10,
    ascending: boolean = true,
    order?: string,
    searchquery?: string,
    eq?: Eq | Eq[],
  ) {
    const supabase = this.supabaseClient.getServiceClient();
    const query = getOrderedTableRows(
      supabase,
      tableName,
      select,
      page,
      limit,
      ascending,
      order,
      eq,
    );

    // This cannot be used in the utility because of the async.
    // Using the applySearchAcrossColumns allows the searchquery to be searched for any data type.
    if (searchquery) {
      const columnData = await getColumnData(supabase, tableName);
      const filters: Filter[] = columnData!.map((col) => ({
        column: col.column_name,
        type: getFilterType(col),
      }));
      applySearchAcrossColumns(query, filters, searchquery);

      // Add custom search for json structures
      query.or(
        `fi_item_name.ilike.%${searchquery}%,` +
          `fi_item_type.ilike.%${searchquery}%,` +
          `location_name.ilike.%${searchquery}%`,
      );
    }

    const result = await query;
    const pagination_meta = getPaginationMeta(result.count, page, limit);
    return { ...result, metadata: pagination_meta };
  }
  ```

  ## Helpers
  1. **getColumnData** gets the column name and data type of a table
  2. **getFilterType** is used to tell the `applySearchAcrossColumns` how the search query should be structured
  3. **applySearchAcrossColumns** allows a search value that, if applicable, to search the column given.


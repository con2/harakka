import React, { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllAdminItems,
  selectAllItems,
  selectItemsError,
  selectItemsLoading,
} from "@/store/slices/itemsSlice";
import { LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CSVLink } from "react-csv";
import { itemsApi } from "@/api/services/items";

type FlattenedItem = Record<string, string>;

const flattenValue = (
  value: unknown,
  prefix: string,
  acc: FlattenedItem,
): void => {
  if (value === null || value === undefined) {
    if (prefix) {
      acc[prefix] = "";
    }
    return;
  }

  if (Array.isArray(value)) {
    if (!prefix) {
      value.forEach((item, index) => {
        flattenValue(item, `[${index}]`, acc);
      });
      return;
    }

    if (value.length === 0) {
      acc[prefix] = "";
      return;
    }

    value.forEach((item, index) => {
      if (typeof item === "object" && item !== null) {
        Object.entries(item).forEach(([key, nestedValue]) => {
          flattenValue(nestedValue, `${prefix}[${index}].${key}`, acc);
        });
      } else {
        flattenValue(item, `${prefix}[${index}]`, acc);
      }
    });
    return;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);

    if (entries.length === 0) {
      if (prefix) {
        acc[prefix] = "";
      }
      return;
    }

    entries.forEach(([key, nestedValue]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      flattenValue(nestedValue, nextPrefix, acc);
    });
    return;
  }

  if (prefix) {
    acc[prefix] = serializeValue(value);
  }
};

const flattenItem = (item: Record<string, unknown>): FlattenedItem => {
  const acc: FlattenedItem = {};
  flattenValue(item, "", acc);

  // Rename specific keys
  if (acc["translations.en.item_description"]) {
    acc["en_item_description"] = acc["translations.en.item_description"];
    delete acc["translations.en.item_description"];
  }
  if (acc["translations.fi.item_description"]) {
    acc["fi_item_description"] = acc["translations.fi.item_description"];
    delete acc["translations.fi.item_description"];
  }

  return acc;
};

const serializeValue = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  if (typeof value === "symbol") {
    return value.description ?? value.toString();
  }

  return JSON.stringify(value);
};

const Reports: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<
    Record<string, number>
  >({});

  const handleFetchReport = async () => {
    setIsFetching(true);

    try {
      // 1. Fetch all admin items and wait for the state to update
      const adminItemsResponse = await dispatch(
        fetchAllAdminItems({
          page: 1,
          limit: Number.MAX_SAFE_INTEGER,
          searchquery: searchTerm || undefined,
        }),
      ).unwrap();

      // 2. Collect item IDs from the updated items state
      const itemIds = adminItemsResponse.data
        ? adminItemsResponse.data.map((item) => item.id)
        : [];

      // 3. Fetch availability data for the collected item IDs
      const now = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
      const availabilityResponse = await itemsApi.getAvailabilityOverview({
        startDate: now,
        endDate: now,
        itemIds,
      });

      // 4. Update availability data state
      if (availabilityResponse.data) {
        const availabilityMap: Record<string, number> = {};
        availabilityResponse.data.forEach((item) => {
          availabilityMap[item.item_id] = item.availableQuantity;
        });
        setAvailabilityData(availabilityMap);
      }
    } catch (err) {
      console.error("Failed to fetch report data", err);
    } finally {
      setIsFetching(false);
    }
  };

  const flattenedItems = useMemo(() => {
    if (!items.length) {
      return [];
    }
    return items.map((item, index) => ({
      RowNumber: (index + 1).toString(), // Add a numeration column
      ...flattenItem(item as Record<string, unknown>),
      available_quantity: availabilityData[item.id]?.toString() || "0", // Use fetched availability data
    }));
  }, [items, availabilityData]);

  const csvHeaders = useMemo(() => {
    // Define the desired column order
    const desiredOrder = [
      "RowNumber",
      "en_item_name",
      "en_item_description",
      "fi_item_name",
      "fi_item_description",
      "quantity",
      "available_quantity",
      "category_en_name",
      "category_fi_name",
      "is_active",
      "location_name",
      "placement_description",
      "id",
      "created_at",
      "updated_at",
    ];

    // Ensure only columns present in the flattened items are included
    const headerSet = new Set<string>();
    flattenedItems.forEach((item) => {
      Object.keys(item).forEach((key) => headerSet.add(key));
    });

    // Filter and order headers based on the desired order
    const reorderedHeaders = desiredOrder.filter((key) => headerSet.has(key));

    return reorderedHeaders.map((key) => ({ label: key, key }));
  }, [flattenedItems]);

  const hasData = flattenedItems.length > 0 && csvHeaders.length > 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Items Report</h1>

      <div className="flex items-center justify-between">
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
        <button
          onClick={handleFetchReport}
          className="ml-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          disabled={isFetching}
        >
          {isFetching ? "Fetching..." : "Fetch Report"}
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <LoaderCircle className="animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-destructive">{error}</div>
        ) : hasData ? (
          <CSVLink
            data={flattenedItems}
            headers={csvHeaders}
            filename="items_report.csv"
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Download CSV
          </CSVLink>
        ) : (
          <div className="p-4">No data available to download.</div>
        )}
      </div>
    </div>
  );
};

export default Reports;

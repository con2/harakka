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

    const isPrimitiveArray = value.every(
      (item) =>
        item === null ||
        item === undefined ||
        ["string", "number", "boolean", "bigint"].includes(typeof item),
    );

    if (isPrimitiveArray) {
      acc[prefix] = value
        .map((item) =>
          item === null || item === undefined ? "" : String(item),
        )
        .join(", ");
      return;
    }

    value.forEach((item, index) => {
      flattenValue(item, `${prefix}[${index}]`, acc);
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
    acc[prefix] = String(value);
  }
};

const flattenItem = (item: Record<string, unknown>): FlattenedItem => {
  const acc: FlattenedItem = {};
  flattenValue(item, "", acc);
  return acc;
};

const Reports: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchReport = async () => {
    setIsFetching(true);
    await dispatch(
      fetchAllAdminItems({
        page: 1,
        limit: Number.MAX_SAFE_INTEGER,
        searchquery: searchTerm || undefined,
      }),
    );
    setIsFetching(false);
  };

  const flattenedItems = useMemo(() => {
    if (!items.length) {
      return [];
    }
    return items.map((item) => flattenItem(item as Record<string, unknown>));
  }, [items]);

  const csvHeaders = useMemo(() => {
    const headerSet = new Set<string>();
    flattenedItems.forEach((item) => {
      Object.keys(item).forEach((key) => headerSet.add(key));
    });
    return Array.from(headerSet)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => ({ label: key, key }));
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

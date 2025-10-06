import React, { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLanguage } from "@/context/LanguageContext";
import {
  fetchAllAdminItems,
  selectAllItems,
  selectItemsError,
  selectItemsLoading,
} from "@/store/slices/itemsSlice";
import { LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CSVLink } from "react-csv";
import { itemsApi } from "@/api/services/items";
import { t } from "@/translations";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FlattenedItem = Record<string, string>;

const flattenValue = (
  value: unknown,
  prefix: string,
  acc: FlattenedItem,
): void => {
  if (value === null || value === undefined) {
    if (prefix) {
      acc[prefix] = "N/A"; // Replace empty values with "N/A"
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
      acc[prefix] = "N/A"; // Replace empty values with "N/A"
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
        acc[prefix] = "N/A"; // Replace empty values with "N/A"
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

  const { lang } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<
    Record<string, number>
  >({});

  // Define allColumns as readonly
  const allColumns = [
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
  ] as const;

  type ColumnKey = (typeof allColumns)[number];

  const [selectedColumns, setSelectedColumns] = useState<ColumnKey[]>(() => {
    // Retrieve saved columns from local storage or use all columns by default
    const savedColumns = localStorage.getItem("selectedColumns");
    return savedColumns
      ? (JSON.parse(savedColumns) as ColumnKey[])
      : [...allColumns]; // Convert readonly array to mutable array
  });

  const handleColumnToggle = (column: ColumnKey) => {
    setSelectedColumns((prev) => {
      const updatedColumns = prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column];

      // Ensure the order matches allColumns
      const orderedColumns = allColumns.filter((col) =>
        updatedColumns.includes(col),
      );

      // Save updated columns to local storage
      localStorage.setItem("selectedColumns", JSON.stringify(orderedColumns));
      return orderedColumns;
    });
  };

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
        page: 1,
        limit: Number.MAX_SAFE_INTEGER,
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
      available_quantity: availabilityData[item.id]?.toString(), // use fetched availability data
    }));
  }, [items, availabilityData]);

  const csvHeaders = useMemo(() => {
    return selectedColumns.map((key) => ({
      label: t.reports.columns[key][lang], // Use translated column names
      key,
    }));
  }, [selectedColumns, lang]);

  const hasData = flattenedItems.length > 0 && csvHeaders.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl">{t.reports.title[lang]}</h1>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs bg-white rounded-md">
            <Input
              placeholder={t.reports.searchPlaceholder[lang]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-9 rounded-md w-full focus:outline-none focus:ring-0 focus:ring-secondary focus:border-secondary focus:bg-white"
            />
          </div>

          {/* Fetch Report Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleFetchReport}
                variant="outline"
                disabled={isFetching}
              >
                {isFetching
                  ? t.reports.fetchingButton[lang]
                  : t.reports.fetchButton[lang]}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="start"
              className="break-words w-fit max-w-[200px]"
            >
              {t.reports.fetchReportTooltip[lang]}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold text-secondary">
          {t.reports.selectColumns[lang]}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {allColumns.map((column) => (
            <label key={column} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedColumns.includes(column)}
                onCheckedChange={() => handleColumnToggle(column)}
                className="mr-2 h-4 w-4 border border-secondary bg-white text-white data-[state=checked]:bg-secondary data-[state=checked]:text-white relative z-10"
              />
              <span>{t.reports.columns[column][lang]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <LoaderCircle className="animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 text-destructive">{error}</div>
        ) : hasData ? (
          <Button variant="default" disabled={isFetching}>
            <CSVLink
              data={flattenedItems}
              headers={csvHeaders}
              filename="items_report.csv"
            >
              {t.reports.downloadCSV[lang]}
            </CSVLink>
          </Button>
        ) : (
          <div className="p-4 text-muted">{t.reports.noData[lang]}</div>
        )}
      </div>
    </div>
  );
};

export default Reports;

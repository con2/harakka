import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAllLogs,
  selectAllLogs,
  selectLogsError,
  selectLogsLoading,
} from "@/store/slices/logsSlice";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import { LogMessage } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { DataTable } from "../ui/data-table";
import { Badge } from "../ui/badge";

const Logs: React.FC = () => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const user = useAppSelector(selectSelectedUser);
  const loading = useAppSelector(selectLogsLoading);
  const error = useAppSelector(selectLogsError);
  const logs = useAppSelector(selectAllLogs);
  const userId = user?.id || "";

  useEffect(() => {
    dispatch(getAllLogs(userId));
  }, [dispatch, userId]);

  const refreshLogs = () => {
    if (userId) {
      dispatch(getAllLogs(userId));
    }
  };
  const columns: ColumnDef<LogMessage>[] = [
    {
      accessorKey: "timestamp",
      header: t.logs.columns.timestamp[lang],
      cell: ({ row }) => {
        const date = new Date(row.original.timestamp);
        return date.toLocaleString();
      },
    },
    {
      accessorKey: "level",
      header: t.logs.columns.level[lang],
      cell: ({ row }) => {
        const level = row.original.level;
        let classes = "bg-gray-100 text-gray-800 border-gray-300";

        if (level === "error") {
          classes = "bg-red-100 text-red-800 border-red-300";
        } else if (level === "warning") {
          classes = "bg-yellow-100 text-yellow-800 border-yellow-300";
        } else if (level === "info") {
          classes = "bg-blue-100 text-blue-800 border-blue-300";
        } else if (level === "debug") {
          classes = "bg-gray-100 text-gray-800 border-gray-300";
        }

        return (
          <Badge variant={"outline"} className={classes}>
            {level}
          </Badge>
        );
      },
    },
    {
      accessorKey: "message",
      header: t.logs.columns.message[lang],
      cell: ({ row }) => (
        <div className="max-w-xl break-words">{row.original.message}</div>
      ),
    },
    {
      accessorKey: "source",
      header: t.logs.columns.source[lang],
      cell: ({ row }) => row.original.source || "-",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="animate-spin h-12 w-12 text-secondary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={refreshLogs} variant="secondary" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t.logs.buttons.retry[lang]}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t.logs.title[lang]}</h2>
        <Button onClick={refreshLogs} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t.logs.buttons.refresh[lang]}
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          {t.logs.noData[lang]}
        </div>
      ) : (
        <DataTable columns={columns} data={logs} />
      )}
    </div>
  );
};

export default Logs;

import { Badge } from "../components/ui/badge";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

interface StatusBadgeProps {
  status?: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { lang } = useLanguage();

  if (!status) {
    return (
      <Badge variant="outline">{t.statusBadge.status.unknown[lang]}</Badge>
    );
  }

  switch (status) {
    case "pending": // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-300"
        >
          {t.statusBadge.status.pending[lang]}
        </Badge>
      );
    case "confirmed": // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-300"
        >
          {t.statusBadge.status.confirmed[lang]}
        </Badge>
      );
    case "cancelled": // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-300"
        >
          {t.statusBadge.status.cancelled[lang]}
        </Badge>
      );
    case "rejected": // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-300"
        >
          {t.statusBadge.status.rejected[lang]}
        </Badge>
      );
    case "completed": // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-300"
        >
          {t.statusBadge.status.completed[lang]}
        </Badge>
      );
    case "picked_up": // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-300"
        >
          {t.statusBadge.status.pickedUp[lang]}
        </Badge>
      );
    case "returned": // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-300"
        >
          {t.statusBadge.status.returned[lang]}
        </Badge>
      );
    default: {
      // Fallback for unknown status values - display as-is
      const fallbackBadge = <Badge variant="outline">{status}</Badge>;
      return fallbackBadge;
    }
  }
};

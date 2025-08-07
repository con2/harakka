import { Badge } from "../components/ui/badge";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

interface StatusBadgeProps {
  status?: string;
}

// Backend status constants - these values come from the API and should not be translated
const BACKEND_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  CANCELLED_BY_USER: "cancelled by user",
  CANCELLED_BY_ADMIN: "cancelled by admin",
  REJECTED: "rejected",
  COMPLETED: "completed",
  PICKED_UP: "picked up",
} as const;

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { lang } = useLanguage();

  if (!status) {
    return (
      <Badge variant="outline">{t.statusBadge.status.unknown[lang]}</Badge>
    );
  }

  switch (status) {
    case BACKEND_STATUS.PENDING: // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-300"
        >
          {t.statusBadge.status.pending[lang]}
        </Badge>
      );
    case BACKEND_STATUS.CONFIRMED: // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-300"
        >
          {t.statusBadge.status.confirmed[lang]}
        </Badge>
      );
    case BACKEND_STATUS.CANCELLED: // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-300"
        >
          {t.statusBadge.status.cancelled[lang]}
        </Badge>
      );
    case BACKEND_STATUS.CANCELLED_BY_USER: // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-300"
        >
          {t.statusBadge.status.cancelledByUser[lang]}
        </Badge>
      );
    case BACKEND_STATUS.CANCELLED_BY_ADMIN: // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-300"
        >
          {t.statusBadge.status.cancelledByAdmin[lang]}
        </Badge>
      );
    case BACKEND_STATUS.REJECTED: // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-300"
        >
          {t.statusBadge.status.rejected[lang]}
        </Badge>
      );
    case BACKEND_STATUS.COMPLETED: // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-300"
        >
          {t.statusBadge.status.completed[lang]}
        </Badge>
      );
    case BACKEND_STATUS.PICKED_UP: // Backend status value
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-300"
        >
          {t.statusBadge.status.pickedUp[lang]}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchUserBanHistory,
  selectBanHistory,
  selectUserBanningLoading,
} from "@/store/slices/userBanningSlice";
import { UserProfile } from "@common/user.types";

interface UserBanHistoryModalProps {
  user: UserProfile;
  initialOpen?: boolean;
  onClose?: () => void;
}

const UserBanHistoryModal = ({
  user,
  initialOpen = false,
  onClose,
}: UserBanHistoryModalProps) => {
  const dispatch = useAppDispatch();
  const banHistory = useAppSelector(selectBanHistory);
  const loading = useAppSelector(selectUserBanningLoading);
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(initialOpen);

  useEffect(() => {
    if (isOpen && user.id) {
      dispatch(fetchUserBanHistory(user.id));
    }
  }, [dispatch, isOpen, user.id]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!initialOpen && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            title={t.userBanning.history.title[lang]}
          >
            <History className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t.userBanning.history.title[lang]}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {user.full_name} ({user.email})
          </p>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <span>Loading...</span>
            </div>
          ) : banHistory.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {t.userBanning.history.noBans[lang]}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t.userBanning.history.columns.banType[lang]}
                  </TableHead>
                  <TableHead>
                    {t.userBanning.history.columns.reason[lang]}
                  </TableHead>
                  <TableHead>
                    {t.userBanning.history.columns.bannedAt[lang]}
                  </TableHead>
                  <TableHead>
                    {t.userBanning.history.columns.isPermanent[lang]}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banHistory.map((ban) => (
                  <TableRow key={ban.id}>
                    <TableCell>{ban.ban_type}</TableCell>
                    <TableCell>{ban.ban_reason || "-"}</TableCell>
                    <TableCell>
                      {ban.created_at
                        ? new Date(ban.created_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{ban.is_permanent ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserBanHistoryModal;

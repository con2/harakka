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
}

const UserBanHistoryModal = ({ user, initialOpen = false }: UserBanHistoryModalProps) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                    <TableCell>{ban.banType}</TableCell>
                    <TableCell>{ban.banReason || "-"}</TableCell>
                    <TableCell>
                      {ban.bannedAt
                        ? new Date(ban.bannedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{ban.isPermanent ? "Yes" : "No"}</TableCell>
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

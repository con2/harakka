import { useState } from "react";
import { MoreHorizontal, Ban, UserCheck, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { UserProfile } from "@common/user.types";
import {
  checkUserBanStatus,
  selectCurrentUserBanStatus,
  selectUserBanningLoading,
} from "@/store/slices/userBanningSlice";

interface UserBanActionsDropdownProps {
  user: UserProfile;
  canBan: boolean;
  isSuperAdmin: boolean;
  isAuthorized: boolean;
  onBanClick: () => void;
  onUnbanClick: () => void;
  onHistoryClick: () => void;
}

const UserBanActionsDropdown = ({
  user,
  canBan,
  isSuperAdmin,
  isAuthorized,
  onBanClick,
  onUnbanClick,
  onHistoryClick,
}: UserBanActionsDropdownProps) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const currentUserBanStatus = useAppSelector((state) =>
    selectCurrentUserBanStatus(state, user.id),
  );
  const loading = useAppSelector(selectUserBanningLoading);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);

  // Check ban status when dropdown opens for the first time
  const handleDropdownOpenChange = (open: boolean) => {
    setDropdownOpen(open);
    if (open && !statusChecked && user.id) {
      dispatch(checkUserBanStatus(user.id));
      setStatusChecked(true);
    }
  };

  const isUserBanned = currentUserBanStatus?.isBanned || false;

  const handleBanClick = () => {
    setDropdownOpen(false);
    onBanClick();
  };

  const handleUnbanClick = () => {
    setDropdownOpen(false);
    onUnbanClick();
  };

  const handleHistoryClick = () => {
    setDropdownOpen(false);
    onHistoryClick();
  };

  return (
    <Popover open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48">
        <div className="flex flex-col space-y-1">
          {canBan && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={handleBanClick}
            >
              <Ban className="mr-2 h-4 w-4" />
              {t.userBanning.actions.ban[lang]}
            </Button>
          )}
          {canBan && (
            <Button
              variant="ghost"
              size="sm"
              className={`justify-start ${
                !isUserBanned ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isUserBanned || loading}
              onClick={handleUnbanClick}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              {t.userBanning.actions.unban[lang]}
            </Button>
          )}
          {(isSuperAdmin || isAuthorized) && (
            <>
              <div className="h-px bg-gray-200 my-1" />
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={handleHistoryClick}
              >
                <History className="mr-2 h-4 w-4" />
                {t.userBanning.actions.viewHistory[lang]}
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserBanActionsDropdown;

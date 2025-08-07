import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

export interface UserSignupData {
  full_name: string;
  phone?: string;
}

interface UserSignupModalProps {
  isOpen: boolean;
  user: User | null;
  signupMethod: "email" | "oauth";
  onComplete: (data: UserSignupData) => Promise<void>;
  onSkip: () => Promise<void>;
}

export const UserSignupModal: React.FC<UserSignupModalProps> = ({
  isOpen,
  user,
  signupMethod,
  onComplete,
  onSkip,
}) => {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserSignupData>({
    full_name: user ? getInitialName(user, signupMethod) : "",
    phone: user ? getInitialPhone(user, signupMethod) : "",
  });
  const [errors, setErrors] = useState<{
    full_name?: string;
    phone?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: { full_name?: string; phone?: string } = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = t.userSignupModal.fullName.required[lang];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error("Error completing signup:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await onSkip();
    } catch (error) {
      console.error("Error skipping signup:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserSignupData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t.userSignupModal.title[lang]}</DialogTitle>
          <DialogDescription>
            {t.userSignupModal.subtitle[lang]}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              {t.userSignupModal.fullName.label[lang]}
            </Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              placeholder={t.userSignupModal.fullName.placeholder[lang]}
              disabled={loading}
              className={errors.full_name ? "border-red-500" : ""}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              {t.userSignupModal.phone.label[lang]}{" "}
              <span className="text-muted-foreground text-sm">
                {t.userSignupModal.phone.optional[lang]}
              </span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder={t.userSignupModal.phone.placeholder[lang]}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.userSignupModal.loading[lang]}
                </>
              ) : (
                t.userSignupModal.buttons.complete[lang]
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={loading}
            >
              {t.userSignupModal.buttons.skip[lang]}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Helper functions to extract initial data from user object
function getInitialName(user: User, signupMethod: "email" | "oauth"): string {
  if (signupMethod === "oauth") {
    const { user_metadata } = user;
    const firstName =
      user_metadata?.first_name || user_metadata?.given_name || "";
    const lastName =
      user_metadata?.last_name || user_metadata?.family_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user_metadata?.name || "";
  }

  // For email signup, we don't have name data yet
  return "";
}

function getInitialPhone(user: User, signupMethod: "email" | "oauth"): string {
  if (signupMethod === "oauth") {
    const { user_metadata } = user;
    return user_metadata?.phone || user_metadata?.phone_number || "";
  }

  return "";
}

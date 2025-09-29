import type { AddressForm, CreateAddressInput } from "@/types/address";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectSelectedUser,
  selectUserAddresses,
  updateUser,
  addAddress,
  getUserAddresses,
} from "@/store/slices/usersSlice";
import { CompleteProfileData } from "@/components/Profile/ProfileCompletionModal";

export interface ProfileCompletionStatus {
  isComplete: boolean;
  hasName: boolean;
  hasPhone: boolean;
  hasAddress: boolean;
  missingFields: string[];
  warnings: string[];
}

export interface ProfileCompletionData {
  full_name: string;
  phone?: string;
}

/**
 * Hook to check if user's profile is complete for booking
 * Requires full_name, recommends phone number
 */
export function useProfileCompletion(): {
  status: ProfileCompletionStatus | null;
  loading: boolean;
  checkProfile: () => void;
  updateProfile: (data: CompleteProfileData) => Promise<boolean>;
} {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector(selectSelectedUser);
  const existingAddresses = useAppSelector(selectUserAddresses);
  const [status, setStatus] = useState<ProfileCompletionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkProfile = useCallback(() => {
    if (!user) {
      setStatus(null);
      return;
    }

    setLoading(true);
    try {
      // Use the full user profile from Redux if available, otherwise use basic user data
      const profile = userProfile || user;

      // Type-safe access to profile fields
      const profileWithName = profile as { full_name?: string };
      const profileWithPhone = profile as { phone?: string };

      const hasName = !!(
        profileWithName.full_name && profileWithName.full_name.trim()
      );

      const hasPhone = !!(
        profileWithPhone.phone && profileWithPhone.phone.trim()
      );

      // Check if user has at least one address
      const hasAddress = !!(existingAddresses && existingAddresses.length > 0);

      const missingFields: string[] = [];
      const warnings: string[] = [];

      if (!hasName) {
        missingFields.push("full_name");
      }

      if (!hasAddress) {
        missingFields.push("address");
      }

      if (!hasPhone) {
        warnings.push(
          "Phone number is recommended for easier communication about your bookings",
        );
      }

      const isComplete = hasName && hasAddress; // Name and address are required for booking

      setStatus({
        isComplete,
        hasName,
        hasPhone,
        hasAddress,
        missingFields,
        warnings,
      });
    } catch (error) {
      console.error("Error checking profile completion:", error);
      setStatus({
        isComplete: false,
        hasName: false,
        hasPhone: false,
        hasAddress: false,
        missingFields: ["full_name", "address"],
        warnings: [],
      });
    } finally {
      setLoading(false);
    }
  }, [user, userProfile, existingAddresses]);

  const updateProfile = useCallback(
    async (data: CompleteProfileData): Promise<boolean> => {
      if (!user?.id) {
        return false;
      }

      try {
        // 1) Update user profile (full_name/phone)
        const updateData = {
          id: user.id,
          full_name: data.profile.full_name.trim(),
          ...(data.profile.phone &&
            data.profile.phone.trim() && { phone: data.profile.phone.trim() }),
        };

        await dispatch(updateUser({ id: user.id, data: updateData })).unwrap();

        // 2) Optionally add address — align with MyProfile payload exactly
        if (data.address) {
          // Ensure we have the latest addresses to decide default flag
          try {
            await dispatch(getUserAddresses(user.id)).unwrap();
          } catch (e) {
            if (process.env.NODE_ENV !== "production") {
              console.error("Error fetching user addresses:", e);
            }
          }

          const hasAnyAddress = (existingAddresses?.length ?? 0) > 0;
          const hasDefault =
            existingAddresses?.some((a) => a.is_default) ?? false;

          // Normalize incoming fields to snake_case & trimmed
          const street = data.address.street_address?.trim();
          const city = data.address.city?.trim();
          const postal = data.address.postal_code?.trim();
          const country = data.address.country?.trim();
          const addrType = (data.address.address_type?.trim() || "both") as
            | "both"
            | "billing"
            | "shipping";

          if (!street || !city) {
            console.warn("Address skipped: street and city are required");
          } else {
            // 1) Build a frontend AddressForm value (with user_id)
            const addressForm: AddressForm = {
              user_id: user.id,
              address_type: addrType,
              street_address: street,
              city,
              postal_code: postal ?? "",
              country: country ?? "",
              is_default: !(hasAnyAddress && hasDefault),
            };

            // 2) Map to backend DTO shape (CreateAddressDto) — drop user_id
            const createDto: CreateAddressInput = {
              address_type: addressForm.address_type,
              street_address: addressForm.street_address,
              city: addressForm.city,
              postal_code: addressForm.postal_code,
              country: addressForm.country,
              is_default: addressForm.is_default,
            };

            try {
              await dispatch(
                addAddress({
                  id: user.id,
                  address: createDto,
                }),
              ).unwrap();
            } catch (err: unknown) {
              if (axios.isAxiosError(err)) {
                const msg =
                  err.response?.data?.message || err.message || "Bad Request";
                console.error("Address add failed:", msg, err.response?.data);
              } else {
                console.error("Address add failed:", err);
              }
              throw err;
            }
          }
        }

        // 3) Refresh the profile status
        checkProfile();

        return true;
      } catch (error) {
        console.error("Error updating profile:", error);
        return false;
      }
    },
    [user?.id, dispatch, checkProfile, existingAddresses],
  );

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  return { status, loading, checkProfile, updateProfile };
}

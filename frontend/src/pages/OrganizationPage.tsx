import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchOrganizationBySlug,
  selectOrganizationLoading,
  selectOrganizationError,
  selectedOrganization,
} from "@/store/slices/organizationSlice";
import OrganizationInfo from "../components/Organization/OrganizationInfo";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const OrganizationPage = () => {
  const { lang } = useLanguage();
  const { org_slug } = useParams();
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const organization = useAppSelector(selectedOrganization);
  const organizationLoading = useAppSelector(selectOrganizationLoading);
  const organizationError = useAppSelector(selectOrganizationError);

  // Fetch organization data when slug changes
  useEffect(() => {
    if (org_slug) {
      void dispatch(fetchOrganizationBySlug(org_slug));
    }
  }, [org_slug, dispatch]);

  // Handle error state
  if (organizationError) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg bg-white">
        <div className="text-center py-10 text-red-500">
          {t.organizationPage.error[lang]} {organizationError}
        </div>
      </div>
    );
  }

  // Handle loading state
  if (organizationLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg bg-white">
        <div className="text-center py-10">
          {t.organizationPage.loadingOrganization[lang]}
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg bg-white">
        <div className="text-center py-10">
          {t.organizationPage.organizationNotFound[lang]}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg bg-white">
      <OrganizationInfo organization={organization} />
    </div>
  );
};

export default OrganizationPage;

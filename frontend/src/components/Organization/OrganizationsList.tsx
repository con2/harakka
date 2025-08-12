import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrganizations,
  selectOrganizations,
  selectOrganizationLoading,
  selectOrganizationError,
} from "@/store/slices/organizationSlice";
import { Link } from "react-router-dom";

const OrganizationsList = () => {
  const dispatch = useAppDispatch();
  const organizations = useAppSelector(selectOrganizations);
  const loading = useAppSelector(selectOrganizationLoading);
  const error = useAppSelector(selectOrganizationError);

  useEffect(() => {
    void dispatch(fetchAllOrganizations({ page: 1, limit: 50 }));
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="organizations-page">
      <h1>All Organizations</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {organizations.map((org) => (
          <div key={org.id} className="card">
            <h2>{org.name}</h2>
            <p>{org.description}</p>
            <Link
              to={`/organization/${org.slug}`}
              className="text-blue-500 hover:underline"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationsList;

import React from "react";

interface OrganizationInfoProps {
  name: string;
  description: string;
  contactDetails: {
    email: string;
    phone: string;
  };
}

const OrganizationInfo: React.FC<OrganizationInfoProps> = ({
  name,
  description,
  contactDetails,
}) => {
  return (
    <div className="organization-info">
      <h1>{name}</h1>
      <p>{description}</p>
      <div className="contact-details">
        <h2>Contact Details</h2>
        <p>
          Email:{" "}
          <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
        </p>
        <p>
          Phone:{" "}
          <a href={`tel:${contactDetails.phone}`}>{contactDetails.phone}</a>
        </p>
      </div>
    </div>
  );
};

export default OrganizationInfo;

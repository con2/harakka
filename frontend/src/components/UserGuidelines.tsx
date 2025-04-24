import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React from "react";

export const UserGuide: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg bg-white rounded-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">User Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal ml-6 space-y-2 text-gray-700">
            <li>
              <strong>How to Order:</strong> Browse our storage options, select the items you need, and add them to your booking.
            </li>
            <li>
              <strong>Payment Process:</strong> Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure blanditiis obcaecati quaerat in id doloremque explicabo sit eos sed fuga libero natus similique itaque, incidunt, odio nemo modi. Eum, voluptatibus.
            </li>
            <li>
              <strong>Booking Confirmation:</strong> you'll receive a booking confirmation via email.
            </li>
            <li>
              <strong>Item Pick-Up:</strong> Our team will guide you on when and how to collect your items.
            </li>
            <li>
              <strong>Support:</strong> For queries, contact our support team through the 'Help' section.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

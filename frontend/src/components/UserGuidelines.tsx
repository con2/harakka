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
              <strong>How to Get Started </strong>
              <li>Go to the <strong>Login</strong> page ➡️</li>
              <li>You can register or create your account using Google email.</li>
              <li>After logging in, navigate to the <strong>Storage Items</strong> section.</li>
              <li>Use filters based on your needs, including:
                  <ul>
                      <li>Price</li>
                      <li>Rating</li>
                      <li>Tags</li>
                  </ul>
              </li>
              <li>Search items by:
                  <ul>
                      <li>Name</li>
                      <li>Category</li>
                      <li>Tags</li>
                      <li>Description</li>
                  </ul>
              </li>
              <li>Choose items according to the <strong>timeframes</strong> to see availability.</li>
              <li>Select the <strong>Start Date</strong> and <strong>End Date</strong> for when you need the items and when you plan to return them.</li>
            <li>
              <strong>How to Order:</strong> Browse our storage options, select
              the items you need, and add them to your cart.
            </li>
            <li>
              <strong>Payment Process:</strong> After, you checkout you will receive invoice in pdf.
            </li>
            <li>
              <strong>Booking Confirmation:</strong> You'll receive a booking
              confirmation in your invoice.
            </li>
            <li>
              <strong>Item Pick-Up:</strong> Our team will guide you on when and
              how to collect your items.
            </li>
            <li>
              <strong>Support:</strong> For queries, contact our support team
              through the 'Help' section.
            </li>
          </ol>
        </CardContent>

        <CardHeader>
          <CardTitle className="text-lg font-bold"> For Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal ml-6 space-y-2 text-gray-700">
            <li>Click on <strong>Admin Panel</strong> to access the <strong>Dashboard</strong>, where you can manage:
              <ul>
                  <li>Users</li>
                  <li>Teams</li>
                  <li>Orders</li>
                  <li>Items</li>
                  <li>Tags</li>
                  <li>Other settings</li>
              </ul>
            </li>
            
            <li><strong>Users:</strong> Modify user details, including:
              <ul>
                  <li>Edit or delete items</li>
                  <li>Add new users</li>
              </ul>
            </li>
            
            <li><strong>Teams:</strong> Manage team members:
              <ul>
                  <li>Add team members</li>
                  <li>Assign roles as Admin or SuperAdmin</li>
                  <li>Enter details such as Name, Phone Number, Email, and Role</li>
                  <li>Edit or delete team members</li>
              </ul>
            </li>
            
            <li><strong>Items:</strong> Manage inventory:
              <ul>
                  <li>View item lists</li>
                  <li>Add, edit, or delete items</li>
                  <li>Hide or unhide item availability</li>
                  <li>Add item name in Finnish and English, item type, description, location ID, compartment ID, price, total quantity, availability, and assign tags</li>
              </ul>
            </li>
            
            <li><strong>Tags:</strong> Manage tags:
              <ul>
                  <li>Add, edit, or delete tags</li>
                  <li>Add tags in Finnish and English</li>
              </ul>
            </li>
            
            <li><strong>Orders:</strong> Manage order lists:
              <ul>
                  <li>View all orders with customer details</li>
                  <li>Refresh order list</li>
                  <li>View or delete customer orders</li>
              </ul>
            </li>
          </ol>
        </CardContent>
      </Card>

    </div>
  );
};

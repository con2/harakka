import { useAppSelector } from "@/store/hooks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Separator } from "./ui/separator";
import { selectSelectedUser } from "@/store/slices/usersSlice";

export const UserGuide: React.FC = () => {
  const selectedUser = useAppSelector(selectSelectedUser);
  const isAdmin = ["admin", "superVera"].includes(selectedUser?.role ?? "");

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 m-10 gap-20 box-shadow-lg rounded-lg bg-white">
      {/* Guidelines */}
      <div className="flex flex-col items-start">
        <section className="w-full max-w-xl px-4 sm:px-6 md:px-8 mx-auto mb-10">
          <h2 className="text-2xl font-bold text-center mb-6">User Guide</h2>
          <Accordion type="single" collapsible className="w-full mb-10">
            <AccordionItem value="user-1">
              <AccordionTrigger>How to Get Started</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                  <li>
                    Go to the <strong>Login</strong> page ➡️
                  </li>
                  <li>
                    You can register or create your account using Google email.
                  </li>
                  <li>
                    After logging in, navigate to the{" "}
                    <strong>Storage Items</strong> section.
                  </li>
                  <li>
                    Use filters based on your needs:
                    <ul className="list-disc ml-6">
                      <li>Price</li>
                      <li>Rating</li>
                      <li>Tags</li>
                    </ul>
                  </li>
                  <li>
                    Search items by:
                    <ul className="list-disc ml-6">
                      <li>Name</li>
                      <li>Category</li>
                      <li>Tags</li>
                      <li>Description</li>
                    </ul>
                  </li>
                  <li>
                    Select the <strong>Start Date</strong> and{" "}
                    <strong>End Date</strong> to check availability.
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="user-2">
              <AccordionTrigger>How to Order</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                  <li>
                    Browse our storage options, select the items, and add them
                    to your cart.
                  </li>
                  <li>
                    <strong>Payment Process:</strong> After checkout, you will
                    receive an invoice in PDF format.
                  </li>
                  <li>
                    <strong>Booking Confirmation:</strong> Your confirmation
                    will be included in the invoice.
                  </li>
                  <li>
                    <strong>Item Pick-Up:</strong> Our team will guide you on
                    collection procedures.
                  </li>
                  <li>
                    <strong>Support:</strong> For questions, visit the 'Help'
                    section.
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator className="my-10" />
          {isAdmin && (
            <>
              <h2 className="text-2xl font-bold text-center mb-6">
                Admin Guide
              </h2>
              <Accordion type="single" collapsible className="w-full mb-10">
                <AccordionItem value="admin-1">
                  <AccordionTrigger>Dashboard Overview</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Click on <strong>Admin Panel</strong> to manage:
                    </p>
                    <ul className="list-disc ml-6 space-y-1 text-gray-700">
                      <li>Users</li>
                      <li>Teams</li>
                      <li>Orders</li>
                      <li>Items</li>
                      <li>Tags</li>
                      <li>Settings</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-2">
                  <AccordionTrigger>Users & Teams</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      <strong>Users:</strong> Add, edit, or delete users.
                    </p>
                    <p>
                      <strong>Teams:</strong> Manage team members and assign
                      roles.
                    </p>
                    <ul className="list-disc ml-6 space-y-1 text-gray-700">
                      <li>Add/Edit/Delete members</li>
                      <li>Assign roles (Admin or SuperAdmin)</li>
                      <li>Set Name, Email, Phone, and Role</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-3">
                  <AccordionTrigger>Item & Tag Management</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      <strong>Items:</strong> Add, edit, hide, or remove items.
                    </p>
                    <p>
                      Include details such as name (EN/FIN), location, price,
                      quantity, availability, and tags.
                    </p>
                    <p>
                      <strong>Tags:</strong> Create/edit/delete tags in both
                      English and Finnish.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-4">
                  <AccordionTrigger>Orders</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc ml-6 space-y-1 text-gray-700">
                      <li>View all customer orders</li>
                      <li>Refresh the order list</li>
                      <li>View or delete specific orders</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Separator className="my-10" />
            </>
          )}
        </section>
      </div>

      {/* FAQ Section */}
      <div className="flex flex-col items-start">
        <section className="w-full max-w-xl px-4 sm:px-6 md:px-8 mx-auto mb-20">
          <h2 className="text-2xl font-bold text-center mb-6">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1" className="w-full">
              <AccordionTrigger className="w-full text-left">
                Do you deliver to LARP event locations?
              </AccordionTrigger>
              <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
                Yes! We offer delivery and pickup options for most major LARP
                events in Finland.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2" className="w-full">
              <AccordionTrigger className="w-full text-left">
                Can I reserve items in advance?
              </AccordionTrigger>
              <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
                Absolutely. We recommend booking at least 2 weeks before your
                event to ensure availability.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3" className="w-full">
              <AccordionTrigger className="w-full text-left">
                What happens if something breaks?
              </AccordionTrigger>
              <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
                Accidents happen. We assess damage case by case. Some wear is
                expected, malicious damage may incur fees.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4" className="w-full">
              <AccordionTrigger className="w-full text-left">
                Some other question?
              </AccordionTrigger>
              <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Sapiente magni placeat sed dolorem impedit voluptates iure
                possimus odit quam illum omnis ipsum, earum, reiciendis
                blanditiis itaque esse quidem porro vero.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q5" className="w-full">
              <AccordionTrigger className="w-full text-left">
                Lorem Ipsum?
              </AccordionTrigger>
              <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Sapiente magni placeat sed dolorem impedit voluptates iure
                possimus odit quam illum omnis ipsum, earum, reiciendis
                blanditiis itaque esse quidem porro vero.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};

drop trigger if exists "test_metadata_trigger" on "public"."storage_items";

revoke delete on table "public"."audit_logs" from "anon";

revoke insert on table "public"."audit_logs" from "anon";

revoke references on table "public"."audit_logs" from "anon";

revoke select on table "public"."audit_logs" from "anon";

revoke trigger on table "public"."audit_logs" from "anon";

revoke truncate on table "public"."audit_logs" from "anon";

revoke update on table "public"."audit_logs" from "anon";

revoke delete on table "public"."audit_logs" from "authenticated";

revoke insert on table "public"."audit_logs" from "authenticated";

revoke references on table "public"."audit_logs" from "authenticated";

revoke select on table "public"."audit_logs" from "authenticated";

revoke trigger on table "public"."audit_logs" from "authenticated";

revoke truncate on table "public"."audit_logs" from "authenticated";

revoke update on table "public"."audit_logs" from "authenticated";

revoke delete on table "public"."audit_logs" from "service_role";

revoke insert on table "public"."audit_logs" from "service_role";

revoke references on table "public"."audit_logs" from "service_role";

revoke select on table "public"."audit_logs" from "service_role";

revoke trigger on table "public"."audit_logs" from "service_role";

revoke truncate on table "public"."audit_logs" from "service_role";

revoke update on table "public"."audit_logs" from "service_role";

revoke delete on table "public"."booking_items" from "anon";

revoke insert on table "public"."booking_items" from "anon";

revoke references on table "public"."booking_items" from "anon";

revoke select on table "public"."booking_items" from "anon";

revoke trigger on table "public"."booking_items" from "anon";

revoke truncate on table "public"."booking_items" from "anon";

revoke update on table "public"."booking_items" from "anon";

revoke delete on table "public"."booking_items" from "authenticated";

revoke insert on table "public"."booking_items" from "authenticated";

revoke references on table "public"."booking_items" from "authenticated";

revoke select on table "public"."booking_items" from "authenticated";

revoke trigger on table "public"."booking_items" from "authenticated";

revoke truncate on table "public"."booking_items" from "authenticated";

revoke update on table "public"."booking_items" from "authenticated";

revoke delete on table "public"."booking_items" from "service_role";

revoke insert on table "public"."booking_items" from "service_role";

revoke references on table "public"."booking_items" from "service_role";

revoke select on table "public"."booking_items" from "service_role";

revoke trigger on table "public"."booking_items" from "service_role";

revoke truncate on table "public"."booking_items" from "service_role";

revoke update on table "public"."booking_items" from "service_role";

revoke delete on table "public"."bookings" from "anon";

revoke insert on table "public"."bookings" from "anon";

revoke references on table "public"."bookings" from "anon";

revoke select on table "public"."bookings" from "anon";

revoke trigger on table "public"."bookings" from "anon";

revoke truncate on table "public"."bookings" from "anon";

revoke update on table "public"."bookings" from "anon";

revoke delete on table "public"."bookings" from "authenticated";

revoke insert on table "public"."bookings" from "authenticated";

revoke references on table "public"."bookings" from "authenticated";

revoke select on table "public"."bookings" from "authenticated";

revoke trigger on table "public"."bookings" from "authenticated";

revoke truncate on table "public"."bookings" from "authenticated";

revoke update on table "public"."bookings" from "authenticated";

revoke delete on table "public"."bookings" from "service_role";

revoke insert on table "public"."bookings" from "service_role";

revoke references on table "public"."bookings" from "service_role";

revoke select on table "public"."bookings" from "service_role";

revoke trigger on table "public"."bookings" from "service_role";

revoke truncate on table "public"."bookings" from "service_role";

revoke update on table "public"."bookings" from "service_role";

revoke delete on table "public"."invoices" from "anon";

revoke insert on table "public"."invoices" from "anon";

revoke references on table "public"."invoices" from "anon";

revoke select on table "public"."invoices" from "anon";

revoke trigger on table "public"."invoices" from "anon";

revoke truncate on table "public"."invoices" from "anon";

revoke update on table "public"."invoices" from "anon";

revoke delete on table "public"."invoices" from "authenticated";

revoke insert on table "public"."invoices" from "authenticated";

revoke references on table "public"."invoices" from "authenticated";

revoke select on table "public"."invoices" from "authenticated";

revoke trigger on table "public"."invoices" from "authenticated";

revoke truncate on table "public"."invoices" from "authenticated";

revoke update on table "public"."invoices" from "authenticated";

revoke delete on table "public"."invoices" from "service_role";

revoke insert on table "public"."invoices" from "service_role";

revoke references on table "public"."invoices" from "service_role";

revoke select on table "public"."invoices" from "service_role";

revoke trigger on table "public"."invoices" from "service_role";

revoke truncate on table "public"."invoices" from "service_role";

revoke update on table "public"."invoices" from "service_role";

revoke delete on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "anon";

revoke select on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke update on table "public"."notifications" from "anon";

revoke delete on table "public"."notifications" from "authenticated";

revoke insert on table "public"."notifications" from "authenticated";

revoke references on table "public"."notifications" from "authenticated";

revoke select on table "public"."notifications" from "authenticated";

revoke trigger on table "public"."notifications" from "authenticated";

revoke truncate on table "public"."notifications" from "authenticated";

revoke update on table "public"."notifications" from "authenticated";

revoke delete on table "public"."notifications" from "service_role";

revoke insert on table "public"."notifications" from "service_role";

revoke references on table "public"."notifications" from "service_role";

revoke select on table "public"."notifications" from "service_role";

revoke trigger on table "public"."notifications" from "service_role";

revoke truncate on table "public"."notifications" from "service_role";

revoke update on table "public"."notifications" from "service_role";

revoke delete on table "public"."organization_items" from "anon";

revoke insert on table "public"."organization_items" from "anon";

revoke references on table "public"."organization_items" from "anon";

revoke select on table "public"."organization_items" from "anon";

revoke trigger on table "public"."organization_items" from "anon";

revoke truncate on table "public"."organization_items" from "anon";

revoke update on table "public"."organization_items" from "anon";

revoke delete on table "public"."organization_items" from "authenticated";

revoke insert on table "public"."organization_items" from "authenticated";

revoke references on table "public"."organization_items" from "authenticated";

revoke select on table "public"."organization_items" from "authenticated";

revoke trigger on table "public"."organization_items" from "authenticated";

revoke truncate on table "public"."organization_items" from "authenticated";

revoke update on table "public"."organization_items" from "authenticated";

revoke delete on table "public"."organization_items" from "service_role";

revoke insert on table "public"."organization_items" from "service_role";

revoke references on table "public"."organization_items" from "service_role";

revoke select on table "public"."organization_items" from "service_role";

revoke trigger on table "public"."organization_items" from "service_role";

revoke truncate on table "public"."organization_items" from "service_role";

revoke update on table "public"."organization_items" from "service_role";

revoke delete on table "public"."organization_locations" from "anon";

revoke insert on table "public"."organization_locations" from "anon";

revoke references on table "public"."organization_locations" from "anon";

revoke select on table "public"."organization_locations" from "anon";

revoke trigger on table "public"."organization_locations" from "anon";

revoke truncate on table "public"."organization_locations" from "anon";

revoke update on table "public"."organization_locations" from "anon";

revoke delete on table "public"."organization_locations" from "authenticated";

revoke insert on table "public"."organization_locations" from "authenticated";

revoke references on table "public"."organization_locations" from "authenticated";

revoke select on table "public"."organization_locations" from "authenticated";

revoke trigger on table "public"."organization_locations" from "authenticated";

revoke truncate on table "public"."organization_locations" from "authenticated";

revoke update on table "public"."organization_locations" from "authenticated";

revoke delete on table "public"."organization_locations" from "service_role";

revoke insert on table "public"."organization_locations" from "service_role";

revoke references on table "public"."organization_locations" from "service_role";

revoke select on table "public"."organization_locations" from "service_role";

revoke trigger on table "public"."organization_locations" from "service_role";

revoke truncate on table "public"."organization_locations" from "service_role";

revoke update on table "public"."organization_locations" from "service_role";

revoke delete on table "public"."organizations" from "anon";

revoke insert on table "public"."organizations" from "anon";

revoke references on table "public"."organizations" from "anon";

revoke select on table "public"."organizations" from "anon";

revoke trigger on table "public"."organizations" from "anon";

revoke truncate on table "public"."organizations" from "anon";

revoke update on table "public"."organizations" from "anon";

revoke delete on table "public"."organizations" from "authenticated";

revoke insert on table "public"."organizations" from "authenticated";

revoke references on table "public"."organizations" from "authenticated";

revoke select on table "public"."organizations" from "authenticated";

revoke trigger on table "public"."organizations" from "authenticated";

revoke truncate on table "public"."organizations" from "authenticated";

revoke update on table "public"."organizations" from "authenticated";

revoke delete on table "public"."organizations" from "service_role";

revoke insert on table "public"."organizations" from "service_role";

revoke references on table "public"."organizations" from "service_role";

revoke select on table "public"."organizations" from "service_role";

revoke trigger on table "public"."organizations" from "service_role";

revoke truncate on table "public"."organizations" from "service_role";

revoke update on table "public"."organizations" from "service_role";

revoke delete on table "public"."payments" from "anon";

revoke insert on table "public"."payments" from "anon";

revoke references on table "public"."payments" from "anon";

revoke select on table "public"."payments" from "anon";

revoke trigger on table "public"."payments" from "anon";

revoke truncate on table "public"."payments" from "anon";

revoke update on table "public"."payments" from "anon";

revoke delete on table "public"."payments" from "authenticated";

revoke insert on table "public"."payments" from "authenticated";

revoke references on table "public"."payments" from "authenticated";

revoke select on table "public"."payments" from "authenticated";

revoke trigger on table "public"."payments" from "authenticated";

revoke truncate on table "public"."payments" from "authenticated";

revoke update on table "public"."payments" from "authenticated";

revoke delete on table "public"."payments" from "service_role";

revoke insert on table "public"."payments" from "service_role";

revoke references on table "public"."payments" from "service_role";

revoke select on table "public"."payments" from "service_role";

revoke trigger on table "public"."payments" from "service_role";

revoke truncate on table "public"."payments" from "service_role";

revoke update on table "public"."payments" from "service_role";

revoke delete on table "public"."promotions" from "anon";

revoke insert on table "public"."promotions" from "anon";

revoke references on table "public"."promotions" from "anon";

revoke select on table "public"."promotions" from "anon";

revoke trigger on table "public"."promotions" from "anon";

revoke truncate on table "public"."promotions" from "anon";

revoke update on table "public"."promotions" from "anon";

revoke delete on table "public"."promotions" from "authenticated";

revoke insert on table "public"."promotions" from "authenticated";

revoke references on table "public"."promotions" from "authenticated";

revoke select on table "public"."promotions" from "authenticated";

revoke trigger on table "public"."promotions" from "authenticated";

revoke truncate on table "public"."promotions" from "authenticated";

revoke update on table "public"."promotions" from "authenticated";

revoke delete on table "public"."promotions" from "service_role";

revoke insert on table "public"."promotions" from "service_role";

revoke references on table "public"."promotions" from "service_role";

revoke select on table "public"."promotions" from "service_role";

revoke trigger on table "public"."promotions" from "service_role";

revoke truncate on table "public"."promotions" from "service_role";

revoke update on table "public"."promotions" from "service_role";

revoke delete on table "public"."reviews" from "anon";

revoke insert on table "public"."reviews" from "anon";

revoke references on table "public"."reviews" from "anon";

revoke select on table "public"."reviews" from "anon";

revoke trigger on table "public"."reviews" from "anon";

revoke truncate on table "public"."reviews" from "anon";

revoke update on table "public"."reviews" from "anon";

revoke delete on table "public"."reviews" from "authenticated";

revoke insert on table "public"."reviews" from "authenticated";

revoke references on table "public"."reviews" from "authenticated";

revoke select on table "public"."reviews" from "authenticated";

revoke trigger on table "public"."reviews" from "authenticated";

revoke truncate on table "public"."reviews" from "authenticated";

revoke update on table "public"."reviews" from "authenticated";

revoke delete on table "public"."reviews" from "service_role";

revoke insert on table "public"."reviews" from "service_role";

revoke references on table "public"."reviews" from "service_role";

revoke select on table "public"."reviews" from "service_role";

revoke trigger on table "public"."reviews" from "service_role";

revoke truncate on table "public"."reviews" from "service_role";

revoke update on table "public"."reviews" from "service_role";

revoke delete on table "public"."roles" from "anon";

revoke insert on table "public"."roles" from "anon";

revoke references on table "public"."roles" from "anon";

revoke select on table "public"."roles" from "anon";

revoke trigger on table "public"."roles" from "anon";

revoke truncate on table "public"."roles" from "anon";

revoke update on table "public"."roles" from "anon";

revoke delete on table "public"."roles" from "authenticated";

revoke insert on table "public"."roles" from "authenticated";

revoke references on table "public"."roles" from "authenticated";

revoke select on table "public"."roles" from "authenticated";

revoke trigger on table "public"."roles" from "authenticated";

revoke truncate on table "public"."roles" from "authenticated";

revoke update on table "public"."roles" from "authenticated";

revoke delete on table "public"."roles" from "service_role";

revoke insert on table "public"."roles" from "service_role";

revoke references on table "public"."roles" from "service_role";

revoke select on table "public"."roles" from "service_role";

revoke trigger on table "public"."roles" from "service_role";

revoke truncate on table "public"."roles" from "service_role";

revoke update on table "public"."roles" from "service_role";

revoke delete on table "public"."saved_list_items" from "anon";

revoke insert on table "public"."saved_list_items" from "anon";

revoke references on table "public"."saved_list_items" from "anon";

revoke select on table "public"."saved_list_items" from "anon";

revoke trigger on table "public"."saved_list_items" from "anon";

revoke truncate on table "public"."saved_list_items" from "anon";

revoke update on table "public"."saved_list_items" from "anon";

revoke delete on table "public"."saved_list_items" from "authenticated";

revoke insert on table "public"."saved_list_items" from "authenticated";

revoke references on table "public"."saved_list_items" from "authenticated";

revoke select on table "public"."saved_list_items" from "authenticated";

revoke trigger on table "public"."saved_list_items" from "authenticated";

revoke truncate on table "public"."saved_list_items" from "authenticated";

revoke update on table "public"."saved_list_items" from "authenticated";

revoke delete on table "public"."saved_list_items" from "service_role";

revoke insert on table "public"."saved_list_items" from "service_role";

revoke references on table "public"."saved_list_items" from "service_role";

revoke select on table "public"."saved_list_items" from "service_role";

revoke trigger on table "public"."saved_list_items" from "service_role";

revoke truncate on table "public"."saved_list_items" from "service_role";

revoke update on table "public"."saved_list_items" from "service_role";

revoke delete on table "public"."saved_lists" from "anon";

revoke insert on table "public"."saved_lists" from "anon";

revoke references on table "public"."saved_lists" from "anon";

revoke select on table "public"."saved_lists" from "anon";

revoke trigger on table "public"."saved_lists" from "anon";

revoke truncate on table "public"."saved_lists" from "anon";

revoke update on table "public"."saved_lists" from "anon";

revoke delete on table "public"."saved_lists" from "authenticated";

revoke insert on table "public"."saved_lists" from "authenticated";

revoke references on table "public"."saved_lists" from "authenticated";

revoke select on table "public"."saved_lists" from "authenticated";

revoke trigger on table "public"."saved_lists" from "authenticated";

revoke truncate on table "public"."saved_lists" from "authenticated";

revoke update on table "public"."saved_lists" from "authenticated";

revoke delete on table "public"."saved_lists" from "service_role";

revoke insert on table "public"."saved_lists" from "service_role";

revoke references on table "public"."saved_lists" from "service_role";

revoke select on table "public"."saved_lists" from "service_role";

revoke trigger on table "public"."saved_lists" from "service_role";

revoke truncate on table "public"."saved_lists" from "service_role";

revoke update on table "public"."saved_lists" from "service_role";

revoke delete on table "public"."storage_analytics" from "anon";

revoke insert on table "public"."storage_analytics" from "anon";

revoke references on table "public"."storage_analytics" from "anon";

revoke select on table "public"."storage_analytics" from "anon";

revoke trigger on table "public"."storage_analytics" from "anon";

revoke truncate on table "public"."storage_analytics" from "anon";

revoke update on table "public"."storage_analytics" from "anon";

revoke delete on table "public"."storage_analytics" from "authenticated";

revoke insert on table "public"."storage_analytics" from "authenticated";

revoke references on table "public"."storage_analytics" from "authenticated";

revoke select on table "public"."storage_analytics" from "authenticated";

revoke trigger on table "public"."storage_analytics" from "authenticated";

revoke truncate on table "public"."storage_analytics" from "authenticated";

revoke update on table "public"."storage_analytics" from "authenticated";

revoke delete on table "public"."storage_analytics" from "service_role";

revoke insert on table "public"."storage_analytics" from "service_role";

revoke references on table "public"."storage_analytics" from "service_role";

revoke select on table "public"."storage_analytics" from "service_role";

revoke trigger on table "public"."storage_analytics" from "service_role";

revoke truncate on table "public"."storage_analytics" from "service_role";

revoke update on table "public"."storage_analytics" from "service_role";

revoke delete on table "public"."storage_compartments" from "anon";

revoke insert on table "public"."storage_compartments" from "anon";

revoke references on table "public"."storage_compartments" from "anon";

revoke select on table "public"."storage_compartments" from "anon";

revoke trigger on table "public"."storage_compartments" from "anon";

revoke truncate on table "public"."storage_compartments" from "anon";

revoke update on table "public"."storage_compartments" from "anon";

revoke delete on table "public"."storage_compartments" from "authenticated";

revoke insert on table "public"."storage_compartments" from "authenticated";

revoke references on table "public"."storage_compartments" from "authenticated";

revoke select on table "public"."storage_compartments" from "authenticated";

revoke trigger on table "public"."storage_compartments" from "authenticated";

revoke truncate on table "public"."storage_compartments" from "authenticated";

revoke update on table "public"."storage_compartments" from "authenticated";

revoke delete on table "public"."storage_compartments" from "service_role";

revoke insert on table "public"."storage_compartments" from "service_role";

revoke references on table "public"."storage_compartments" from "service_role";

revoke select on table "public"."storage_compartments" from "service_role";

revoke trigger on table "public"."storage_compartments" from "service_role";

revoke truncate on table "public"."storage_compartments" from "service_role";

revoke update on table "public"."storage_compartments" from "service_role";

revoke delete on table "public"."storage_images" from "anon";

revoke insert on table "public"."storage_images" from "anon";

revoke references on table "public"."storage_images" from "anon";

revoke select on table "public"."storage_images" from "anon";

revoke trigger on table "public"."storage_images" from "anon";

revoke truncate on table "public"."storage_images" from "anon";

revoke update on table "public"."storage_images" from "anon";

revoke delete on table "public"."storage_images" from "authenticated";

revoke insert on table "public"."storage_images" from "authenticated";

revoke references on table "public"."storage_images" from "authenticated";

revoke select on table "public"."storage_images" from "authenticated";

revoke trigger on table "public"."storage_images" from "authenticated";

revoke truncate on table "public"."storage_images" from "authenticated";

revoke update on table "public"."storage_images" from "authenticated";

revoke delete on table "public"."storage_images" from "service_role";

revoke insert on table "public"."storage_images" from "service_role";

revoke references on table "public"."storage_images" from "service_role";

revoke select on table "public"."storage_images" from "service_role";

revoke trigger on table "public"."storage_images" from "service_role";

revoke truncate on table "public"."storage_images" from "service_role";

revoke update on table "public"."storage_images" from "service_role";

revoke delete on table "public"."storage_item_images" from "anon";

revoke insert on table "public"."storage_item_images" from "anon";

revoke references on table "public"."storage_item_images" from "anon";

revoke select on table "public"."storage_item_images" from "anon";

revoke trigger on table "public"."storage_item_images" from "anon";

revoke truncate on table "public"."storage_item_images" from "anon";

revoke update on table "public"."storage_item_images" from "anon";

revoke delete on table "public"."storage_item_images" from "authenticated";

revoke insert on table "public"."storage_item_images" from "authenticated";

revoke references on table "public"."storage_item_images" from "authenticated";

revoke select on table "public"."storage_item_images" from "authenticated";

revoke trigger on table "public"."storage_item_images" from "authenticated";

revoke truncate on table "public"."storage_item_images" from "authenticated";

revoke update on table "public"."storage_item_images" from "authenticated";

revoke delete on table "public"."storage_item_images" from "service_role";

revoke insert on table "public"."storage_item_images" from "service_role";

revoke references on table "public"."storage_item_images" from "service_role";

revoke select on table "public"."storage_item_images" from "service_role";

revoke trigger on table "public"."storage_item_images" from "service_role";

revoke truncate on table "public"."storage_item_images" from "service_role";

revoke update on table "public"."storage_item_images" from "service_role";

revoke delete on table "public"."storage_item_tags" from "anon";

revoke insert on table "public"."storage_item_tags" from "anon";

revoke references on table "public"."storage_item_tags" from "anon";

revoke select on table "public"."storage_item_tags" from "anon";

revoke trigger on table "public"."storage_item_tags" from "anon";

revoke truncate on table "public"."storage_item_tags" from "anon";

revoke update on table "public"."storage_item_tags" from "anon";

revoke delete on table "public"."storage_item_tags" from "authenticated";

revoke insert on table "public"."storage_item_tags" from "authenticated";

revoke references on table "public"."storage_item_tags" from "authenticated";

revoke select on table "public"."storage_item_tags" from "authenticated";

revoke trigger on table "public"."storage_item_tags" from "authenticated";

revoke truncate on table "public"."storage_item_tags" from "authenticated";

revoke update on table "public"."storage_item_tags" from "authenticated";

revoke delete on table "public"."storage_item_tags" from "service_role";

revoke insert on table "public"."storage_item_tags" from "service_role";

revoke references on table "public"."storage_item_tags" from "service_role";

revoke select on table "public"."storage_item_tags" from "service_role";

revoke trigger on table "public"."storage_item_tags" from "service_role";

revoke truncate on table "public"."storage_item_tags" from "service_role";

revoke update on table "public"."storage_item_tags" from "service_role";

revoke delete on table "public"."storage_items" from "anon";

revoke insert on table "public"."storage_items" from "anon";

revoke references on table "public"."storage_items" from "anon";

revoke select on table "public"."storage_items" from "anon";

revoke trigger on table "public"."storage_items" from "anon";

revoke truncate on table "public"."storage_items" from "anon";

revoke update on table "public"."storage_items" from "anon";

revoke delete on table "public"."storage_items" from "authenticated";

revoke insert on table "public"."storage_items" from "authenticated";

revoke references on table "public"."storage_items" from "authenticated";

revoke select on table "public"."storage_items" from "authenticated";

revoke trigger on table "public"."storage_items" from "authenticated";

revoke truncate on table "public"."storage_items" from "authenticated";

revoke update on table "public"."storage_items" from "authenticated";

revoke delete on table "public"."storage_items" from "service_role";

revoke insert on table "public"."storage_items" from "service_role";

revoke references on table "public"."storage_items" from "service_role";

revoke select on table "public"."storage_items" from "service_role";

revoke trigger on table "public"."storage_items" from "service_role";

revoke truncate on table "public"."storage_items" from "service_role";

revoke update on table "public"."storage_items" from "service_role";

revoke delete on table "public"."storage_locations" from "anon";

revoke insert on table "public"."storage_locations" from "anon";

revoke references on table "public"."storage_locations" from "anon";

revoke select on table "public"."storage_locations" from "anon";

revoke trigger on table "public"."storage_locations" from "anon";

revoke truncate on table "public"."storage_locations" from "anon";

revoke update on table "public"."storage_locations" from "anon";

revoke delete on table "public"."storage_locations" from "authenticated";

revoke insert on table "public"."storage_locations" from "authenticated";

revoke references on table "public"."storage_locations" from "authenticated";

revoke select on table "public"."storage_locations" from "authenticated";

revoke trigger on table "public"."storage_locations" from "authenticated";

revoke truncate on table "public"."storage_locations" from "authenticated";

revoke update on table "public"."storage_locations" from "authenticated";

revoke delete on table "public"."storage_locations" from "service_role";

revoke insert on table "public"."storage_locations" from "service_role";

revoke references on table "public"."storage_locations" from "service_role";

revoke select on table "public"."storage_locations" from "service_role";

revoke trigger on table "public"."storage_locations" from "service_role";

revoke truncate on table "public"."storage_locations" from "service_role";

revoke update on table "public"."storage_locations" from "service_role";

revoke delete on table "public"."storage_working_hours" from "anon";

revoke insert on table "public"."storage_working_hours" from "anon";

revoke references on table "public"."storage_working_hours" from "anon";

revoke select on table "public"."storage_working_hours" from "anon";

revoke trigger on table "public"."storage_working_hours" from "anon";

revoke truncate on table "public"."storage_working_hours" from "anon";

revoke update on table "public"."storage_working_hours" from "anon";

revoke delete on table "public"."storage_working_hours" from "authenticated";

revoke insert on table "public"."storage_working_hours" from "authenticated";

revoke references on table "public"."storage_working_hours" from "authenticated";

revoke select on table "public"."storage_working_hours" from "authenticated";

revoke trigger on table "public"."storage_working_hours" from "authenticated";

revoke truncate on table "public"."storage_working_hours" from "authenticated";

revoke update on table "public"."storage_working_hours" from "authenticated";

revoke delete on table "public"."storage_working_hours" from "service_role";

revoke insert on table "public"."storage_working_hours" from "service_role";

revoke references on table "public"."storage_working_hours" from "service_role";

revoke select on table "public"."storage_working_hours" from "service_role";

revoke trigger on table "public"."storage_working_hours" from "service_role";

revoke truncate on table "public"."storage_working_hours" from "service_role";

revoke update on table "public"."storage_working_hours" from "service_role";

revoke delete on table "public"."tags" from "anon";

revoke insert on table "public"."tags" from "anon";

revoke references on table "public"."tags" from "anon";

revoke select on table "public"."tags" from "anon";

revoke trigger on table "public"."tags" from "anon";

revoke truncate on table "public"."tags" from "anon";

revoke update on table "public"."tags" from "anon";

revoke delete on table "public"."tags" from "authenticated";

revoke insert on table "public"."tags" from "authenticated";

revoke references on table "public"."tags" from "authenticated";

revoke select on table "public"."tags" from "authenticated";

revoke trigger on table "public"."tags" from "authenticated";

revoke truncate on table "public"."tags" from "authenticated";

revoke update on table "public"."tags" from "authenticated";

revoke delete on table "public"."tags" from "service_role";

revoke insert on table "public"."tags" from "service_role";

revoke references on table "public"."tags" from "service_role";

revoke select on table "public"."tags" from "service_role";

revoke trigger on table "public"."tags" from "service_role";

revoke truncate on table "public"."tags" from "service_role";

revoke update on table "public"."tags" from "service_role";

revoke delete on table "public"."test" from "anon";

revoke insert on table "public"."test" from "anon";

revoke references on table "public"."test" from "anon";

revoke select on table "public"."test" from "anon";

revoke trigger on table "public"."test" from "anon";

revoke truncate on table "public"."test" from "anon";

revoke update on table "public"."test" from "anon";

revoke delete on table "public"."test" from "authenticated";

revoke insert on table "public"."test" from "authenticated";

revoke references on table "public"."test" from "authenticated";

revoke select on table "public"."test" from "authenticated";

revoke trigger on table "public"."test" from "authenticated";

revoke truncate on table "public"."test" from "authenticated";

revoke update on table "public"."test" from "authenticated";

revoke delete on table "public"."test" from "service_role";

revoke insert on table "public"."test" from "service_role";

revoke references on table "public"."test" from "service_role";

revoke select on table "public"."test" from "service_role";

revoke trigger on table "public"."test" from "service_role";

revoke truncate on table "public"."test" from "service_role";

revoke update on table "public"."test" from "service_role";

revoke delete on table "public"."test_features" from "anon";

revoke insert on table "public"."test_features" from "anon";

revoke references on table "public"."test_features" from "anon";

revoke select on table "public"."test_features" from "anon";

revoke trigger on table "public"."test_features" from "anon";

revoke truncate on table "public"."test_features" from "anon";

revoke update on table "public"."test_features" from "anon";

revoke delete on table "public"."test_features" from "authenticated";

revoke insert on table "public"."test_features" from "authenticated";

revoke references on table "public"."test_features" from "authenticated";

revoke select on table "public"."test_features" from "authenticated";

revoke trigger on table "public"."test_features" from "authenticated";

revoke truncate on table "public"."test_features" from "authenticated";

revoke update on table "public"."test_features" from "authenticated";

revoke delete on table "public"."test_features" from "service_role";

revoke insert on table "public"."test_features" from "service_role";

revoke references on table "public"."test_features" from "service_role";

revoke select on table "public"."test_features" from "service_role";

revoke trigger on table "public"."test_features" from "service_role";

revoke truncate on table "public"."test_features" from "service_role";

revoke update on table "public"."test_features" from "service_role";

revoke delete on table "public"."user_addresses" from "anon";

revoke insert on table "public"."user_addresses" from "anon";

revoke references on table "public"."user_addresses" from "anon";

revoke select on table "public"."user_addresses" from "anon";

revoke trigger on table "public"."user_addresses" from "anon";

revoke truncate on table "public"."user_addresses" from "anon";

revoke update on table "public"."user_addresses" from "anon";

revoke delete on table "public"."user_addresses" from "authenticated";

revoke insert on table "public"."user_addresses" from "authenticated";

revoke references on table "public"."user_addresses" from "authenticated";

revoke select on table "public"."user_addresses" from "authenticated";

revoke trigger on table "public"."user_addresses" from "authenticated";

revoke truncate on table "public"."user_addresses" from "authenticated";

revoke update on table "public"."user_addresses" from "authenticated";

revoke delete on table "public"."user_addresses" from "service_role";

revoke insert on table "public"."user_addresses" from "service_role";

revoke references on table "public"."user_addresses" from "service_role";

revoke select on table "public"."user_addresses" from "service_role";

revoke trigger on table "public"."user_addresses" from "service_role";

revoke truncate on table "public"."user_addresses" from "service_role";

revoke update on table "public"."user_addresses" from "service_role";

revoke delete on table "public"."user_ban_history" from "anon";

revoke insert on table "public"."user_ban_history" from "anon";

revoke references on table "public"."user_ban_history" from "anon";

revoke select on table "public"."user_ban_history" from "anon";

revoke trigger on table "public"."user_ban_history" from "anon";

revoke truncate on table "public"."user_ban_history" from "anon";

revoke update on table "public"."user_ban_history" from "anon";

revoke delete on table "public"."user_ban_history" from "authenticated";

revoke insert on table "public"."user_ban_history" from "authenticated";

revoke references on table "public"."user_ban_history" from "authenticated";

revoke select on table "public"."user_ban_history" from "authenticated";

revoke trigger on table "public"."user_ban_history" from "authenticated";

revoke truncate on table "public"."user_ban_history" from "authenticated";

revoke update on table "public"."user_ban_history" from "authenticated";

revoke delete on table "public"."user_ban_history" from "service_role";

revoke insert on table "public"."user_ban_history" from "service_role";

revoke references on table "public"."user_ban_history" from "service_role";

revoke select on table "public"."user_ban_history" from "service_role";

revoke trigger on table "public"."user_ban_history" from "service_role";

revoke truncate on table "public"."user_ban_history" from "service_role";

revoke update on table "public"."user_ban_history" from "service_role";

revoke delete on table "public"."user_organization_roles" from "anon";

revoke insert on table "public"."user_organization_roles" from "anon";

revoke references on table "public"."user_organization_roles" from "anon";

revoke select on table "public"."user_organization_roles" from "anon";

revoke trigger on table "public"."user_organization_roles" from "anon";

revoke truncate on table "public"."user_organization_roles" from "anon";

revoke update on table "public"."user_organization_roles" from "anon";

revoke delete on table "public"."user_organization_roles" from "authenticated";

revoke insert on table "public"."user_organization_roles" from "authenticated";

revoke references on table "public"."user_organization_roles" from "authenticated";

revoke select on table "public"."user_organization_roles" from "authenticated";

revoke trigger on table "public"."user_organization_roles" from "authenticated";

revoke truncate on table "public"."user_organization_roles" from "authenticated";

revoke update on table "public"."user_organization_roles" from "authenticated";

revoke delete on table "public"."user_organization_roles" from "service_role";

revoke insert on table "public"."user_organization_roles" from "service_role";

revoke references on table "public"."user_organization_roles" from "service_role";

revoke select on table "public"."user_organization_roles" from "service_role";

revoke trigger on table "public"."user_organization_roles" from "service_role";

revoke truncate on table "public"."user_organization_roles" from "service_role";

revoke update on table "public"."user_organization_roles" from "service_role";

revoke delete on table "public"."user_profiles" from "anon";

revoke insert on table "public"."user_profiles" from "anon";

revoke references on table "public"."user_profiles" from "anon";

revoke select on table "public"."user_profiles" from "anon";

revoke trigger on table "public"."user_profiles" from "anon";

revoke truncate on table "public"."user_profiles" from "anon";

revoke update on table "public"."user_profiles" from "anon";

revoke delete on table "public"."user_profiles" from "authenticated";

revoke insert on table "public"."user_profiles" from "authenticated";

revoke references on table "public"."user_profiles" from "authenticated";

revoke select on table "public"."user_profiles" from "authenticated";

revoke trigger on table "public"."user_profiles" from "authenticated";

revoke truncate on table "public"."user_profiles" from "authenticated";

revoke update on table "public"."user_profiles" from "authenticated";

revoke delete on table "public"."user_profiles" from "service_role";

revoke insert on table "public"."user_profiles" from "service_role";

revoke references on table "public"."user_profiles" from "service_role";

revoke select on table "public"."user_profiles" from "service_role";

revoke trigger on table "public"."user_profiles" from "service_role";

revoke truncate on table "public"."user_profiles" from "service_role";

revoke update on table "public"."user_profiles" from "service_role";

revoke delete on table "public"."user_roles" from "anon";

revoke insert on table "public"."user_roles" from "anon";

revoke references on table "public"."user_roles" from "anon";

revoke select on table "public"."user_roles" from "anon";

revoke trigger on table "public"."user_roles" from "anon";

revoke truncate on table "public"."user_roles" from "anon";

revoke update on table "public"."user_roles" from "anon";

revoke delete on table "public"."user_roles" from "authenticated";

revoke insert on table "public"."user_roles" from "authenticated";

revoke references on table "public"."user_roles" from "authenticated";

revoke select on table "public"."user_roles" from "authenticated";

revoke trigger on table "public"."user_roles" from "authenticated";

revoke truncate on table "public"."user_roles" from "authenticated";

revoke update on table "public"."user_roles" from "authenticated";

revoke delete on table "public"."user_roles" from "service_role";

revoke insert on table "public"."user_roles" from "service_role";

revoke references on table "public"."user_roles" from "service_role";

revoke select on table "public"."user_roles" from "service_role";

revoke trigger on table "public"."user_roles" from "service_role";

revoke truncate on table "public"."user_roles" from "service_role";

revoke update on table "public"."user_roles" from "service_role";

alter table "public"."audit_logs" drop constraint "audit_logs_action_check";

alter table "public"."payments" drop constraint "payments_payment_method_check";

alter table "public"."payments" drop constraint "payments_status_check";

alter table "public"."promotions" drop constraint "promotions_discount_type_check";

alter table "public"."storage_images" drop constraint "storage_images_image_type_check";

alter table "public"."storage_item_images" drop constraint "storage_item_images_image_type_check";

alter table "public"."storage_working_hours" drop constraint "storage_working_hours_day_check";

alter table "public"."user_addresses" drop constraint "user_addresses_address_type_check";

alter table "public"."user_ban_history" drop constraint "user_ban_history_action_check";

alter table "public"."user_ban_history" drop constraint "user_ban_history_ban_type_check";

drop function if exists "public"."update_test_metadata"();

alter table "public"."audit_logs" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."booking_items" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."bookings" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."organization_items" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."organization_locations" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."organizations" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."payments" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."promotions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."reviews" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."roles" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."saved_list_items" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."saved_lists" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."storage_analytics" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."storage_compartments" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."storage_images" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."storage_item_images" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."storage_item_tags" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."storage_items" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."storage_locations" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."storage_working_hours" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."tags" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."test_features" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."user_addresses" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."user_ban_history" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."user_organization_roles" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."audit_logs" add constraint "audit_logs_action_check" CHECK (((action)::text = ANY ((ARRAY['insert'::character varying, 'update'::character varying, 'delete'::character varying])::text[]))) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_action_check";

alter table "public"."payments" add constraint "payments_payment_method_check" CHECK (((payment_method)::text = ANY ((ARRAY['credit_card'::character varying, 'bank_transfer'::character varying, 'cash'::character varying, 'paypal'::character varying])::text[]))) not valid;

alter table "public"."payments" validate constraint "payments_payment_method_check";

alter table "public"."payments" add constraint "payments_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[]))) not valid;

alter table "public"."payments" validate constraint "payments_status_check";

alter table "public"."promotions" add constraint "promotions_discount_type_check" CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed_amount'::character varying])::text[]))) not valid;

alter table "public"."promotions" validate constraint "promotions_discount_type_check";

alter table "public"."storage_images" add constraint "storage_images_image_type_check" CHECK (((image_type)::text = ANY ((ARRAY['main'::character varying, 'thumbnail'::character varying, 'detail'::character varying])::text[]))) not valid;

alter table "public"."storage_images" validate constraint "storage_images_image_type_check";

alter table "public"."storage_item_images" add constraint "storage_item_images_image_type_check" CHECK (((image_type)::text = ANY ((ARRAY['main'::character varying, 'thumbnail'::character varying, 'detail'::character varying])::text[]))) not valid;

alter table "public"."storage_item_images" validate constraint "storage_item_images_image_type_check";

alter table "public"."storage_working_hours" add constraint "storage_working_hours_day_check" CHECK (((day)::text = ANY ((ARRAY['monday'::character varying, 'tuesday'::character varying, 'wednesday'::character varying, 'thursday'::character varying, 'friday'::character varying, 'saturday'::character varying, 'sunday'::character varying])::text[]))) not valid;

alter table "public"."storage_working_hours" validate constraint "storage_working_hours_day_check";

alter table "public"."user_addresses" add constraint "user_addresses_address_type_check" CHECK (((address_type)::text = ANY ((ARRAY['billing'::character varying, 'shipping'::character varying, 'both'::character varying])::text[]))) not valid;

alter table "public"."user_addresses" validate constraint "user_addresses_address_type_check";

alter table "public"."user_ban_history" add constraint "user_ban_history_action_check" CHECK (((action)::text = ANY ((ARRAY['banned'::character varying, 'unbanned'::character varying])::text[]))) not valid;

alter table "public"."user_ban_history" validate constraint "user_ban_history_action_check";

alter table "public"."user_ban_history" add constraint "user_ban_history_ban_type_check" CHECK (((ban_type)::text = ANY ((ARRAY['banForRole'::character varying, 'banForOrg'::character varying, 'banForApp'::character varying])::text[]))) not valid;

alter table "public"."user_ban_history" validate constraint "user_ban_history_ban_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user from our function instead of directly using auth.uid()
  current_user_id := public.get_request_user_id();
  
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, old_values, new_values
    ) VALUES (
      TG_TABLE_NAME::text, NEW.id, 'update', current_user_id, to_jsonb(OLD.*), to_jsonb(NEW.*)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, new_values
    ) VALUES (
      TG_TABLE_NAME::text, NEW.id, 'insert', current_user_id, to_jsonb(NEW.*)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, old_values
    ) VALUES (
      TG_TABLE_NAME::text, OLD.id, 'delete', current_user_id, to_jsonb(OLD.*)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_average_rating()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Handle DELETE operation differently
  IF TG_OP = 'DELETE' THEN
    UPDATE storage_items
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE item_id = OLD.item_id
    )
    WHERE id = OLD.item_id;
    RETURN OLD;
  ELSE
    UPDATE storage_items
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE item_id = NEW.item_id
    )
    WHERE id = NEW.item_id;
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in calculate_average_rating: %', SQLERRM;
    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_storage_item_total(item_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(owned_quantity)
     FROM public.organization_items
     WHERE storage_item_id = item_id
     AND is_active = TRUE),
    0
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_item_images()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'item-images'
    -- metadata->>'is_active' is stored as text, so cast it to boolean
    AND is_active = FALSE
    AND created_at < NOW() - INTERVAL '30 days';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type notification_type, p_title text, p_message text DEFAULT NULL::text, p_channel notification_channel DEFAULT 'in_app'::notification_channel, p_severity notification_severity DEFAULT 'info'::notification_severity, p_metadata jsonb DEFAULT '{}'::jsonb, p_idempotency_key text DEFAULT gen_random_uuid())
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.notifications (
    user_id, type, title, message,
    channel, severity, metadata, idempotency_key
  )
  values (
    p_user_id, p_type, p_title, p_message,
    p_channel, p_severity, p_metadata, p_idempotency_key
  )
  on conflict (idempotency_key) do nothing; -- exactly-once
end;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_organization_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Generate slug from name
  NEW.slug := generate_slug(NEW.name);
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(input_text),
        '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special characters
      ),
      '\s+', '-', 'g'  -- Replace spaces with hyphens
    )
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_full_bookings(in_offset integer, in_limit integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$declare
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  total_count integer;
  result jsonb;
begin
  -- Count total bookings
  select count(*) into total_count
  from bookings;

  -- Build JSON result
  select jsonb_build_object(
    'total_count', total_count,
    'bookings', coalesce(jsonb_agg(booking_data), '[]'::jsonb)
  )
  into result
  from (
    select jsonb_build_object(
      'id', o.id,
      'booking_number', o.booking_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'booking_items', (
        select jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'booking_id', oi.booking_id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
            'created_at', oi.created_at,
            'storage_items', jsonb_build_object(
              'translations', si.translations,
              'location_id', si.location_id
            )
          )
        )
        from booking_items oi
        left join storage_items si on oi.item_id = si.id
        where oi.booking_id = o.id
      )
    ) as booking_data
    from bookings o
    order by o.created_at desc
    offset safe_offset
    limit safe_limit
  ) t;

  return result;
end;$function$
;

CREATE OR REPLACE FUNCTION public.get_all_full_orders(in_offset integer DEFAULT 0, in_limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
declare
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  total_count integer;
  result jsonb;
begin
  -- Count total orders
  select count(*) into total_count
  from orders;

  -- Build JSON result
  select jsonb_build_object(
    'total_count', total_count,
    'orders', coalesce(jsonb_agg(order_data), '[]'::jsonb)
  )
  into result
  from (
    select jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'order_items', (
        select jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'order_id', oi.order_id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
            'created_at', oi.created_at,
            'storage_items', jsonb_build_object(
              'translations', si.translations,
              'location_id', si.location_id
            )
          )
        )
        from order_items oi
        left join storage_items si on oi.item_id = si.id
        where oi.order_id = o.id
      )
    ) as order_data
    from orders o
    order by o.created_at desc
    offset safe_offset
    limit safe_limit
  ) t;

  return result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_full_booking(booking_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$declare
  result jsonb;
begin
  select jsonb_build_object(
    'bookings', jsonb_build_object(
      'id', o.id,
      'booking_number', o.booking_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'booking_items', (
        select jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
            'created_at', oi.created_at,
            'location_id', oi.location_id,
            'translations', si.translations,
            'location_name', sl.name
          )
        )
        from booking_items oi
        left join storage_items si on oi.item_id = si.id
        left join storage_locations sl on si.location_id = sl.id
        where oi.booking_id = o.id
      )
    ),
    'user_profile', (
      select jsonb_build_object(
        'full_name', u.full_name,
        'email', u.email
      )
      from user_profiles u
      where u.id = o.user_id
    )
  )
  into result
  from bookings o
  where o.id = booking_id;

  -- Raise error if result is null
  if result is null then
    raise exception 'No booking found with id: %', booking_id;
  end if;

  return result;
end;$function$
;

CREATE OR REPLACE FUNCTION public.get_full_order(order_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$declare
  result jsonb;
begin
  select jsonb_build_object(
    'orders', jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'order_items', (
        select jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
            'created_at', oi.created_at,
            'location_id', oi.location_id,
            'translations', si.translations,
            'location_name', sl.name
          )
        )
        from order_items oi
        left join storage_items si on oi.item_id = si.id
        left join storage_locations sl on si.location_id = sl.id
        where oi.order_id = o.id
      )
    ),
    'user_profile', (
      select jsonb_build_object(
        'full_name', u.full_name,
        'email', u.email
      )
      from user_profiles u
      where u.id = o.user_id
    )
  )
  into result
  from orders o
  where o.id = order_id;

  -- Raise error if result is null
  if result is null then
    raise exception 'No order found with id: %', order_id;
  end if;

  return result;
end;$function$
;

CREATE OR REPLACE FUNCTION public.get_full_user_booking(in_user_id uuid, in_offset integer, in_limit integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$declare
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  result jsonb;
  total_count integer;
begin
  -- Get total count of user's bookings
  select count(*) into total_count
  from bookings
  where user_id = in_user_id;

  -- Get paginated bookings with safe offset & limit
  select jsonb_build_object(
    'total_count', total_count,
    'bookings', coalesce(jsonb_agg(booking_data), '[]'::jsonb)
  )
  into result
  from (
    select jsonb_build_object(
      'id', o.id,
      'booking_number', o.booking_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'booking_items', (
        select jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'booking_id', oi.booking_id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
            'created_at', oi.created_at,
            'storage_items', jsonb_build_object(
              'translations', si.translations,
              'location_id', si.location_id
            )
          )
        )
        from booking_items oi
        left join storage_items si on oi.item_id = si.id
        where oi.booking_id = o.id
      )
    ) as booking_data
    from bookings o
    where o.user_id = in_user_id
    order by o.created_at desc
    offset safe_offset
    limit safe_limit
  ) t;

  return result;
end;$function$
;

CREATE OR REPLACE FUNCTION public.get_full_user_order(in_user_id uuid, in_offset integer DEFAULT 0, in_limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
declare
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  result jsonb;
  total_count integer;
begin
  -- Get total count of user's orders
  select count(*) into total_count
  from orders
  where user_id = in_user_id;

  -- Get paginated orders with safe offset & limit
  select jsonb_build_object(
    'total_count', total_count,
    'orders', coalesce(jsonb_agg(order_data), '[]'::jsonb)
  )
  into result
  from (
    select jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'order_items', (
        select jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'order_id', oi.order_id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
            'created_at', oi.created_at,
            'storage_items', jsonb_build_object(
              'translations', si.translations,
              'location_id', si.location_id
            )
          )
        )
        from order_items oi
        left join storage_items si on oi.item_id = si.id
        where oi.order_id = o.id
      )
    ) as order_data
    from orders o
    where o.user_id = in_user_id
    order by o.created_at desc
    offset safe_offset
    limit safe_limit
  ) t;

  return result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_latest_ban_record(check_user_id uuid)
 RETURNS TABLE(id uuid, ban_type character varying, action character varying, ban_reason text, is_permanent boolean, banned_by uuid, banned_at timestamp with time zone, unbanned_at timestamp with time zone, organization_id uuid, role_assignment_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ubh.id,
    ubh.ban_type,
    ubh.action,
    ubh.ban_reason,
    ubh.is_permanent,
    ubh.banned_by,
    ubh.banned_at,
    ubh.unbanned_at,
    ubh.organization_id,
    ubh.role_assignment_id
  FROM user_ban_history ubh
  WHERE ubh.user_id = check_user_id
  ORDER BY ubh.created_at DESC
  LIMIT 1;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_request_user_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select current_setting('request.jwt.claim.sub', true)::uuid;
$function$
;

CREATE OR REPLACE FUNCTION public.get_table_columns(input_table_name text)
 RETURNS TABLE(column_name text, data_type text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return query
  select 
    c.column_name::text, 
    c.data_type::text
  from information_schema.columns c
  where c.table_name = input_table_name
  order by c.ordinal_position;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid uuid)
 RETURNS TABLE(id uuid, user_id uuid, organization_id uuid, role_id uuid, is_active boolean, created_at timestamp with time zone, role_name text, organization_name text, organization_slug text)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT 
    uor.id,
    uor.user_id,
    uor.organization_id,
    uor.role_id,
    uor.is_active,
    uor.created_at,
    r.role as role_name,
    o.name as organization_name,
    o.slug as organization_slug
  FROM user_organization_roles uor
  INNER JOIN roles r ON uor.role_id = r.id
  INNER JOIN organizations o ON uor.organization_id = o.id
  WHERE uor.user_id = user_uuid
    AND uor.is_active = true
  ORDER BY uor.created_at DESC;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid, p_org_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.user_id   = p_user_id
      and uor.is_active = true
      and r.role        = 'admin'           -- ⚠️ make sure the literal matches your roles_type enum
      and (p_org_id is null or uor.organization_id = p_org_id)
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_user_banned_for_app(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_organization_roles 
    WHERE user_id = check_user_id 
      AND is_active = TRUE
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_user_banned_for_org(check_user_id uuid, check_org_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_organization_roles 
    WHERE user_id = check_user_id 
      AND organization_id = check_org_id 
      AND is_active = TRUE
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_user_banned_for_role(check_user_id uuid, check_org_id uuid, check_role_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_organization_roles 
    WHERE user_id = check_user_id 
      AND organization_id = check_org_id 
      AND role_id = check_role_id 
      AND is_active = FALSE
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify(p_user_id uuid, p_type_txt text, p_title text DEFAULT ''::text, p_message text DEFAULT ''::text, p_channel notification_channel DEFAULT 'in_app'::notification_channel, p_severity notification_severity DEFAULT 'info'::notification_severity, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select public.create_notification(
    p_user_id,
    p_type_txt::notification_type,  -- single cast lives here
    p_title,
    p_message,
    p_channel,
    p_severity,
    p_metadata
  );
$function$
;

CREATE OR REPLACE FUNCTION public.trg_booking_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.status is distinct from old.status then
    perform public.create_notification(
      new.user_id,

      case
        when new.status = 'confirmed'
          then 'booking.status_approved'::notification_type
        when new.status = 'rejected'
          then 'booking.status_rejected'::notification_type
      end,

      '', '',                                -- titles/messages from UI
      'in_app'::notification_channel,        -- 👈 explicit cast
      (case                                   -- 👈 cast both branches
         when new.status = 'confirmed'
         then 'info'::notification_severity
         else 'warning'::notification_severity
       end),
      jsonb_build_object(
        'booking_id',     new.id,
        'booking_number', new.booking_number,
        'status',         new.status
      )
    );
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.trg_user_after_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  admin_id uuid;
begin
  for admin_id in
    select distinct uor.user_id
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where r.role = 'admin' and uor.is_active
  loop
    perform public.create_notification(
      admin_id,
      'user.created'::notification_type,
      '', '',
      'in_app'::notification_channel,        -- 👈 cast
      'info'::notification_severity,         -- 👈 cast
      jsonb_build_object(
        'new_user_id', new.id,
        'email',       new.email
      )
    );
  end loop;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_booking_amounts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$DECLARE
  total_sum DECIMAL;
BEGIN
  -- Handle DELETE operation differently
  IF TG_OP = 'DELETE' THEN
    SELECT COALESCE(SUM(subtotal), 0) INTO total_sum
    FROM booking_items
    WHERE booking_id = OLD.booking_id;
    
    UPDATE bookings
    SET 
      total_amount = total_sum,
      final_amount = total_sum - COALESCE(discount_amount, 0)
    WHERE id = OLD.booking_id;
    RETURN OLD;
  ELSE
    SELECT COALESCE(SUM(subtotal), 0) INTO total_sum
    FROM booking_items
    WHERE booking_id = NEW.booking_id;
    
    UPDATE bookings
    SET
      total_amount = total_sum,
      final_amount = total_sum - COALESCE(discount_amount, 0)
    WHERE id = NEW.booking_id;
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in update_booking_amounts: %', SQLERRM;
    RETURN NULL;
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_item_availability()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  RAISE WARNING 'Trigger fired. Operation: %', TG_OP;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    RAISE WARNING 'NEW.status: %, OLD.status: %', NEW.status, OLD.status;

    -- Wenn Bestellung bestätigt wird
    IF NEW.status = 'picked_up' AND (OLD.status IS DISTINCT FROM 'picked_up') THEN
      RAISE WARNING 'Confirmed item. Subtracting quantity % from item_id %', NEW.quantity, NEW.item_id;

      UPDATE storage_items
      SET items_number_available = items_number_available - NEW.quantity
      WHERE id = NEW.item_id AND items_number_available >= NEW.quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Not enough available items for storage item %', NEW.item_id;
      END IF;
    END IF;

    -- Wenn Bestellung auf 'cancelled' wechselt und vorher NICHT 'cancelled' war
    IF NEW.status = 'returned' AND (OLD.status IS DISTINCT FROM 'returned') THEN
      RAISE WARNING 'Cancelled item. Adding quantity % back to item_id %', NEW.quantity, NEW.item_id;

      UPDATE storage_items
      SET items_number_available = items_number_available + NEW.quantity
      WHERE id = NEW.item_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    RAISE WARNING 'Deleted item. Adding quantity % back to item_id %', OLD.quantity, OLD.item_id;

    UPDATE storage_items
    SET items_number_available = items_number_available + OLD.quantity
    WHERE id = OLD.item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Trigger error: %', SQLERRM;
    RETURN NULL;
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_storage_item_totals()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.storage_items
    SET items_number_total = calculate_storage_item_total(NEW.storage_item_id)
    WHERE id = NEW.storage_item_id;
  END IF;

  -- Handle DELETE and UPDATE (when storage_item_id changes)
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.storage_item_id != NEW.storage_item_id) THEN
    UPDATE public.storage_items
    SET items_number_total = calculate_storage_item_total(OLD.storage_item_id)
    WHERE id = OLD.storage_item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

create or replace view "public"."view_manage_storage_items" as  SELECT ((s.translations -> 'fi'::text) ->> 'item_name'::text) AS fi_item_name,
    ((s.translations -> 'fi'::text) ->> 'item_type'::text) AS fi_item_type,
    ((s.translations -> 'en'::text) ->> 'item_name'::text) AS en_item_name,
    ((s.translations -> 'en'::text) ->> 'item_type'::text) AS en_item_type,
    s.translations,
    o.storage_item_id AS id,
    s.items_number_total,
    s.price,
    s.created_at,
    s.is_active,
    s.location_id,
    l.name AS location_name,
    array_agg(t.tag_id) AS tag_ids,
    array_agg(g.translations) AS tag_translations,
    s.items_number_currently_in_storage,
    o.is_deleted,
    o.id AS organization_id
   FROM ((((organization_items o
     JOIN storage_items s ON ((o.storage_item_id = s.id)))
     JOIN storage_locations l ON ((s.location_id = l.id)))
     LEFT JOIN storage_item_tags t ON ((s.id = t.item_id)))
     LEFT JOIN tags g ON ((t.tag_id = g.id)))
  GROUP BY s.id, s.translations, s.items_number_total, s.price, s.is_active, l.name, s.items_number_currently_in_storage, o.is_deleted, o.id;




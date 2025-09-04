-- Storage Policies Migration (Production Only)
-- This file contains storage schema changes that cannot be applied to preview branches
-- Apply this migration directly to production environment only

-- Remove deprecated iceberg tables and their permissions
revoke select on table "storage"."iceberg_namespaces" from "anon";
revoke select on table "storage"."iceberg_namespaces" from "authenticated";
revoke delete on table "storage"."iceberg_namespaces" from "service_role";
revoke insert on table "storage"."iceberg_namespaces" from "service_role";
revoke references on table "storage"."iceberg_namespaces" from "service_role";
revoke select on table "storage"."iceberg_namespaces" from "service_role";
revoke trigger on table "storage"."iceberg_namespaces" from "service_role";
revoke truncate on table "storage"."iceberg_namespaces" from "service_role";
revoke update on table "storage"."iceberg_namespaces" from "service_role";
revoke select on table "storage"."iceberg_tables" from "anon";
revoke select on table "storage"."iceberg_tables" from "authenticated";
revoke delete on table "storage"."iceberg_tables" from "service_role";
revoke insert on table "storage"."iceberg_tables" from "service_role";
revoke references on table "storage"."iceberg_tables" from "service_role";
revoke select on table "storage"."iceberg_tables" from "service_role";
revoke trigger on table "storage"."iceberg_tables" from "service_role";
revoke truncate on table "storage"."iceberg_tables" from "service_role";
revoke update on table "storage"."iceberg_tables" from "service_role";

alter table "storage"."iceberg_namespaces" drop constraint "iceberg_namespaces_bucket_id_fkey";
alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_bucket_id_fkey";
alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_namespace_id_fkey";
alter table "storage"."iceberg_namespaces" drop constraint "iceberg_namespaces_pkey";
alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_pkey";

drop index if exists "storage"."iceberg_namespaces_pkey";
drop index if exists "storage"."iceberg_tables_pkey";
drop index if exists "storage"."idx_iceberg_namespaces_bucket_id";
drop index if exists "storage"."idx_iceberg_tables_namespace_id";

drop table "storage"."iceberg_namespaces";
drop table "storage"."iceberg_tables";

-- Storage bucket policies for item images
create policy "Admin Delete Item Images 6eeiel_0"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'item-images-drafts'::text));

create policy "Admin Delete Item Images"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'item-images'::text) AND (auth.role() = 'authenticated'::text)));

create policy "Admin Insert Item Images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'item-images'::text) AND (auth.role() = 'authenticated'::text)));

create policy "Admin can delete 6eeiel_0 6eeiel_0"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'item-images'::text) AND (auth.role() = 'authenticated'::text)));

create policy "Admin can delete 6eeiel_0"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'item-images'::text) AND (auth.role() = 'authenticated'::text)));

-- Profile pictures policies
create policy "Give users access to own folder 1skn4k9_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'profile-pictures'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));

create policy "Give users access to own folder 1skn4k9_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'profile-pictures'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));

create policy "Give users access to own folder 1skn4k9_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'profile-pictures'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));

create policy "Give users access to own folder 1skn4k9_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'profile-pictures'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));

-- Public access policies
create policy "Public Access to Item Images 6eeiel_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (true);

create policy "Public Access to Item Images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'item-images'::text));

create policy "Public Read Access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'item-images'::text));

-- Temporary access policies
create policy "TEMP: Allow access 6eeiel_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'item-images-drafts'::text));

create policy "TEMP: Allow access 6eeiel_1"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((bucket_id = 'item-images-drafts'::text));

create policy "TEMP: Allow access 6eeiel_2"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'item-images-drafts'::text));

-- Organization logo policies
create policy "anyone can do anything 1jxj86u_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'organization-logo-picture'::text));

create policy "anyone can do anything 1jxj86u_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'organization-logo-picture'::text));

create policy "anyone can do anything 1jxj86u_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((bucket_id = 'organization-logo-picture'::text));

create policy "anyone can do anything 1jxj86u_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'organization-logo-picture'::text));

set check_function_bodies = off;

revoke delete on table "public"."test2" from "anon";

revoke insert on table "public"."test2" from "anon";

revoke references on table "public"."test2" from "anon";

revoke select on table "public"."test2" from "anon";

revoke trigger on table "public"."test2" from "anon";

revoke truncate on table "public"."test2" from "anon";

revoke update on table "public"."test2" from "anon";

revoke delete on table "public"."test2" from "authenticated";

revoke insert on table "public"."test2" from "authenticated";

revoke references on table "public"."test2" from "authenticated";

revoke select on table "public"."test2" from "authenticated";

revoke trigger on table "public"."test2" from "authenticated";

revoke truncate on table "public"."test2" from "authenticated";

revoke update on table "public"."test2" from "authenticated";

revoke delete on table "public"."test2" from "service_role";

revoke insert on table "public"."test2" from "service_role";

revoke references on table "public"."test2" from "service_role";

revoke select on table "public"."test2" from "service_role";

revoke trigger on table "public"."test2" from "service_role";

revoke truncate on table "public"."test2" from "service_role";

revoke update on table "public"."test2" from "service_role";

alter table "public"."test2" drop constraint "test2_pkey";

drop index if exists "public"."test2_pkey";

drop table "public"."test2";

drop sequence if exists "public"."test2_id_seq";



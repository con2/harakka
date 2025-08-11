revoke delete on table "storage"."buckets" from "anon";

revoke insert on table "storage"."buckets" from "anon";

revoke references on table "storage"."buckets" from "anon";

revoke select on table "storage"."buckets" from "anon";

revoke trigger on table "storage"."buckets" from "anon";

revoke truncate on table "storage"."buckets" from "anon";

revoke update on table "storage"."buckets" from "anon";

revoke delete on table "storage"."buckets" from "authenticated";

revoke insert on table "storage"."buckets" from "authenticated";

revoke references on table "storage"."buckets" from "authenticated";

revoke select on table "storage"."buckets" from "authenticated";

revoke trigger on table "storage"."buckets" from "authenticated";

revoke truncate on table "storage"."buckets" from "authenticated";

revoke update on table "storage"."buckets" from "authenticated";

revoke delete on table "storage"."buckets" from "postgres";

revoke insert on table "storage"."buckets" from "postgres";

revoke references on table "storage"."buckets" from "postgres";

revoke select on table "storage"."buckets" from "postgres";

revoke trigger on table "storage"."buckets" from "postgres";

revoke truncate on table "storage"."buckets" from "postgres";

revoke update on table "storage"."buckets" from "postgres";

revoke delete on table "storage"."buckets" from "service_role";

revoke insert on table "storage"."buckets" from "service_role";

revoke references on table "storage"."buckets" from "service_role";

revoke select on table "storage"."buckets" from "service_role";

revoke trigger on table "storage"."buckets" from "service_role";

revoke truncate on table "storage"."buckets" from "service_role";

revoke update on table "storage"."buckets" from "service_role";

revoke delete on table "storage"."migrations" from "anon";

revoke insert on table "storage"."migrations" from "anon";

revoke references on table "storage"."migrations" from "anon";

revoke select on table "storage"."migrations" from "anon";

revoke trigger on table "storage"."migrations" from "anon";

revoke truncate on table "storage"."migrations" from "anon";

revoke update on table "storage"."migrations" from "anon";

revoke delete on table "storage"."migrations" from "authenticated";

revoke insert on table "storage"."migrations" from "authenticated";

revoke references on table "storage"."migrations" from "authenticated";

revoke select on table "storage"."migrations" from "authenticated";

revoke trigger on table "storage"."migrations" from "authenticated";

revoke truncate on table "storage"."migrations" from "authenticated";

revoke update on table "storage"."migrations" from "authenticated";

revoke delete on table "storage"."migrations" from "postgres";

revoke insert on table "storage"."migrations" from "postgres";

revoke references on table "storage"."migrations" from "postgres";

revoke select on table "storage"."migrations" from "postgres";

revoke trigger on table "storage"."migrations" from "postgres";

revoke truncate on table "storage"."migrations" from "postgres";

revoke update on table "storage"."migrations" from "postgres";

revoke delete on table "storage"."migrations" from "service_role";

revoke insert on table "storage"."migrations" from "service_role";

revoke references on table "storage"."migrations" from "service_role";

revoke select on table "storage"."migrations" from "service_role";

revoke trigger on table "storage"."migrations" from "service_role";

revoke truncate on table "storage"."migrations" from "service_role";

revoke update on table "storage"."migrations" from "service_role";

revoke delete on table "storage"."objects" from "anon";

revoke insert on table "storage"."objects" from "anon";

revoke references on table "storage"."objects" from "anon";

revoke select on table "storage"."objects" from "anon";

revoke trigger on table "storage"."objects" from "anon";

revoke truncate on table "storage"."objects" from "anon";

revoke update on table "storage"."objects" from "anon";

revoke delete on table "storage"."objects" from "authenticated";

revoke insert on table "storage"."objects" from "authenticated";

revoke references on table "storage"."objects" from "authenticated";

revoke select on table "storage"."objects" from "authenticated";

revoke trigger on table "storage"."objects" from "authenticated";

revoke truncate on table "storage"."objects" from "authenticated";

revoke update on table "storage"."objects" from "authenticated";

revoke delete on table "storage"."objects" from "postgres";

revoke insert on table "storage"."objects" from "postgres";

revoke references on table "storage"."objects" from "postgres";

revoke select on table "storage"."objects" from "postgres";

revoke trigger on table "storage"."objects" from "postgres";

revoke truncate on table "storage"."objects" from "postgres";

revoke update on table "storage"."objects" from "postgres";

revoke delete on table "storage"."objects" from "service_role";

revoke insert on table "storage"."objects" from "service_role";

revoke references on table "storage"."objects" from "service_role";

revoke select on table "storage"."objects" from "service_role";

revoke trigger on table "storage"."objects" from "service_role";

revoke truncate on table "storage"."objects" from "service_role";

revoke update on table "storage"."objects" from "service_role";

revoke select on table "storage"."s3_multipart_uploads" from "anon";

revoke select on table "storage"."s3_multipart_uploads" from "authenticated";

revoke delete on table "storage"."s3_multipart_uploads" from "service_role";

revoke insert on table "storage"."s3_multipart_uploads" from "service_role";

revoke references on table "storage"."s3_multipart_uploads" from "service_role";

revoke select on table "storage"."s3_multipart_uploads" from "service_role";

revoke trigger on table "storage"."s3_multipart_uploads" from "service_role";

revoke truncate on table "storage"."s3_multipart_uploads" from "service_role";

revoke update on table "storage"."s3_multipart_uploads" from "service_role";

revoke select on table "storage"."s3_multipart_uploads_parts" from "anon";

revoke select on table "storage"."s3_multipart_uploads_parts" from "authenticated";

revoke delete on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke insert on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke references on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke select on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke trigger on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke truncate on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke update on table "storage"."s3_multipart_uploads_parts" from "service_role";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$function$
;

CREATE OR REPLACE FUNCTION storage.extension(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$function$
;

CREATE OR REPLACE FUNCTION storage.filename(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.foldername(name text)
 RETURNS text[]
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.get_size_by_bucket()
 RETURNS TABLE(size bigint, bucket_id text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$function$
;

CREATE OR REPLACE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text)
 RETURNS TABLE(key text, id text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text)
 RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.operation()
 RETURNS text
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
 RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$function$
;

CREATE OR REPLACE FUNCTION storage.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$function$
;

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




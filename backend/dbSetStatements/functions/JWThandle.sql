-- Simplified function using Supabase's built-in auth functions
CREATE OR REPLACE FUNCTION update_user_jwt_on_role_change()
RETURNS TRIGGER AS $$
DECLARE
  affected_user_id UUID;
  user_roles JSONB;
BEGIN
  -- Determine which user_id was affected
  IF TG_OP = 'DELETE' THEN
    affected_user_id := OLD.user_id;
  ELSE
    affected_user_id := NEW.user_id;
  END IF;

  -- Get all active roles for the affected user
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', uor.id,
        'name', r.role,                    -- Changed: role_name -> name
        'org_id', uor.organization_id,     -- Changed: organization_id -> org_id
        'org_name', o.name,                -- Changed: organization_name -> org_name
        'role_id', uor.role_id,
        'created_at', uor.created_at
      )
    ), 
    '[]'::jsonb
  ) INTO user_roles
  FROM user_organization_roles uor
  JOIN roles r ON uor.role_id = r.id
  JOIN organizations o ON uor.organization_id = o.id
  WHERE uor.user_id = affected_user_id 
    AND uor.is_active = true;

  -- Update auth.users directly
  UPDATE auth.users 
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'roles', user_roles,
    'role_count', jsonb_array_length(user_roles),
    'last_role_sync', now()
  )
  WHERE id = affected_user_id;

  -- Log the JWT update
  RAISE NOTICE 'Updated JWT metadata for user % with % roles', affected_user_id, jsonb_array_length(user_roles);

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;

EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the original operation
  RAISE NOTICE 'Failed to update JWT for user %: %', affected_user_id, SQLERRM;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simplified helper function
CREATE OR REPLACE FUNCTION update_user_jwt_on_role_change_for_user(target_user_id UUID)
RETURNS void AS $$
DECLARE
  user_roles JSONB;
BEGIN
  -- Get all active roles for the user
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', uor.id,
        'name', r.role,                    -- Changed: role_name -> name
        'org_id', uor.organization_id,     -- Changed: organization_id -> org_id
        'org_name', o.name,                -- Changed: organization_name -> org_name
        'role_id', uor.role_id,
        'created_at', uor.created_at
      )
    ), 
    '[]'::jsonb
  ) INTO user_roles
  FROM user_organization_roles uor
  JOIN roles r ON uor.role_id = r.id
  JOIN organizations o ON uor.organization_id = o.id
  WHERE uor.user_id = target_user_id 
    AND uor.is_active = true;

  -- Update auth.users directly
  UPDATE auth.users 
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'roles', user_roles,
    'role_count', jsonb_array_length(user_roles),
    'last_role_sync', now()
  )
  WHERE id = target_user_id;

  RAISE NOTICE 'Updated JWT metadata for user % with % roles via helper function', target_user_id, jsonb_array_length(user_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
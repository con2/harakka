-- Function to clear the current user ID from the request context
CREATE OR REPLACE FUNCTION public.clear_request_user_id()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the current user ID from the request context or auth
CREATE OR REPLACE FUNCTION public.get_request_user_id()
RETURNS UUID AS $$
DECLARE
  request_user_id TEXT;
  auth_user_id UUID;
BEGIN
  -- Try to get user ID from session variable first
  request_user_id := current_setting('app.current_user_id', true);
  
  -- If there's a session variable with a value, use it
  IF request_user_id IS NOT NULL AND request_user_id != '' THEN
    RETURN request_user_id::UUID;
  END IF;
  
  -- Otherwise fall back to auth.uid()
  auth_user_id := auth.uid();
  RETURN auth_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set the current user ID in the request context
CREATE OR REPLACE FUNCTION public.set_request_user_id(user_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
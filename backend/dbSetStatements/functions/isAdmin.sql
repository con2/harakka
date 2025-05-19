-- Function to check if current user has admin or superVera privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'superVera')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin_only()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user has superVera privileges
CREATE OR REPLACE FUNCTION public.is_super_vera()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'superVera'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
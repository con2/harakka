-- Drop old constraint
ALTER TABLE public.user_ban_history
DROP CONSTRAINT IF EXISTS user_ban_history_role_assignment_id_fkey;

-- Add new one with cascade
ALTER TABLE public.user_ban_history
ADD CONSTRAINT user_ban_history_role_assignment_id_fkey
FOREIGN KEY (role_assignment_id) REFERENCES public.user_organization_roles (id)
ON DELETE CASCADE;

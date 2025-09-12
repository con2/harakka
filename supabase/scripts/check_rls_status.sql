-- Check RLS status for ALL tables in public schema
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_enabled,
    (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename) AS policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
ORDER BY tablename;




-- Check what policies exist on ALL public tables
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd AS operation,
    permissive,
    roles,
    CASE WHEN with_check IS NOT NULL THEN 'with_check: ' || with_check ELSE '' END as check_condition,
    CASE WHEN qual IS NOT NULL THEN 'using: ' || qual ELSE '' END as using_condition
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;




-- Summary: Tables with/without RLS
SELECT 
    'Tables with RLS enabled' AS category,
    COUNT(*) AS count
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true
UNION ALL
SELECT 
    'Tables without RLS' AS category,
    COUNT(*) AS count
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false
UNION ALL
SELECT 
    'Total tables in public' AS category,
    COUNT(*) AS count
FROM pg_tables 
WHERE schemaname = 'public';

-- List tables without RLS (potential security gaps)
SELECT 
    tablename,
    'No RLS enabled' AS status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND rowsecurity = false
ORDER BY tablename;


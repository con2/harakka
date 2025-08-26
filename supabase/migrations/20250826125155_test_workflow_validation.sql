-- Test migration to validate workflow
-- This will be used to test our migration deployment workflow
CREATE TABLE IF NOT EXISTS workflow_test (
    id SERIAL PRIMARY KEY,
    test_message TEXT DEFAULT 'Migration workflow test - Tue Aug 26 12:51:55 EEST 2025',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add a comment to document this test
COMMENT ON TABLE workflow_test IS 'Test table created to validate the migration deployment workflow';

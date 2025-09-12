-- ========================================================================== 
-- CREATE TEST_PR_UPDATE TABLE 
-- ========================================================================== 

CREATE TABLE public.test_pr_update (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand_new_column VARCHAR(100),
    this_one_even_newer INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
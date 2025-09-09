CREATE OR REPLACE VIEW view_category_details AS
SELECT 
    c.*,
    COUNT(si.id) AS assigned_to
FROM categories c
LEFT JOIN storage_items si 
    ON si.category_id = c.id
GROUP BY c.id;

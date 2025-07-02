# Implementation Guide: RLS Policies for Multi-Tenant Storage System

## Quick Start

### 1. Apply the Helper Functions
Run the helper functions first as they're used by the policies:
```sql
-- Apply these functions from rls-policies.sql
-- auth.has_global_role()
-- auth.has_organization_role() 
-- auth.has_any_organization_role()
-- auth.get_user_organizations_with_role()
```

### 2. Apply Policies by Priority

#### High Priority (Core Security)
1. `organizations` - Controls tenant access
2. `user_organization_roles` - Controls role assignments  
3. `storage_items` - Controls item visibility and management
4. `organization_items` - Controls item ownership

#### Medium Priority (Business Logic)
1. `orders` - Controls order visibility
2. `order_items` - Controls order item management
3. `storage_locations` - Controls location access

#### Lower Priority (User Experience)
1. `notifications` - User notifications
2. `user_profiles` - Profile management

### 3. Test Each Policy

#### Test Super Admin Access
```sql
-- Set user as super admin
UPDATE user_profiles SET role = 'SuperVera' WHERE id = 'test-user-id';

-- Verify they can see all organizations
SELECT * FROM organizations;
```

#### Test Organization Role Access
```sql
-- Add user to organization as main admin
INSERT INTO user_organization_roles (user_id, organization_id, role_id, is_active)
VALUES ('test-user-id', 'test-org-id', 'main-admin-role-id', true);

-- Verify they can see their organization
SELECT * FROM organizations WHERE id = 'test-org-id';
```

#### Test Item Ownership
```sql
-- Create item owned by organization
INSERT INTO organization_items (organization_id, storage_item_id)
VALUES ('test-org-id', 'test-item-id');

-- Verify storage manager can see it
SELECT * FROM storage_items WHERE id = 'test-item-id';
```

## Key Implementation Considerations

### 1. Role Hierarchy Enforcement
The role hierarchy is enforced through the helper functions. Make sure to:
- Use consistent role names across all tables
- Implement role inheritance where appropriate
- Test role escalation scenarios

### 2. Cross-Organization Scenarios
Test these critical scenarios:
- User with roles in multiple organizations
- Orders containing items from multiple organizations  
- Storage locations with items from multiple organizations
- Role changes and access updates

### 3. Performance Optimization
- Add indexes on frequently queried columns:
  ```sql
  CREATE INDEX idx_user_org_roles_user_org ON user_organization_roles(user_id, organization_id);
  CREATE INDEX idx_org_items_org_item ON organization_items(organization_id, storage_item_id);
  CREATE INDEX idx_order_items_order ON order_items(order_id);
  ```

### 4. Error Handling
- Users should get clear error messages when access is denied
- Log access attempts for security monitoring
- Handle edge cases (deleted organizations, inactive roles, etc.)

## Testing Checklist

### Organization Management
- [ ] Super admin can create/modify all organizations
- [ ] Main admin can modify their own organization
- [ ] Main admin cannot see other organizations' private data
- [ ] Regular users can see basic organization info

### Role Management  
- [ ] Super admin can assign any role
- [ ] Main admin can assign non-main-admin roles in their org
- [ ] Main admin cannot assign main admin roles
- [ ] Users can see their own role assignments

### Item Management
- [ ] Storage managers can manage their organization's items
- [ ] Storage managers cannot modify other organizations' items
- [ ] All users can browse active items
- [ ] Inactive/deleted items are hidden from regular users

### Order Processing
- [ ] Users can create orders with any available items
- [ ] Storage managers can approve orders for their organization's items
- [ ] Storage managers cannot approve orders for other organizations' items
- [ ] Cross-organization orders require approval from each organization

### Location Access
- [ ] Storage managers can access locations their organization uses
- [ ] Location access follows organization_locations mapping
- [ ] Users can see basic location info for available items

## Deployment Steps

1. **Backup Current Database**
   ```bash
   supabase db dump > backup_before_rls.sql
   ```

2. **Apply Helper Functions**
   ```bash
   psql < helper_functions.sql
   ```

3. **Apply Policies Incrementally**
   ```bash
   # Test each table's policies separately
   psql < organizations_policies.sql
   # Test functionality
   psql < user_roles_policies.sql  
   # Test functionality
   # Continue for each table...
   ```

4. **Verify All Functionality**
   - Run comprehensive test suite
   - Test with different user roles
   - Verify performance is acceptable

5. **Monitor and Adjust**
   - Monitor query performance
   - Watch for access denied errors
   - Adjust policies based on real usage

## Common Issues and Solutions

### Issue: Policies Too Restrictive
**Solution**: Add more specific policies for edge cases
```sql
-- Example: Allow storage managers to see orders in draft status
CREATE POLICY "Storage managers can see draft orders with their items" ON orders
FOR SELECT USING (
  status = 'draft' AND
  EXISTS (SELECT 1 FROM order_items oi ...)
);
```

### Issue: Performance Problems
**Solution**: Add specific indexes and optimize policy queries
```sql
-- Add covering indexes for policy queries
CREATE INDEX idx_org_items_covering ON organization_items(organization_id, storage_item_id) 
INCLUDE (created_at, is_active);
```

### Issue: Complex Multi-Organization Logic
**Solution**: Consider using views or functions for complex access patterns
```sql
-- Create view for user's accessible items across all their organizations
CREATE VIEW user_accessible_items AS
SELECT si.*, oi.organization_id
FROM storage_items si
JOIN organization_items oi ON oi.storage_item_id = si.id
WHERE oi.organization_id = ANY(auth.get_user_organizations_with_role('storage_manager'));
```

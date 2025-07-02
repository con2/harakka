# Multi-Tenant Role-Based Access Control (RBAC) for Storage Management System

## Overview

This document outlines the role-based access control system for the multi-tenant storage management application based on the requirements from the convention specifications.

## Role Hierarchy

### 1. Super Admin (`super_admin`)
- **Scope**: System-wide
- **Responsibilities**:
  - Manage all organizations (create, delete, modify)
  - Assign main admins to organizations
  - Override any access restrictions
  - Handle administrative interventions
  - See all data across the system

### 2. Main Admin (`main_admin`) 
- **Scope**: Organization-specific
- **Responsibilities**:
  - Control user roles within their organization
  - Manage organization information and settings
  - Assign storage_manager and requester roles
  - Cannot assign other main_admin roles (only super admins can)
  - See basic information about all registered users

### 3. Storage Manager (`storage_manager`)
- **Scope**: Organization-specific  
- **Responsibilities**:
  - Manage items owned by their organization
  - Approve/reject loan requests for their organization's items
  - Manage storage locations accessible to their organization
  - Create "first-party loans" (organization borrowing its own items)
  - See orders containing their organization's items

### 4. Requester (`requester`)
- **Scope**: Organization-specific
- **Responsibilities**:
  - Make loan requests on behalf of their organization
  - Important for legal and insurance purposes
  - Cannot approve requests, only create them

### 5. User (`user`)
- **Scope**: Personal
- **Responsibilities**:
  - Make personal loan requests
  - Browse available items
  - Manage their own orders and profile

## Key Multi-Tenancy Features

### Cross-Organization Requests
- A single loan request can contain items from multiple organizations
- Each organization approves their own items separately
- The request is only fully approved when all organizations have approved their items

### Shared Storage Locations
- Items from multiple organizations can be stored at the same location
- Storage managers with access to a location can manage all items there (if they have rights to those organizations)
- Packing view shows items grouped by organization

### "Changing Hats" Capability
- Users can have roles in multiple organizations
- Interface should allow switching between organization contexts
- Single user account across all organizations

## Database Schema Key Tables

### Core Tables
- `organizations` - Tenant organizations
- `user_organization_roles` - User roles within organizations
- `roles` - Role definitions
- `organization_items` - Item ownership mapping
- `organization_locations` - Location access mapping

### Access Patterns

#### Item Management
```sql
-- Storage managers can see/edit items their organization owns
SELECT * FROM storage_items si
JOIN organization_items oi ON oi.storage_item_id = si.id  
WHERE auth.has_organization_role(oi.organization_id, 'storage_manager')
```

#### Order Approval
```sql
-- Storage managers see orders containing their organization's items
SELECT * FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN organization_items orgitem ON orgitem.storage_item_id = oi.item_id
WHERE auth.has_organization_role(orgitem.organization_id, 'storage_manager')
```

## RLS Policy Structure

### Security Principles
1. **Principle of Least Privilege**: Users only see data they need for their role
2. **Organization Isolation**: Organizations cannot see each other's private data
3. **Public Browsing**: Active items and locations are visible for browsing
4. **Ownership-Based Access**: Item management follows ownership rules

### Policy Categories
1. **Global Policies**: Super admin overrides
2. **Organization Policies**: Role-based access within organizations  
3. **Ownership Policies**: Item/location ownership-based access
4. **Public Policies**: Browsing and discovery
5. **Self-Management Policies**: Users managing their own data

## Implementation Notes

### Helper Functions
- `auth.has_global_role(role)` - Check system-wide roles
- `auth.has_organization_role(org_id, role)` - Check organization-specific roles
- `auth.get_user_organizations_with_role(min_role)` - Get user's organizations with minimum role level

### Critical Considerations
1. **Performance**: Policies should use efficient queries with proper indexing
2. **Testing**: Comprehensive testing needed for all role combinations
3. **Audit Trail**: All role changes and access should be logged
4. **Data Privacy**: GDPR compliance for cross-organization data visibility

### Administrative Interventions
- Process for handling organization leadership changes
- Super admin can revoke/reassign main admin roles
- Paper trail required (meeting minutes, official documents)
- Temporary access procedures for emergency situations

## Future Enhancements

### Planned Features
1. **Block Lists**: Organization-specific user restrictions
2. **Temporary Roles**: Time-limited access assignments
3. **Delegation**: Temporary role delegation during absences
4. **Advanced Audit**: Detailed access logging and reporting
5. **API Keys**: Service account access for integrations

### Integration Points
- **Kompassi Authentication**: OpenID Connect integration
- **Email Notifications**: Role-based notification routing
- **External Systems**: API access with proper role validation

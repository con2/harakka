# User Banning Frontend Implementation

This document describes the frontend implementation of the user banning system.

## Components Created

### 1. Types (`/src/types/userBanning.ts`)

- Contains all user banning related TypeScript interfaces and types
- Includes DTOs for API communication (BanForRoleDto, BanForOrgDto, etc.)
- Defines Redux state interface (UserBanningState)
- Centralized type definitions for better maintainability
- Exports common BanType union type

### 2. API Service (`/src/api/services/userBanning.ts`)

- Provides API calls to the backend user-banning endpoints
- Includes all CRUD operations for user banning
- Imports types from the centralized types folder

### 3. Redux Slice (`/src/store/slices/userBanningSlice.ts`)

- Manages user banning state in Redux
- Provides async thunks for all banning operations
- Includes selectors for accessing ban data
- Uses UserBanningState interface from types folder

### 4. User Interface Components

#### UserBanModal (`/src/components/Admin/UserManagement/UserBanModal.tsx`)

- Modal dialog for banning users
- Supports three ban types: Application, Organization, Role
- Form validation and error handling
- Uses common Supabase types

#### UnbanUserModal (`/src/components/Admin/UserManagement/UnbanUserModal.tsx`)

- Modal dialog for unbanning users
- Allows selection of ban type to remove
- Includes notes field for unban reason

#### UserBanHistoryModal (`/src/components/Admin/UserManagement/UserBanHistoryModal.tsx`)

- Displays user's ban history in a table
- Shows ban type, reason, date, and permanency
- Loads data when modal is opened

### 4. Translations (`/src/translations/modules/userBanning.ts`)

- Complete translation support for Finnish and English
- Includes all UI text, error messages, and labels

## Integration

The user banning components are integrated into the `UsersList.tsx` component:

1. **Ban Button**: Orange button with ban icon to open ban modal
2. **Unban Button**: Green button with user-check icon to unban users
3. **History Button**: Blue button with history icon to view ban history
4. **Status Column**: Shows current ban status (currently shows "Active" as placeholder)

## Permissions

Banning functionality is restricted to:

- **superVera**: Can ban/unban any user
- **admin**: Can ban/unban regular users only

## Types Used

The implementation uses a well-organized type system:

- **Frontend Types**: All user banning interfaces are centralized in `/src/types/userBanning.ts`
- **Common Types**: `UserProfile` from `@common/user.types` for consistency with backend
- **Type Organization**: Separation of concerns with dedicated type files
- **Proper TypeScript path mapping**: Uses `@/types/*` and `@common/*` aliases

### Key Type Interfaces

- `BanForRoleDto`, `BanForOrgDto`, `BanForAppDto` - API request payloads
- `UnbanDto` - Unban request payload
- `UserBanHistoryDto` - Ban history records
- `BanOperationResult` - API response format
- `UserBanStatusCheck` - Ban status check response
- `UserBanningState` - Redux state shape
- `BanType` - Union type for ban categories

## Backend Integration

The frontend communicates with these backend endpoints:

- `POST /user-banning/ban-for-role`
- `POST /user-banning/ban-for-org`
- `POST /user-banning/ban-for-app`
- `POST /user-banning/unban`
- `GET /user-banning/history/:userId`
- `GET /user-banning/statuses`
- `GET /user-banning/check/:userId`

## Future Enhancements

1. **Real-time Ban Status**: Currently shows static "Active" status. Could be enhanced to show actual ban status from backend.
2. **Organization/Role Dropdowns**: Could add dropdowns populated from backend data instead of text inputs.
3. **Ban Duration**: Could add support for temporary bans with expiration dates.
4. **Bulk Operations**: Could add support for banning multiple users at once.
5. **Ban Notifications**: Could add real-time notifications when users are banned/unbanned.

## Testing

To test the implementation:

1. Build the frontend: `npm run build`
2. Start the development server: `npm run dev`
3. Navigate to the Users List in the admin panel
4. Look for the ban (orange), unban (green), and history (blue) buttons in the actions column
5. Test banning/unbanning functionality with proper admin credentials

The backend endpoints should be available and the user should have appropriate permissions to test the functionality.

# Postman Collection

## Harakka API Collection

The `Harakka.json` file contains our complete Postman collection with all API endpoints for the Harakka Storage & Booking Application.

### What's Included

- **All API endpoints** - Complete coverage of all backend routes
- **Request examples** - Sample requests for each endpoint
- **Response examples** - Expected response structures for successful requests

### What's NOT Included

⚠️ **Environment variables are not included in this collection.**

You'll need to set up your own Postman environment with the required variables such as:

- `baseUrl` - API base URL (e.g., `http://localhost:3000` or your deployment URL)
- `accessToken` - Authentication token (obtained after login)
- Any other environment-specific values

### How to Use

1. **Import the collection** into Postman:
   - Open Postman
   - Click "Import" button
   - Select the `Harakka.json` file
   - Click "Import"

2. **Create a Postman environment**:
   - Click the environment dropdown in the top right
   - Select "Create Environment"
   - Name it (e.g., "Local Development" or "Production")

3. **Configure environment variables**:
   - Add `baseUrl` variable with your API URL
   - Add `accessToken` for authenticated requests
   - Add any other required variables

4. **Start making requests**:
   - Select your environment from the dropdown
   - Choose an endpoint from the collection
   - Click "Send"

### Keeping It Updated

When adding or modifying API endpoints:

1. Test the endpoint in Postman
2. Update or add it to the collection
3. Export the collection (overwrite `Harakka.json`)
4. Commit the updated file to the repository

This ensures the collection stays synchronized with the actual API implementation.

---

**Related Documentation:**

- [API Reference](../docs/developers/backend/api-reference.md) - Detailed API documentation
- [Environment Variables Guide](../docs/developers/environment-variables.md) - Setting up local environment

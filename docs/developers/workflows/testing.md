# Testing Guide

This document outlines the testing approach and practices for the Storage and Booking Application.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Types of Tests](#types-of-tests)
- [Test Coverage Requirements](#test-coverage-requirements)
- [Frontend Testing](#frontend-testing)
- [Backend Testing](#backend-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Pre-Deployment Testing](#pre-deployment-testing)
- [Continuous Integration](#continuous-integration)
- [Testing Tools](#testing-tools)

## Testing Philosophy

Our testing approach follows these key principles:

1. **Test Early and Often**: Write tests as you develop, not after
2. **Test the Right Thing**: Focus on behavior, not implementation details
3. **Automated Where Possible**: Automate all repeatable tests
4. **Manual When Necessary**: Complex flows may require manual testing
5. **Test at the Right Level**: Unit tests for logic, integration tests for connections, E2E for critical flows

## Types of Tests

### Unit Tests

- Test individual functions and components in isolation
- Quick to run and helpful for rapid feedback
- Should cover business logic and utility functions
- Target: 80% coverage for service and utility files

### Integration Tests

- Verify that different parts of the system work together
- Test interaction between components or services
- Example: Testing API endpoints with database interactions

### End-to-End Tests

- Simulate real user interactions with the application
- Verify complete user flows like registration, booking, etc.
- Slower but provide confidence in system functionality

### Manual Tests

- For complex scenarios difficult to automate
- For visual verification and usability testing
- For exploratory testing to find edge cases

<!-- ## Test Coverage Requirements

- **Critical Paths**: 100% coverage for booking creation, authentication
- **Business Logic**: 80% coverage for service layers and utilities
- **UI Components**: 70% coverage for React components
- **API Endpoints**: 80% coverage for all endpoints
- **Validation**: 100% coverage for input validation and error handling -->

## Frontend Testing

### Component Testing

- Use React Testing Library for component testing
- Test component rendering and behavior
- Focus on user interactions and outputs
- Snapshot testing for UI stability

```tsx
// Example component test
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Redux State Testing

- Test Redux slices, reducers, and selectors independently
- Mock API calls in async action tests
- Verify state transitions and side effects

```typescript
// Example Redux slice test
import reducer, {
  addToCart,
  removeFromCart,
  selectCartItems,
} from "../cartSlice";

describe("cart slice", () => {
  it("should handle initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({
      items: [],
      loading: false,
      error: null,
      errorContext: null,
    });
  });

  it("should handle adding an item", () => {
    const item = {
      item: { id: "123", name: "Test Item", price: 10 },
      quantity: 1,
    };
    const state = reducer(undefined, addToCart(item));
    expect(selectCartItems({ cart: state })).toContainEqual(item);
  });
});
```

### Custom Hook Testing

- Test custom hooks with React Hooks Testing Library
- Focus on hook behavior and state changes

```typescript
// Example custom hook test
import { renderHook, act } from "@testing-library/react-hooks";
import { useFormattedDate } from "../hooks/useFormattedDate";

describe("useFormattedDate", () => {
  it("formats date correctly", () => {
    const { result } = renderHook(() => useFormattedDate());
    const date = new Date("2023-01-01");

    expect(result.current.formatDate(date)).toBe("01.01.2023");
  });
});
```

## Backend Testing

### Unit Testing Services

- Test individual service functions in isolation
- Mock external dependencies (database, external APIs)
- Verify output for different input scenarios

```typescript
// Example service test
import { StorageItemsService } from "../storage-items.service";

describe("StorageItemsService", () => {
  let service: StorageItemsService;
  let mockSupabaseService;
  let mockS3Service;

  beforeEach(() => {
    mockSupabaseService = {
      getServiceClient: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      }),
    };

    mockS3Service = {
      deleteFile: jest.fn(),
    };

    service = new StorageItemsService(mockSupabaseService, mockS3Service);
  });

  it("should get all items", async () => {
    // Test implementation
  });
});
```

### API Testing

- Test API endpoints with supertest
- Verify request/response handling
- Check status codes, headers, and response body
- Test error cases and edge conditions

```typescript
// Example API test
import * as request from "supertest";
import { app } from "../app";

describe("Storage Items API", () => {
  it("GET /storage-items - should return all items", async () => {
    const response = await request(app.getHttpServer())
      .get("/storage-items")
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
  });

  it("GET /storage-items/:id - should return 404 for non-existent item", async () => {
    await request(app.getHttpServer())
      .get("/storage-items/non-existent-id")
      .expect(404);
  });
});
```

## Integration Testing

- Test interaction between frontend and backend
- Verify data flow through multiple layers
- Use in-memory or containerized test databases
- Test with realistic data scenarios

## End-to-End Testing

### Cypress Tests

- Focus on critical user flows
- Test complete features from UI to database
- Run in CI pipeline before deployment

```typescript
// Example Cypress test
describe("Booking Flow", () => {
  beforeEach(() => {
    cy.mockStorageItems();
    cy.loginWithSupabase("test@example.com", "password");
    cy.visit("/storage");
  });

  it("should allow a user to book an item", () => {
    // Select an item
    cy.get('[data-cy="items-card"]').first().click();

    // Set date range
    cy.get('[data-cy="datepicker-start"]').click();
    cy.get('.rdp-day[data-value="1"]').click();
    cy.get('[data-cy="datepicker-end"]').click();
    cy.get('.rdp-day[data-value="5"]').click();

    // Set quantity and add to cart
    cy.get('[data-cy="quantity-input"]').clear().type("2");
    cy.get('[data-cy="add-to-cart-button"]').click();

    // Go to cart and checkout
    cy.get('[data-cy="cart-icon"]').click();
    cy.get('[data-cy="checkout-button"]').click();

    // Complete order
    cy.get('[data-cy="place-order-button"]').click();

    // Verify success
    cy.contains("Order Placed Successfully").should("be.visible");
  });
});
```

## Pre-Deployment Testing

Since you deploy from the deployment branch when significant changes are applied to develop, follow these testing steps before merging to the deployment branch:

1. **Integration Testing on Develop**:

   - Ensure all PRs are merged to develop
   - Run the full test suite on develop
   - Verify feature interactions

2. **Manual Verification**:

   - Manual smoke test on develop branch
   - Verify critical user flows

3. **Deployment Branch Preparation**:

   - Create a PR from develop to deployment
   - Run pre-deployment automated tests
   - Conduct a final review of changes

4. **Staging Deployment**:

   - Deploy to staging environment from deployment branch
   - Run production-like tests
   - Verify environment configuration

5. **Production Readiness Checklist**:
   - Database migration testing
   - Load testing if necessary
   - Security verification
   - Feature flag configuration

## Continuous Integration

Our CI pipeline automatically runs tests on:

- Every PR to develop
- Daily on the develop branch
- Before deployment to staging/production

CI Test Process:

1. Install dependencies
2. Build projects
3. Run unit tests
4. Run integration tests
5. Run E2E tests
6. Generate coverage reports

## Testing Tools

### Frontend Testing

- Jest: JavaScript testing framework
- React Testing Library: Component testing
- Cypress: End-to-end testing
- MSW (Mock Service Worker): API mocking

### Backend Testing

- Jest: Testing framework
- Supertest: API testing
- Pactum: API contract testing

### Tools & Utilities

- ESLint with testing plugins
- GitHub Actions for CI/CD
- Codecov for coverage reporting

## Writing Testable Code

Follow these principles to make your code more testable:

1. **Single Responsibility**: Components and functions should do one thing
2. **Dependency Injection**: Make dependencies explicit and injectable
3. **Pure Functions**: Minimize side effects, prefer pure functions
4. **Avoid Global State**: Use dependency injection instead
5. **Consistent Error Handling**: Standardize error handling patterns

## Test Data Management

- Use factories and fixtures for test data
- Keep test data separate from production
- Create helpers for common test setup
- Clean up test data after tests run

```typescript
// Example test data factory
const createTestItem = (overrides = {}) => ({
  id: "test-item-123",
  name: "Test Item",
  price: 10.99,
  description: "A test item for testing",
  is_active: true,
  location_id: "test-location-123",
  ...overrides,
});
```

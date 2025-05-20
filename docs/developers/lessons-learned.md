# Lessons Learned

Throughout the development of this application, our team gained valuable insights and improved our skills across various technical areas. After all, this is a learning project.

## Database & Backend

- **Supabase as a Backend Service**: Integrating Supabase provided a streamlined approach to managing PostgreSQL databases, authentication, and storage in a unified platform. We learned how to effectively leverage Supabase's client libraries for both frontend and backend integration.
- **Row-Level Security**: Implementing PostgreSQL's Row-Level Security proved to be a powerful way to enforce access control directly at the database level. This approach ensured consistent security regardless of which service or component accessed the data.
- **JSON/JSONB for Translations**: Using JSONB fields to store multilingual content allowed us to implement a flexible localization system without complex database schema changes, while still maintaining efficient querying capabilities.
- **Database Triggers and Functions**: We created sophisticated PostgreSQL functions and triggers for automated calculations (average ratings), inventory management, and audit logging, reducing the need for application-level data manipulation.

## Frontend Development

- **Redux Toolkit Patterns**: We established standardized patterns for state management, with a focus on typed slices, async thunks. The `createApiThunk` helper greatly simplified API integration and error handling.
- **TypeScript Integration**: Using TypeScript throughout the application improved code quality and caught numerous type-related issues during development rather than runtime.
- **Shadcn UI Component System**: Leveraging Shadcn UI along with Tailwind CSS enabled us to build a cohesive design system while maintaining flexibility for customization. The component-based design simplified maintenance and ensured UI consistency.
- **Multi-language Support**: Implementing a comprehensive translation system taught us how to structure applications for internationalization from the ground up, rather than adding it as an afterthought.

## Development Workflow

- **Git Flow Adaptation**: Adapting a simplified Git Flow branching strategy with specific branch naming conventions helped maintain organization across a complex codebase with multiple contributors.
- **Conventional Commits**: Standardizing commit messages with the Conventional Commits format improved commit history clarity.
- **Documentation-Driven Development**: Creating comprehensive documentation before and during development helped clarify requirements and technical approaches, reducing rework and misunderstandings.
- **Code Review Culture**: Establishing a structured code review process with clear timeframes (24-hour window) and responsibility divisions between developers improved code quality and knowledge sharing.

## DevOps & Deployment

- **YAML Configuration Management**: Using YAML files for deployment configuration provided structured and version-controlled approach.
- **CI/CD with GitHub Actions**: Setting up CI/CD pipelines taught us how to automate testing, building, and deployment processes, improving reliability and reducing manual deployment errors.
- **Azure Deployment**: Configuring Azure services for hosting both frontend and backend components required understanding how to optimize settings for performance and security.

## Testing Strategies

- **End-to-End Testing with Cypress**: Creating comprehensive E2E tests helped us validate critical user flows and catch integration issues that unit tests might miss.
- **Custom Testing Commands**: Developing reusable testing commands and factories improved test readability and reduced duplication across test files.
- **Mock Service Worker**: Using MSW for API mocking in frontend tests allowed us to test components that depend on API responses without actual backend calls.

## Security & Authentication

- **Role-Based Access Control**: Implementing a three-tiered role system (User, Admin, SuperVera) taught us how to design nuanced permission systems that balance security with usability.
- **JWT Authentication Flow**: Working with JWT tokens for authentication required careful handling of token storage, renewal, and security concerns.
- **Secure File Management**: Implementing secure URL generation for invoice PDFs demonstrated how to share sensitive files without exposing them to unauthorized users.

## Challenges & Solutions

- **State Synchronization**: Managing state consistency between the client, server, and database required careful planning and well-defined update patterns.
- **TypeScript Learning Curve**: While TypeScript improved code quality, it initially slowed development due to the learning curve. Creating shared type definitions and standardized patterns eventually offset this cost.
- **Deployment Configuration**: Managing different configuration requirements across development, staging, and production environments required a systematic approach to environment variables and build settings.
- **Third-Party Service Integration**: Working with external services like email providers taught us to build resilient integration patterns that handle API changes gracefully.

These lessons have not only contributed to the success of this project but will also inform our approach to future software development endeavours.

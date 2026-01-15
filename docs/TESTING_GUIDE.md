# Testing Guide

This guide covers testing for both backend and frontend of the OOPshop application.

## 📋 Table of Contents

- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)

## 🔧 Backend Testing

### Setup

Backend uses **Mocha**, **Chai**, and **Supertest** for testing.

**Dependencies:**
- `mocha` - Testing framework
- `chai` - Assertion library
- `sinon` - Mocking and stubbing library
- `sinon-chai` - Chai plugin for Sinon assertions
- `supertest` - HTTP assertion library for API testing
- `nyc` - Code coverage tool (Istanbul)
- `proxyquire` - Module mocking for Node.js

### Test Structure

```
backend/
├── __tests__/
│   ├── auth.controller.test.js
│   ├── auth.service.test.js
│   ├── product.controller.test.js
│   └── middleware/
│       └── auth.test.js
```

### Running Backend Tests

```bash
# Run all tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "Auth Controller"
```

### Test Examples

#### Controller Tests
- Test HTTP endpoints
- Test request/response handling
- Test error cases
- Test authentication/authorization
- Use `sinon.stub()` to mock services

#### Service Tests
- Test business logic
- Test database interactions (mocked with Sinon)
- Test error handling
- Test data transformations
- Use `sinon.stub()` for dependencies

#### Middleware Tests
- Test authentication middleware
- Test validation middleware
- Test error handling middleware
- Use `sinon.stub()` for JWT and other dependencies

## 🎨 Frontend Testing

### Setup

Frontend uses **Jest** and **React Testing Library** for testing.

**Dependencies:**
- `jest` - Testing framework
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interaction simulation
- `jest-environment-jsdom` - Browser environment for Jest

### Test Structure

```
frontend/
├── __tests__/
│   ├── lib/
│   │   ├── services/
│   │   │   ├── auth.service.test.ts
│   │   │   └── product.service.test.ts
│   │   └── hooks/
│   │       └── useAuth.test.tsx
│   └── components/
│       └── shared/
│           └── Footer.test.tsx
└── jest.setup.ts
```

### Running Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.service.test.ts
```

### Test Examples

#### Component Tests
- Test component rendering
- Test user interactions
- Test props handling
- Test conditional rendering

#### Hook Tests
- Test state management
- Test side effects
- Test return values
- Test error handling

#### Service Tests
- Test API calls (mocked)
- Test data transformations
- Test error handling
- Test localStorage operations

## 🚀 Running Tests

### Backend

```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
```

### Frontend

```bash
cd frontend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

### Both

```bash
# From project root
cd backend && npm test && cd ../frontend && npm test
```

## 📊 Test Coverage

### Backend Coverage

```bash
cd backend
npm run test:coverage
```

Coverage reports are generated in `backend/coverage/`

**Target Coverage:**
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

### Frontend Coverage

```bash
cd frontend
npm run test:coverage
```

Coverage reports are generated in `frontend/coverage/`

**Target Coverage:**
- Statements: > 70%
- Branches: > 65%
- Functions: > 70%
- Lines: > 70%

## ✅ Test Checklist

### Backend Tests

- [ ] Authentication endpoints (login, register, me)
- [ ] Product CRUD operations
- [ ] Checkout process
- [ ] Invoice management
- [ ] User management
- [ ] Report generation
- [ ] Authentication middleware
- [ ] Validation middleware
- [ ] Error handling
- [ ] Service layer logic

### Frontend Tests

- [ ] Authentication service
- [ ] Product service
- [ ] Checkout service
- [ ] useAuth hook
- [ ] useCart hook
- [ ] Footer component
- [ ] Error boundaries
- [ ] Form validation
- [ ] API error handling
- [ ] LocalStorage operations

## 🎯 Best Practices

### Writing Tests

1. **Arrange-Act-Assert (AAA) Pattern**
   ```javascript
   it('should do something', () => {
     // Arrange
     const input = 'test';
     
     // Act
     const result = functionToTest(input);
     
     // Assert
     expect(result).to.equal('expected');
   });
   ```

2. **Test One Thing at a Time**
   - Each test should verify one behavior
   - Use descriptive test names

3. **Mock External Dependencies**
   - Mock database calls
   - Mock API calls
   - Mock file system operations

4. **Test Edge Cases**
   - Empty inputs
   - Invalid inputs
   - Error conditions
   - Boundary values

5. **Keep Tests Independent**
   - Tests should not depend on each other
   - Clean up after each test

### Test Naming

```javascript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition is met', () => {
      // test
    });
    
    it('should handle error when invalid input', () => {
      // test
    });
  });
});
```

### Mocking Guidelines

1. **Mock at the Right Level**
   - Mock external services (database, APIs)
   - Don't mock code you're testing
   - Use `sinon.stub()` for method mocking
   - Use `sinon.spy()` for call tracking

2. **Reset Mocks**
   ```javascript
   beforeEach(() => {
     sinon.restore(); // Restores all stubs and spies
   });
   ```

3. **Use Real Implementations When Possible**
   - Only mock when necessary
   - Prefer integration tests for complex flows
   - Use `sinon.stub().resolves()` for async methods
   - Use `sinon.stub().rejects()` for error cases

## 📝 Example Test Files

### Backend Controller Test

```javascript
const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');

describe('GET /health', () => {
  it('should return 200 and status ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).to.equal('ok');
  });
});
```

### Frontend Service Test

```typescript
import { authService } from '@/lib/services/auth.service';

describe('AuthService', () => {
  it('should login successfully', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(result.status).toBe('success');
  });
});
```

## 🔍 Debugging Tests

### Backend

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test with verbose output
npm test -- --verbose auth.controller.test.js
```

### Frontend

```bash
# Run with debug output
npm test -- --verbose

# Run specific test
npm test -- auth.service.test.ts
```

## 📚 Additional Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon Mocking Library](https://sinonjs.org/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [NYC Coverage Tool](https://github.com/istanbuljs/nyc)

## 🐛 Common Issues

### Backend

1. **Database connection errors**
   - Use Sinon stubs for database operations
   - Don't connect to real database in tests
   - Stub `pool.query` and `pool.getConnection`

2. **Environment variables**
   - Set test environment variables in `__tests__/setup.js`
   - Use `process.env.NODE_ENV = 'test'`

3. **Module mocking**
   - Use `sinon.stub()` for method-level mocking
   - Use `proxyquire` for module-level mocking if needed
   - Always call `sinon.restore()` in `beforeEach` or `afterEach`

### Frontend

1. **localStorage not available**
   - Mock localStorage in jest.setup.ts
   - Already configured in this project

2. **Next.js router issues**
   - Mock next/navigation
   - Already configured in jest.setup.ts

3. **Material-UI theme issues**
   - Wrap components in ThemeProvider in tests
   - Use renderWithTheme helper if needed

## ✅ Continuous Integration

Tests should run automatically in CI/CD:

```yaml
# Example GitHub Actions
- name: Run Backend Tests
  run: cd backend && npm test

- name: Run Frontend Tests
  run: cd frontend && npm test
```

---

**Happy Testing! 🎉**

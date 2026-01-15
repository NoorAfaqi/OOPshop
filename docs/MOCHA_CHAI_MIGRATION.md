# Backend Testing Migration: Jest → Mocha/Chai

## Overview

The OOPshop backend has been migrated from Jest to Mocha/Chai for testing. This document explains the changes and how to use the new testing framework.

## Why Mocha/Chai?

1. **Industry Standard**: Mocha is widely used in Node.js community
2. **Flexibility**: More control over test execution and configuration
3. **Plugin Ecosystem**: Rich ecosystem of plugins and extensions
4. **Modularity**: Can mix and match assertion libraries
5. **Better Async Support**: Excellent support for async/await patterns

## Migration Details

### Dependencies Changed

**Removed:**
- `jest` - Jest testing framework
- `@types/jest` - TypeScript definitions for Jest

**Added:**
- `mocha` - Test framework
- `chai` - Assertion library
- `sinon` - Mocking and stubbing library
- `sinon-chai` - Chai plugin for Sinon assertions
- `nyc` - Code coverage tool (Istanbul)
- `proxyquire` - Module mocking utility

### Configuration Files

**New:**
- `.mocharc.js` - Mocha configuration file
- Updated `__tests__/setup.js` - Mocha/Chai setup

**Removed:**
- Jest configuration from `package.json`

### Test Scripts

**Before (Jest):**
```json
{
  "test": "jest --coverage",
  "test:watch": "jest --watch"
}
```

**After (Mocha):**
```json
{
  "test": "mocha --recursive --timeout 10000 --exit",
  "test:watch": "mocha --recursive --timeout 10000 --watch",
  "test:coverage": "nyc mocha --recursive --timeout 10000 --exit"
}
```

## Syntax Changes

### Assertions

| Jest | Mocha/Chai |
|------|------------|
| `expect(x).toBe(y)` | `expect(x).to.equal(y)` |
| `expect(x).toEqual(y)` | `expect(x).to.deep.equal(y)` |
| `expect(x).toBeDefined()` | `expect(x).to.exist` |
| `expect(x).toBeUndefined()` | `expect(x).to.not.exist` |
| `expect(x).toBeNull()` | `expect(x).to.be.null` |
| `expect(x).toBeTruthy()` | `expect(x).to.be.true` |
| `expect(x).toBeFalsy()` | `expect(x).to.be.false` |
| `expect(array).toContain(item)` | `expect(array).to.include(item)` |
| `expect(x).toBeGreaterThan(y)` | `expect(x).to.be.greaterThan(y)` |
| `expect(x).toBeInstanceOf(Class)` | `expect(x).to.be.instanceOf(Class)` |

### Mocking

| Jest | Sinon |
|------|-------|
| `jest.fn()` | `sinon.stub()` or `sinon.spy()` |
| `mockFn.mockResolvedValue(data)` | `stub.resolves(data)` |
| `mockFn.mockRejectedValue(error)` | `stub.rejects(error)` |
| `mockFn.mockReturnValue(data)` | `stub.returns(data)` |
| `jest.clearAllMocks()` | `sinon.restore()` |
| `jest.spyOn(obj, 'method')` | `sinon.spy(obj, 'method')` |
| `jest.mock('./module')` | `sinon.stub()` or `proxyquire` |

### Async Error Testing

**Jest:**
```javascript
await expect(fn()).rejects.toThrow('Error message');
```

**Mocha/Chai:**
```javascript
try {
  await fn();
  expect.fail('Should have thrown an error');
} catch (error) {
  expect(error.message).to.include('Error message');
}
```

## Example Test Conversion

### Before (Jest)

```javascript
const request = require('supertest');
const app = require('../src/app');
const authService = require('../src/services/auth.service');

jest.mock('../src/services/auth.service');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    authService.login.mockResolvedValue({
      token: 'mock-token',
      user: { id: 1, email: 'test@example.com' }
    });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
```

### After (Mocha/Chai)

```javascript
const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('../src/app');
const authService = require('../src/services/auth.service');

describe('Auth Controller', () => {
  beforeEach(() => {
    sinon.restore();
  });

  it('should login successfully', async () => {
    sinon.stub(authService, 'login').resolves({
      token: 'mock-token',
      user: { id: 1, email: 'test@example.com' }
    });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);

    expect(response.body.status).to.equal('success');
    expect(authService.login).to.have.been.calledWith('test@example.com', 'password123');
  });
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- __tests__/auth.controller.test.js

# Run tests matching pattern
npm test -- --grep "Auth Controller"
```

## Coverage Reports

Coverage reports are generated using `nyc` (Istanbul):

```bash
npm run test:coverage
```

Reports are generated in:
- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format
- Console output - Summary

## Best Practices

### 1. Always Restore Stubs

```javascript
beforeEach(() => {
  sinon.restore(); // Clears all stubs and spies
});
```

### 2. Use Descriptive Test Names

```javascript
it('should return 401 when user provides invalid credentials', async () => {
  // test code
});
```

### 3. Stub External Dependencies

```javascript
// Stub database calls
sinon.stub(pool, 'query').resolves([[mockUser]]);

// Stub bcrypt
sinon.stub(bcrypt, 'compare').resolves(true);

// Stub JWT
sinon.stub(jwt, 'sign').returns('mock-token');
```

### 4. Test Error Cases

```javascript
it('should handle database errors', async () => {
  sinon.stub(pool, 'query').rejects(new Error('Database error'));
  
  try {
    await service.method();
    expect.fail('Should have thrown an error');
  } catch (error) {
    expect(error.message).to.include('Database error');
  }
});
```

## Common Patterns

### Stubbing Service Methods

```javascript
const stub = sinon.stub(service, 'method');
stub.resolves({ data: 'result' });
// ... test code ...
sinon.restore(); // Cleanup
```

### Spying on Methods

```javascript
const spy = sinon.spy(service, 'method');
// ... test code ...
expect(spy).to.have.been.called;
expect(spy).to.have.been.calledWith('expected', 'args');
sinon.restore();
```

### Testing Async Functions

```javascript
it('should handle async operations', async () => {
  const stub = sinon.stub(service, 'asyncMethod').resolves({ result: 'data' });
  
  const result = await controller.method();
  
  expect(result).to.deep.equal({ result: 'data' });
  expect(stub).to.have.been.called;
});
```

## Troubleshooting

### Issue: Stubs not working

**Solution**: Make sure to call `sinon.restore()` in `beforeEach` or `afterEach` to clean up stubs between tests.

### Issue: Module not mocked

**Solution**: Use `sinon.stub()` on the method after the module is loaded, or use `proxyquire` for module-level mocking.

### Issue: Tests timing out

**Solution**: Increase timeout in `.mocharc.js` or use `this.timeout(5000)` in specific tests.

## Migration Checklist

- [x] Update `package.json` dependencies
- [x] Create `.mocharc.js` configuration
- [x] Update `__tests__/setup.js`
- [x] Convert all test files
- [x] Update test scripts
- [x] Update documentation
- [x] Verify all tests pass

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon Mocking Library](https://sinonjs.org/)
- [NYC Coverage Tool](https://github.com/istanbuljs/nyc)

---

**Migration Date**: January 2026  
**Status**: ✅ Complete

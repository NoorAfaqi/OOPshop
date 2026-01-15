# Mocha/Chai Migration Guide

This document describes the migration from Jest to Mocha/Chai for backend testing.

## Migration Summary

**Before**: Jest + Supertest  
**After**: Mocha + Chai + Sinon + Supertest

## Key Changes

### 1. Package Dependencies

**Removed:**
- `jest`
- `@types/jest`

**Added:**
- `mocha` - Test framework
- `chai` - Assertion library
- `sinon` - Mocking and stubbing
- `sinon-chai` - Chai plugin for Sinon
- `nyc` - Code coverage (replaces Jest coverage)
- `proxyquire` - Module mocking (optional)

### 2. Test Syntax Changes

#### Assertions

**Jest:**
```javascript
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg);
```

**Chai:**
```javascript
expect(value).to.equal(expected);
expect(value).to.deep.equal(expected);
expect(fn).to.have.been.called;
expect(fn).to.have.been.calledWith(arg);
```

#### Mocking

**Jest:**
```javascript
jest.mock('./module');
const mockFn = jest.fn();
mockFn.mockResolvedValue(data);
mockFn.mockRejectedValue(error);
jest.clearAllMocks();
```

**Sinon:**
```javascript
const stub = sinon.stub(module, 'method');
stub.resolves(data);
stub.rejects(error);
sinon.restore(); // Clears all stubs/spies
```

#### Async Error Testing

**Jest:**
```javascript
await expect(fn()).rejects.toThrow('Error message');
```

**Chai:**
```javascript
try {
  await fn();
  expect.fail('Should have thrown an error');
} catch (error) {
  expect(error.message).to.include('Error message');
}
```

### 3. Configuration

**Jest** (`package.json`):
```json
{
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/__tests__/setup.js"]
  }
}
```

**Mocha** (`.mocharc.js`):
```javascript
module.exports = {
  timeout: 10000,
  recursive: true,
  require: ['./__tests__/setup.js'],
  spec: ['__tests__/**/*.test.js']
};
```

### 4. Test Structure

Both frameworks use similar structure:
- `describe()` - Test suites
- `it()` - Test cases
- `before()`, `after()`, `beforeEach()`, `afterEach()` - Hooks

## Migration Checklist

- [x] Update `package.json` dependencies
- [x] Create `.mocharc.js` configuration
- [x] Update `__tests__/setup.js` for Mocha
- [x] Convert all test files to Mocha/Chai syntax
- [x] Update test scripts in `package.json`
- [x] Update documentation

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test
npm test -- --grep "Auth Controller"
```

## Benefits of Mocha/Chai

1. **Flexibility**: More control over test execution
2. **Plugin Ecosystem**: Rich plugin ecosystem
3. **Async Support**: Excellent async/await support
4. **Modularity**: Can mix and match assertion libraries
5. **Industry Standard**: Widely used in Node.js community

## Common Patterns

### Stubbing a Method
```javascript
const stub = sinon.stub(service, 'method');
stub.resolves({ data: 'result' });
// ... test code ...
sinon.restore(); // Cleanup
```

### Spying on a Method
```javascript
const spy = sinon.spy(service, 'method');
// ... test code ...
expect(spy).to.have.been.called;
sinon.restore();
```

### Mocking Modules
```javascript
const proxyquire = require('proxyquire');
const app = proxyquire('../src/app', {
  './services/auth.service': {
    login: sinon.stub().resolves({ token: 'mock' })
  }
});
```

---

**Migration Date**: January 2026  
**Status**: ✅ Complete

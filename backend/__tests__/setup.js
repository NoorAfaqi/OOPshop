// Global test setup for Mocha
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

// Extend Chai with plugins
chai.use(sinonChai);

// Make Chai available globally (optional - can also import in each test)
global.expect = chai.expect;
global.sinon = sinon;
global.should = chai.should();

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';

// Mock rate limiting for tests
const securityModule = require('../src/config/security');
const originalAuthLimiter = securityModule.authLimiter;
const originalGeneralLimiter = securityModule.generalLimiter;

// Replace rate limiters with pass-through middleware
securityModule.authLimiter = (req, res, next) => next();
securityModule.generalLimiter = (req, res, next) => next();

// Note: Rate limiters are replaced globally for all tests
// This is intentional to avoid rate limiting issues in tests
// The original limiters are stored but not restored to avoid
// interfering with test execution

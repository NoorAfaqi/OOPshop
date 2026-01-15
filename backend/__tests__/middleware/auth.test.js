const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const auth = require('../../src/middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;
  let jwtVerifyStub;

  beforeEach(() => {
    req = {
      headers: {},
      path: '/test'
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.stub();
    process.env.JWT_SECRET = 'test-secret';
    
    jwtVerifyStub = sinon.stub(jwt, 'verify');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('auth() - no role required', () => {
    it('should call next() with valid token', () => {
      const mockPayload = { id: 1, email: 'test@example.com', role: 'customer' };
      jwtVerifyStub.returns(mockPayload);

      req.headers.authorization = 'Bearer valid-token';

      const middleware = auth();
      middleware(req, res, next);

      expect(jwt.verify).to.have.been.calledWith('valid-token', 'test-secret');
      expect(req.user).to.deep.equal(mockPayload);
      expect(next).to.have.been.called;
      expect(res.status).to.not.have.been.called;
    });

    it('should return 401 without token when required', () => {
      const middleware = auth(null, true);
      middleware(req, res, next);

      expect(res.status).to.have.been.calledWith(401);
      expect(res.json).to.have.been.calledWith({ message: 'No token provided' });
      expect(next).to.not.have.been.called;
    });

    it('should call next() without token when not required', () => {
      const middleware = auth(null, false);
      middleware(req, res, next);

      expect(next).to.have.been.called;
      expect(res.status).to.not.have.been.called;
    });

    it('should return 401 for invalid token', () => {
      jwtVerifyStub.throws(new Error('Invalid token'));

      req.headers.authorization = 'Bearer invalid-token';

      const middleware = auth();
      middleware(req, res, next);

      expect(res.status).to.have.been.calledWith(401);
      expect(res.json).to.have.been.calledWith({ message: 'Invalid or expired token' });
      expect(next).to.not.have.been.called;
    });
  });

  describe('auth() - role required', () => {
    it('should allow access with correct role', () => {
      const mockPayload = { id: 1, email: 'admin@example.com', role: 'admin' };
      jwtVerifyStub.returns(mockPayload);

      req.headers.authorization = 'Bearer valid-token';

      const middleware = auth('admin');
      middleware(req, res, next);

      expect(next).to.have.been.called;
      expect(res.status).to.not.have.been.called;
    });

    it('should deny access with incorrect role', () => {
      const mockPayload = { id: 1, email: 'user@example.com', role: 'customer' };
      jwtVerifyStub.returns(mockPayload);

      req.headers.authorization = 'Bearer valid-token';

      const middleware = auth('admin');
      middleware(req, res, next);

      expect(res.status).to.have.been.calledWith(403);
      expect(res.json).to.have.been.calledWith({
        message: 'Access denied. Required role: admin'
      });
      expect(next).to.not.have.been.called;
    });

    it('should allow access with one of multiple roles', () => {
      const mockPayload = { id: 1, email: 'manager@example.com', role: 'manager' };
      jwtVerifyStub.returns(mockPayload);

      req.headers.authorization = 'Bearer valid-token';

      const middleware = auth(['admin', 'manager']);
      middleware(req, res, next);

      expect(next).to.have.been.called;
    });
  });

  describe('Token extraction', () => {
    it('should extract token from Bearer header', () => {
      const mockPayload = { id: 1, role: 'customer' };
      jwtVerifyStub.returns(mockPayload);

      req.headers.authorization = 'Bearer my-token-123';

      const middleware = auth();
      middleware(req, res, next);

      expect(jwt.verify).to.have.been.calledWith('my-token-123', 'test-secret');
    });

    it('should not verify token without Bearer prefix', () => {
      req.headers.authorization = 'my-token-123';

      const middleware = auth();
      middleware(req, res, next);

      // Token without Bearer prefix is treated as no token
      expect(jwt.verify).to.not.have.been.called;
      expect(res.status).to.have.been.calledWith(401);
    });
  });
});

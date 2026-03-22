const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const authService = require('../src/services/auth.service');

describe('Auth Controller', () => {
  let app;

  before(() => {
    // Load app after setting up environment
    app = require('../src/app');
  });

  beforeEach(() => {
    sinon.restore();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'customer',
        first_name: 'Test',
        last_name: 'User'
      };
      const mockToken = 'mock-jwt-token';

      sinon.stub(authService, 'login').resolves({
        token: mockToken,
        user: mockUser
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.token).to.equal(mockToken);
      expect(response.body.data.user).to.deep.equal(mockUser);
      expect(authService.login).to.have.been.calledWith('test@example.com', 'password123');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'password123'
        })
        .expect(400);

      expect(response.body).to.exist;
      expect(response.body.message).to.equal('Validation failed');
      expect(response.body.errors).to.exist;
      expect(response.body.errors).to.be.an('array');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body).to.exist;
      expect(response.body.message).to.equal('Validation failed');
      expect(response.body.errors).to.exist;
      expect(response.body.errors).to.be.an('array');
    });

    it('should return 401 for invalid credentials', async () => {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      error.isOperational = true;
      sinon.stub(authService, 'login').rejects(error);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.status).to.equal('error');
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockPayload = {
        token: 'mock-jwt-after-register',
        user: {
          id: 1,
          email: 'newuser@example.com',
          role: 'customer',
          first_name: 'New',
          last_name: 'User'
        }
      };

      sinon.stub(authService, 'register').resolves(mockPayload);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          first_name: 'New',
          last_name: 'User',
          role: 'customer'
        })
        .expect(201);

      expect(response.body.status).to.equal('success');
      expect(response.body.data).to.deep.equal(mockPayload);
      expect(response.body.data.token).to.be.a('string');
      expect(response.body.data.user.email).to.equal('newuser@example.com');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User'
        })
        .expect(400);

      expect(response.body).to.exist;
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user with valid token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'customer',
        first_name: 'Test',
        last_name: 'User'
      };

      sinon.stub(authService, 'getUserById').resolves(mockUser);

      // Use a mock token directly instead of logging in (to avoid rate limiting)
      const mockToken = 'mock-jwt-token';
      const jwt = require('jsonwebtoken');
      sinon.stub(jwt, 'verify').returns({ id: 1, email: 'test@example.com', role: 'customer' });

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data).to.deep.equal(mockUser);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(401);

      expect(response.body.message).to.equal('No token provided');
    });
  });
});

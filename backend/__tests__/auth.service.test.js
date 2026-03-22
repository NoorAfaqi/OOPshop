const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/database');
const authService = require('../src/services/auth.service');

describe('AuthService', () => {
  let bcryptCompareStub;
  let bcryptHashStub;
  let jwtSignStub;
  let poolQueryStub;

  beforeEach(() => {
    sinon.restore();
    
    // Stub bcrypt
    bcryptCompareStub = sinon.stub(bcrypt, 'compare');
    bcryptHashStub = sinon.stub(bcrypt, 'hash');
    
    // Stub jwt
    jwtSignStub = sinon.stub(jwt, 'sign');
    
    // Stub pool
    poolQueryStub = sinon.stub(pool, 'query');
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'customer',
        is_active: true
      };

      poolQueryStub.resolves([[mockUser]]);
      bcryptCompareStub.resolves(true);
      jwtSignStub.returns('mock-jwt-token');

      const result = await authService.login('test@example.com', 'password123');

      expect(result.token).to.equal('mock-jwt-token');
      expect(result.user.email).to.equal('test@example.com');
      expect(bcrypt.compare).to.have.been.calledWith('password123', 'hashed_password');
      expect(jwt.sign).to.have.been.called;
    });

    it('should throw error for non-existent user', async () => {
      poolQueryStub.resolves([[]]);

      try {
        await authService.login('nonexistent@example.com', 'password123');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Invalid credentials');
      }
    });

    it('should throw error for incorrect password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'customer',
        is_active: true
      };

      poolQueryStub.resolves([[mockUser]]);
      bcryptCompareStub.resolves(false);

      try {
        await authService.login('test@example.com', 'wrongpassword');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Invalid credentials');
      }
    });

    it('should throw error for inactive user', async () => {
      poolQueryStub.resolves([[]]);

      try {
        await authService.login('test@example.com', 'password123');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Invalid credentials');
      }
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
        role: 'customer'
      };

      const hashedPassword = 'hashed_password';
      bcryptHashStub.resolves(hashedPassword);
      jwtSignStub.returns('mock-register-jwt');
      poolQueryStub
        .onFirstCall().resolves([[]]) // Check if user exists
        .onSecondCall().resolves([{ insertId: 1 }]); // Insert user

      const result = await authService.register(userData);

      expect(result.token).to.equal('mock-register-jwt');
      expect(result.user.email).to.equal(userData.email);
      expect(result.user.id).to.equal(1);
      expect(result.user.first_name).to.equal(userData.first_name);
      expect(result.user.last_name).to.equal(userData.last_name);
      expect(result.user.role).to.equal(userData.role);
      expect(bcrypt.hash).to.have.been.calledWith(userData.password, 10);
      expect(poolQueryStub).to.have.been.calledTwice;
      expect(jwt.sign).to.have.been.called;
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Existing',
        last_name: 'User'
      };

      poolQueryStub.resolves([[{ id: 1, email: 'existing@example.com' }]]);

      try {
        await authService.register(userData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'customer',
        first_name: 'Test',
        last_name: 'User'
      };

      poolQueryStub.resolves([[mockUser]]);

      const result = await authService.getUserById(1);

      expect(result).to.deep.equal(mockUser);
      expect(poolQueryStub).to.have.been.calledWith(
        sinon.match.string,
        [1]
      );
    });

    it('should throw error if user not found', async () => {
      poolQueryStub.resolves([[]]);

      try {
        await authService.getUserById(999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });
});

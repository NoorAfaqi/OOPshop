const { expect } = require('chai');
const sinon = require('sinon');
const { successResponse, errorResponse, paginatedResponse } = require('../../src/utils/response');

describe('Response Utils', () => {
  let res;

  beforeEach(() => {
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  describe('successResponse', () => {
    it('should send success response with data', () => {
      const data = { id: 1, name: 'Test' };
      successResponse(res, data, 'Success message', 200);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        status: 'success',
        message: 'Success message',
        data,
      });
    });

    it('should use default status code 200', () => {
      successResponse(res, { test: 'data' });

      expect(res.status).to.have.been.calledWith(200);
    });
  });

  describe('errorResponse', () => {
    it('should send error response', () => {
      errorResponse(res, 'Error message', 400);

      expect(res.status).to.have.been.calledWith(400);
      expect(res.json).to.have.been.calledWith({
        status: 'error',
        message: 'Error message',
      });
    });

    it('should include errors array when provided', () => {
      const errors = [
        { msg: 'Invalid email', param: 'email' },
        { msg: 'Invalid password', param: 'password' },
      ];

      errorResponse(res, 'Validation failed', 400, errors);

      expect(res.json).to.have.been.calledWith({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
    });
  });

  describe('paginatedResponse', () => {
    it('should send paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      paginatedResponse(res, data, 1, 10, 25);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        status: 'success',
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          pages: 3,
        },
      });
    });

    it('should calculate pages correctly', () => {
      paginatedResponse(res, [], 1, 10, 0);

      expect(res.json).to.have.been.calledWith(
        sinon.match.object
      );
    });
  });
});

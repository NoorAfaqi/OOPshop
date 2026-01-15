const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/app');

describe('Health Check Endpoint', () => {
  it('should return 200 and status ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).to.equal('ok');
    expect(response.body.timestamp).to.exist;
    expect(response.body.environment).to.exist;
  });

  it('should return valid ISO timestamp', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.getTime()).to.be.greaterThan(0);
  });
});

const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const productService = require('../src/services/product.service');
const jwt = require('jsonwebtoken');

describe('Product Controller', () => {
  let app;
  let jwtVerifyStub;

  before(() => {
    app = require('../src/app');
  });

  beforeEach(() => {
    sinon.restore();
    // Stub JWT verification to allow authentication
    jwtVerifyStub = sinon.stub(jwt, 'verify');
    jwtVerifyStub.returns({ id: 1, email: 'test@example.com', role: 'admin' });
  });

  describe('GET /products', () => {
    it('should return list of products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 10.99, stock_quantity: 100 },
        { id: 2, name: 'Product 2', price: 20.99, stock_quantity: 50 }
      ];

      sinon.stub(productService, 'getAllProducts').resolves({
        products: mockProducts,
        total: 2,
        page: 1,
        limit: 10
      });

      const response = await request(app)
        .get('/products')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).to.exist;
      expect(productService.getAllProducts).to.have.been.called;
    });

    it('should filter products by category', async () => {
      sinon.stub(productService, 'getAllProducts').resolves({
        products: [],
        total: 0,
        page: 1,
        limit: 10
      });

      await request(app)
        .get('/products')
        .query({ category: 'Electronics' })
        .expect(200);

      expect(productService.getAllProducts).to.have.been.calledWith(
        sinon.match.object
      );
    });
  });

  describe('GET /products/:id', () => {
    it('should return product by id', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        price: 10.99,
        stock_quantity: 100
      };

      sinon.stub(productService, 'getProductById').resolves(mockProduct);

      const response = await request(app)
        .get('/products/1')
        .expect(200);

      expect(response.body).to.exist;
      expect(productService.getProductById).to.have.been.calledWith(sinon.match.number);
    });

    it('should return 404 for non-existent product', async () => {
      const error = new Error('Product not found');
      error.statusCode = 404;
      error.isOperational = true;
      sinon.stub(productService, 'getProductById').rejects(error);

      await request(app)
        .get('/products/999')
        .expect(404);
    });

    it('should return product with description and nutritional_info when present', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        price: 10.99,
        stock_quantity: 100,
        description: 'A healthy snack.',
        nutritional_info: { energy_kcal: 100, fat: 5 }
      };

      sinon.stub(productService, 'getProductById').resolves(mockProduct);

      const response = await request(app)
        .get('/products/1')
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.description).to.equal('A healthy snack.');
      expect(response.body.data.nutritional_info).to.deep.equal({ energy_kcal: 100, fat: 5 });
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        price: 15.99,
        stock_quantity: 50,
        category: 'Test Category'
      };

      const createdProduct = { id: 1, ...newProduct };

      sinon.stub(productService, 'createProduct').resolves(createdProduct);

      const response = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer mock-token')
        .send(newProduct)
        .expect(201);

      expect(response.body.status).to.equal('success');
      expect(response.body.data).to.deep.equal(createdProduct);
      expect(productService.createProduct).to.have.been.calledWith(newProduct);
    });

    it('should return 400 for invalid product data', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer mock-token')
        .send({
          name: '', // Invalid: empty name
          price: -10 // Invalid: negative price
        })
        .expect(400);

      expect(response.body).to.exist;
      expect(response.body.message || response.body.status).to.exist;
    });

    it('should create a product with description and nutritional_info', async () => {
      const newProduct = {
        name: 'Test Product',
        price: 1.99,
        description: 'A test product',
        nutritional_info: { energy_kcal: 100 }
      };

      const createdProduct = { id: 1, ...newProduct };

      sinon.stub(productService, 'createProduct').resolves(createdProduct);

      const response = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer mock-token')
        .send(newProduct)
        .expect(201);

      expect(response.body.status).to.equal('success');
      expect(response.body.data.description).to.equal('A test product');
      expect(response.body.data.nutritional_info).to.deep.equal({ energy_kcal: 100 });
      expect(productService.createProduct).to.have.been.calledWith(newProduct);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update an existing product', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 20.99
      };

      const updatedProduct = {
        id: 1,
        ...updateData,
        stock_quantity: 100
      };

      sinon.stub(productService, 'updateProduct').resolves(updatedProduct);

      const response = await request(app)
        .put('/products/1')
        .set('Authorization', 'Bearer mock-token')
        .send(updateData)
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(productService.updateProduct).to.have.been.calledWith(sinon.match.number, updateData);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      sinon.stub(productService, 'deleteProduct').resolves(true);

      const response = await request(app)
        .delete('/products/1')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.status).to.equal('success');
      expect(productService.deleteProduct).to.have.been.calledWith(sinon.match.number);
    });
  });
});

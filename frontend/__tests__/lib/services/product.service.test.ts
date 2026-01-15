import { productService } from '@/lib/services/product.service';
import { apiService } from '@/lib/services/api.service';

// Mock apiService
jest.mock('@/lib/services/api.service', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should fetch all products', async () => {
      const mockResponse = {
        status: 'success',
        data: [
          { id: 1, name: 'Product 1', price: 10.99 },
          { id: 2, name: 'Product 2', price: 20.99 },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productService.getAllProducts();

      expect(result).toEqual(mockResponse);
      expect(apiService.get).toHaveBeenCalledWith('/products', false, undefined);
    });

    it('should fetch products with filters', async () => {
      const mockResponse = {
        status: 'success',
        data: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await productService.getAllProducts({
        category: 'Electronics',
        page: 1,
        limit: 10,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        '/products',
        false,
        expect.objectContaining({
          category: 'Electronics',
          page: 1,
          limit: 10,
        })
      );
    });
  });

  describe('getProductById', () => {
    it('should fetch product by id', async () => {
      const mockResponse = {
        status: 'success',
        data: { id: 1, name: 'Product 1', price: 10.99 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productService.getProductById(1);

      expect(result).toEqual(mockResponse);
      expect(apiService.get).toHaveBeenCalledWith('/products/1', false);
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        price: 15.99,
        stock_quantity: 100,
      };

      const mockResponse = {
        status: 'success',
        data: { id: 1, ...newProduct },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productService.createProduct(newProduct);

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith(
        '/products',
        newProduct,
        true
      );
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 20.99,
      };

      const mockResponse = {
        status: 'success',
        data: { id: 1, ...updateData },
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productService.updateProduct(1, updateData);

      expect(result).toEqual(mockResponse);
      expect(apiService.put).toHaveBeenCalledWith(
        '/products/1',
        updateData,
        true
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Product deleted',
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await productService.deleteProduct(1);

      expect(result).toEqual(mockResponse);
      expect(apiService.delete).toHaveBeenCalledWith('/products/1', true);
    });
  });
});

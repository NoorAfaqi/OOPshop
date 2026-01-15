import { renderHook, act, waitFor } from '@testing-library/react';
import { useCart } from '@/lib/hooks/useCart';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with empty cart', async () => {
    const { result } = renderHook(() => useCart());

    // Wait for the hook to finish loading
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.cart).toEqual([]);
    expect(result.current.getTotalItems()).toBe(0);
    expect(result.current.getTotalPrice()).toBe(0);
    expect(result.current.isLoaded).toBe(true);
  });

  it('should load cart from localStorage on mount', async () => {
    const mockCart = [
      {
        product: { id: 1, name: 'Product 1', price: 10.99 },
        quantity: 2,
      },
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockCart));

    const { result } = renderHook(() => useCart());

    // Wait for the hook to finish loading
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.cart).toEqual(mockCart);
    expect(result.current.getTotalItems()).toBe(2);
    expect(result.current.isLoaded).toBe(true);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart());

    const product = {
      id: 1,
      name: 'Test Product',
      price: 10.99,
    };

    act(() => {
      result.current.addToCart(product);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].product).toEqual(product);
    expect(result.current.cart[0].quantity).toBe(1);
  });

  it('should update quantity when adding existing product', () => {
    const { result } = renderHook(() => useCart());

    const product = {
      id: 1,
      name: 'Test Product',
      price: 10.99,
    };

    act(() => {
      result.current.addToCart(product);
      result.current.addToCart(product, 2);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(3);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart());

    const product = {
      id: 1,
      name: 'Test Product',
      price: 10.99,
    };

    act(() => {
      result.current.addToCart(product);
      result.current.removeFromCart(1);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('should update quantity for existing item', () => {
    const { result } = renderHook(() => useCart());

    const product = {
      id: 1,
      name: 'Test Product',
      price: 10.99,
    };

    act(() => {
      result.current.addToCart(product);
      result.current.updateQuantity(1, 5);
    });

    expect(result.current.cart[0].quantity).toBe(5);
  });

  it('should remove item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart());

    const product = {
      id: 1,
      name: 'Test Product',
      price: 10.99,
    };

    act(() => {
      result.current.addToCart(product);
      result.current.updateQuantity(1, 0);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('should calculate cart total correctly', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart({ id: 1, name: 'Product 1', price: 10.99 }, 2);
      result.current.addToCart({ id: 2, name: 'Product 2', price: 20.99 }, 1);
    });

    expect(result.current.getTotalPrice()).toBeCloseTo(42.97);
    expect(result.current.getTotalItems()).toBe(3);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart({ id: 1, name: 'Product 1', price: 10.99 });
      result.current.clearCart();
    });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.getTotalItems()).toBe(0);
    expect(result.current.getTotalPrice()).toBe(0);
  });
});

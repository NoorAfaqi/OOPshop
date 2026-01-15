import { authService } from '@/lib/services/auth.service';
import { apiService } from '@/lib/services/api.service';

// Mock apiService
jest.mock('@/lib/services/api.service', () => ({
  apiService: {
    post: jest.fn(),
  },
}));

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

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 1,
            email: 'test@example.com',
            role: 'customer',
          },
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.status).toBe('success');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_token',
        'mock-jwt-token'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify(mockResponse.data.user)
      );
    });

    it('should handle login failure', async () => {
      const mockResponse = {
        status: 'error',
        message: 'Invalid credentials',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.status).toBe('error');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should remove token and user data from localStorage', () => {
      authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorageMock.getItem.mockReturnValue('mock-token');

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when available', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'customer',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      expect(authService.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null when user data does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token when available', () => {
      localStorageMock.getItem.mockReturnValue('mock-token');

      expect(authService.getToken()).toBe('mock-token');
    });

    it('should return null when token does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(authService.getToken()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when available', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'customer',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      expect(authService.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null when user data does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(authService.getCurrentUser()).toBeNull();
    });
  });
});

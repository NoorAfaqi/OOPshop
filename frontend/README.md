# OOPshop Frontend

A modern e-commerce frontend built with Next.js 16, React 19, TypeScript, and Material-UI.

## Features

- ✅ Next.js 16 App Router
- ✅ React 19
- ✅ TypeScript for type safety
- ✅ Material-UI (MUI) components
- ✅ Client-side state management
- ✅ Custom hooks (useAuth, useCart)
- ✅ Type-safe API service layer
- ✅ Error boundaries
- ✅ Responsive design
- ✅ Shopping cart with localStorage persistence
- ✅ Form validation

## Quick Start

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- Backend API running (see backend/README.md)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
```
http://localhost:3000
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout pages
│   ├── dashboard/         # Manager dashboard
│   ├── login/             # Login page
│   ├── shop/              # Product browsing
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
│
├── components/            # Reusable components
│   └── shared/
│       └── ErrorBoundary.tsx
│
├── lib/                   # Core library
│   ├── config/           # Configuration
│   │   └── api.config.ts
│   ├── services/         # API services
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   └── checkout.service.ts
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useCart.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   └── utils/            # Utility functions
│       ├── formatters.ts
│       └── validators.ts
│
├── public/               # Static assets
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Pages

### Public Pages

- `/` - Home page
- `/shop` - Browse products
- `/shop/[id]` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/checkout/success` - Order confirmation
- `/login` - Manager login

### Protected Pages (Require Authentication)

- `/dashboard` - Manager dashboard
- `/dashboard/products` - Product management

## API Service Layer

All API calls are abstracted into service classes:

### Example: Using Product Service

```typescript
import { productService } from '@/lib/services/product.service';

// Get all products
const response = await productService.getAllProducts();
const products = response.data;

// Get product by ID
const response = await productService.getProductById(1);
const product = response.data;

// Create product (requires auth)
const response = await productService.createProduct({
  name: "New Product",
  price: 9.99,
  stock_quantity: 100
});
```

## Custom Hooks

### useAuth Hook

```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const handleLogin = async () => {
    const result = await login({
      email: "user@example.com",
      password: "password"
    });
    
    if (result.success) {
      // Login successful
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### useCart Hook

```typescript
import { useCart } from '@/lib/hooks/useCart';

function MyComponent() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useCart();
  
  return (
    <div>
      <p>Total Items: {getTotalItems()}</p>
      <p>Total Price: ${getTotalPrice().toFixed(2)}</p>
    </div>
  );
}
```

## TypeScript Types

All API entities are typed:

```typescript
import type { Product, CartItem, Invoice } from '@/lib/types';

const product: Product = {
  id: 1,
  name: "Product Name",
  price: 9.99,
  stock_quantity: 100,
  // ...
};
```

## Utility Functions

### Formatters

```typescript
import { formatPrice, formatDate } from '@/lib/utils/formatters';

formatPrice(9.99); // "$9.99"
formatDate(new Date()); // "December 18, 2025"
```

### Validators

```typescript
import { isValidEmail, isValidPhone } from '@/lib/utils/validators';

isValidEmail("user@example.com"); // true
isValidPhone("+1234567890"); // true
```

## Material-UI Theme

The app uses a custom Material-UI theme configured in `app/theme.ts`:

- Primary color: Blue
- Secondary color: Pink
- Dark mode support
- Custom typography
- Responsive breakpoints

## Error Handling

### Error Boundary

All pages are wrapped with an Error Boundary that catches runtime errors:

```typescript
import ErrorBoundary from '@/components/shared/ErrorBoundary';

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### API Error Handling

API errors are handled consistently:

```typescript
try {
  const response = await productService.getAllProducts();
  if (response.status === 'success') {
    // Handle success
  }
} catch (error: any) {
  // Error is already formatted by API service
  console.error(error.message);
}
```

## State Management

### Local State

- React hooks (useState, useEffect, etc.)
- Custom hooks for shared logic

### Persistent State

- localStorage for cart
- localStorage for auth token
- Session storage for temporary data

## Styling

### Global Styles

- Defined in `app/globals.css`
- CSS variables for theming
- Reset/normalize styles

### Component Styles

- Material-UI's `sx` prop
- Emotion CSS-in-JS
- Responsive design with MUI breakpoints

## Best Practices

1. **Type Safety**: Always use TypeScript types
2. **Error Handling**: Use try-catch for async operations
3. **Validation**: Validate forms before submission
4. **Performance**: Use React.memo for expensive components
5. **Accessibility**: Follow WCAG guidelines
6. **SEO**: Use Next.js metadata API

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:3001 |
| NODE_ENV | Environment | development |

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

- Build with `npm run build`
- Serve `.next` folder
- Ensure environment variables are set

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow TypeScript best practices
2. Use existing component patterns
3. Add types for new features
4. Update documentation

## License

ISC

## Support

For issues or questions, please refer to the ARCHITECTURE.md file or contact support@oopshop.com

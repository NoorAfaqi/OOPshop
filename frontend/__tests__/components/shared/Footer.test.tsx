import { render, screen } from '@testing-library/react';
import Footer from '@/components/shared/Footer';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}));

describe('Footer Component', () => {
  it('should render footer with copyright text', () => {
    render(<Footer />);
    
    // Use getAllByText since "OOPshop" appears multiple times
    const oopshopElements = screen.getAllByText(/OOPshop/i);
    expect(oopshopElements.length).toBeGreaterThan(0);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('should render current year in copyright', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('should render shop links', () => {
    render(<Footer />);
    
    expect(screen.getByText('All Products')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});

"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Alert,
  InputAdornment,
  alpha,
  CircularProgress,
  MenuItem,
  Pagination,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import UserProfileMenu from "@/components/shared/UserProfileMenu";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Product {
  id: number;
  name: string;
  price: number;
  brand: string | null;
  image_url: string | null;
  category: string | null;
  stock_quantity: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  const loadCart = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCart(parsed);
          setIsCartLoaded(true);
        } catch {
          setCart([]);
          setIsCartLoaded(true);
        }
      } else {
        setCart([]);
        setIsCartLoaded(true);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    loadCart();
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        setIsAuthenticated(!!token);
      }
    };
    checkAuth();

    // Listen for storage changes (e.g., when user signs in/out in another tab)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);

    // Listen for cart updates from other pages only
    const handleCartUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      // Only reload if the update came from another page
      if (customEvent.detail?.source !== "shop") {
        setTimeout(() => {
          loadCart();
        }, 50);
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    // Only save to localStorage after cart has been loaded to prevent overwriting with empty array
    if (isCartLoaded && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    }
  }, [cart, isCartLoaded]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedBrand !== "all") params.set("brand", selectedBrand);
      params.set("available", "true");
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      
      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      
      // Handle both paginated and non-paginated responses
      if (data.pagination) {
        setProducts(data.data || []);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.pages);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotal(data.length);
        setTotalPages(1);
      } else if (data.data) {
        setProducts(Array.isArray(data.data) ? data.data : []);
        setTotal(data.pagination?.total || data.data.length);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setProducts([]);
        setTotal(0);
        setTotalPages(0);
      }
      
      // Load categories and brands separately for filters
      loadCategoriesAndBrands();
    } catch (error: any) {
      console.error("Error loading products:", error);
      setError(error.message || "Failed to load products. Please ensure the backend server is running.");
      setProducts([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndBrands = async () => {
    try {
      const res = await fetch(`${API_BASE}/products?available=true&limit=1000`);
      if (res.ok) {
        const data = await res.json();
        const productList = Array.isArray(data) ? data : (data.data || []);
        const uniqueCategories = Array.from(new Set(productList.map((p: Product) => p.category).filter(Boolean))) as string[];
        const uniqueBrands = Array.from(new Set(productList.map((p: Product) => p.brand).filter(Boolean))) as string[];
        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
      }
    } catch (error) {
      console.error("Error loading categories and brands:", error);
    }
  };

  useEffect(() => {
    setPage(1); // Reset to first page when filters or sorting change
  }, [search, selectedCategory, selectedBrand, sortBy, sortOrder]);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, selectedCategory, selectedBrand, sortBy, sortOrder]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const newCart = existing
        ? prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { product, quantity: 1 }];
      
      // Save to localStorage immediately
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newCart));
        // Dispatch custom event to notify other pages after a short delay
        // This ensures localStorage is saved before other pages try to read it
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { source: "shop" } }));
        }, 50);
      }
      
      return newCart;
    });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      {/* Navigation */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha("#ffffff", 0.8),
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <Box 
            sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
            onClick={() => router.push("/")}
          >
            <StoreIcon sx={{ fontSize: 28, color: "#1a1a1a" }} />
            <Typography
              variant="h6"
              sx={{ 
                color: "#1a1a1a", 
                fontWeight: 600,
                letterSpacing: "-0.5px"
              }}
            >
              OOPshop
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              onClick={() => router.push("/")}
              sx={{
                color: "#1a1a1a",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,
                px: 2,
                "&:hover": { bgcolor: alpha("#000", 0.05) }
              }}
            >
              Home
            </Button>
            {mounted && (isAuthenticated ? (
              <UserProfileMenu />
            ) : (
              <Button
                onClick={() => router.push("/signin")}
                sx={{
                  color: "#1a1a1a",
                  textTransform: "none",
                  fontSize: "15px",
                  fontWeight: 500,
                  px: 2,
                  "&:hover": { bgcolor: alpha("#000", 0.05) }
                }}
              >
                Sign In
              </Button>
            ))}
            <IconButton 
              onClick={() => router.push("/cart")}
              sx={{
                bgcolor: alpha("#667eea", 0.1),
                "&:hover": { bgcolor: alpha("#667eea", 0.2) }
              }}
            >
              <Badge 
                badgeContent={mounted ? cartCount : 0} 
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#667eea",
                    color: "white",
                  }
                }}
              >
                <ShoppingCartIcon sx={{ color: "#667eea" }} />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "#1a1a1a",
              letterSpacing: "-1px",
            }}
          >
            Explore Products
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              mb: 4,
            }}
          >
            Discover our curated collection
          </Typography>

          {/* Search and Filters */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" }, minWidth: { xs: "100%", md: 0 } }}>
              <TextField
                fullWidth
                placeholder="Search for products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    bgcolor: "white",
                    "& fieldset": {
                      borderColor: "divider",
                    },
                    "&:hover fieldset": {
                      borderColor: "#667eea",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#667eea",
                      borderWidth: "2px",
                    },
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: "1 1 calc(50% - 8px)", md: "1 1 calc(25% - 12px)" }, minWidth: { xs: "calc(50% - 8px)", sm: 0 } }}>
              <TextField
                fullWidth
                select
                label="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    bgcolor: "white",
                  },
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ flex: { xs: "1 1 calc(50% - 8px)", md: "1 1 calc(25% - 12px)" }, minWidth: { xs: "calc(50% - 8px)", sm: 0 } }}>
              <TextField
                fullWidth
                select
                label="Brand"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    bgcolor: "white",
                  },
                }}
              >
                <MenuItem value="all">All Brands</MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          {/* Sort Options */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" }, minWidth: { xs: "100%", sm: 0 } }}>
              <TextField
                fullWidth
                select
                label="Sort By"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    bgcolor: "white",
                  },
                }}
              >
                <MenuItem value="created_at-desc">Newest First</MenuItem>
                <MenuItem value="created_at-asc">Oldest First</MenuItem>
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
                <MenuItem value="name-asc">Name: A to Z</MenuItem>
                <MenuItem value="name-desc">Name: Z to A</MenuItem>
                <MenuItem value="stock_quantity-desc">Stock: High to Low</MenuItem>
                <MenuItem value="stock_quantity-asc">Stock: Low to High</MenuItem>
              </TextField>
            </Box>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "error.light",
            }}
          >
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#667eea" }} />
          </Box>
        ) : (
          <>
            {/* Products Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {products.map((product) => (
                <Card
                  key={product.id}
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "16px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "white",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                      borderColor: "#667eea",
                    },
                  }}
                  onClick={() => router.push(`/shop/${product.id}`)}
                >
                  {/* Product Image */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 240,
                      position: "relative",
                      bgcolor: "#f5f5f5",
                      borderRadius: "16px 16px 0 0",
                      overflow: "hidden",
                    }}
                  >
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ objectFit: "cover" }}
                        loading={products.indexOf(product) < 4 ? "eager" : "lazy"}
                        priority={products.indexOf(product) < 4}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        <StoreIcon sx={{ fontSize: 80, color: "#d0d0d0" }} />
                      </Box>
                    )}
                    {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                      <Chip
                        label="Low Stock"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          bgcolor: alpha("#ff9800", 0.9),
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Category */}
                    {product.category && (
                      <Chip
                        label={product.category}
                        size="small"
                        sx={{
                          mb: 1.5,
                          bgcolor: alpha("#667eea", 0.1),
                          color: "#667eea",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: "24px",
                          borderRadius: "6px",
                        }}
                      />
                    )}

                    {/* Product Name */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        fontSize: "1.1rem",
                        color: "#1a1a1a",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.name}
                    </Typography>

                    {/* Brand */}
                    {product.brand && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mb: 2,
                          fontSize: "0.875rem",
                        }}
                      >
                        {product.brand}
                      </Typography>
                    )}

                    {/* Price and Stock */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: "auto",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "#667eea",
                          letterSpacing: "-0.5px",
                        }}
                      >
                        €{Number(product.price).toFixed(2)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: product.stock_quantity > 0 ? "success.main" : "error.main",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      >
                        {product.stock_quantity > 0
                          ? `${product.stock_quantity} left`
                          : "Out of stock"}
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* Add to Cart Button */}
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddShoppingCartIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      disabled={product.stock_quantity === 0}
                      sx={{
                        bgcolor: "#667eea",
                        color: "white",
                        py: 1.2,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        "&:hover": {
                          bgcolor: "#5568d3",
                          transform: "scale(1.02)",
                        },
                        "&:disabled": {
                          bgcolor: "#e0e0e0",
                          color: "#9e9e9e",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      Add to Cart
                    </Button>
                  </Box>
                </Card>
              ))}
            </Box>

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 12,
                }}
              >
                <StoreIcon sx={{ fontSize: 100, color: "#d0d0d0", mb: 2 }} />
                <Typography
                  variant="h5"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  No products found
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Try adjusting your search or filters
                </Typography>
              </Box>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 6,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} products
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Per Page</InputLabel>
                    <Select
                      value={limit}
                      label="Per Page"
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      <MenuItem value={12}>12</MenuItem>
                      <MenuItem value={24}>24</MenuItem>
                      <MenuItem value={48}>48</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => {
                    setPage(value);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontSize: "1rem",
                    },
                    "& .Mui-selected": {
                      bgcolor: "#667eea",
                      color: "white",
                      "&:hover": {
                        bgcolor: "#5568d3",
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

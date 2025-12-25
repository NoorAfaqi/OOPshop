"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useRouter, useParams } from "next/navigation";
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
  nutritional_info: any;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [loadingOtherProducts, setLoadingOtherProducts] = useState(false);

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

    // Listen for cart updates from other pages only
    const handleCartUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      // Only reload if the update came from another page
      if (customEvent.detail?.source !== "product-detail") {
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

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/products/${params.id}`);
        if (res.ok) {
          const response = await res.json();
          console.log("API Response:", response);
          
          // Backend returns { status, message, data } format
          const productData = response.data || response;
          console.log("Product Data:", productData);
          
          // Parse nutritional_info if it's a string
          if (productData.nutritional_info && typeof productData.nutritional_info === 'string') {
            try {
              productData.nutritional_info = JSON.parse(productData.nutritional_info);
            } catch (e) {
              console.warn("Failed to parse nutritional_info:", e);
            }
          }
          
          if (!productData || !productData.id) {
            console.error("Invalid product data received:", productData);
            setProduct(null);
          } else {
            setProduct(productData);
          }
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error("Failed to load product:", res.status, errorData.message || res.statusText);
          setProduct(null);
        }
      } catch (error) {
        console.error("Error loading product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  useEffect(() => {
    const loadOtherProducts = async () => {
      if (!product) return;
      setLoadingOtherProducts(true);
      try {
        const res = await fetch(`${API_BASE}/products?available=true`);
        if (res.ok) {
          const data = await res.json();
          // Filter out the current product and limit to 10 items
          const filtered = data
            .filter((p: Product) => p.id !== product.id)
            .slice(0, 10);
          setOtherProducts(filtered);
        }
      } catch (error) {
        console.error("Error loading other products:", error);
      } finally {
        setLoadingOtherProducts(false);
      }
    };
    if (product) {
      loadOtherProducts();
    }
  }, [product]);

  const addToCart = (productToAdd?: Product, qty?: number) => {
    const productToUse = productToAdd || product;
    const quantityToUse = qty || quantity;
    if (!productToUse) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productToUse.id);
      const newCart = existing
        ? prev.map((item) =>
            item.product.id === productToUse.id
              ? { ...item, quantity: item.quantity + quantityToUse }
              : item
          )
        : [...prev, { product: productToUse, quantity: quantityToUse }];
      
      // Save to localStorage immediately
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newCart));
        // Dispatch custom event to notify other pages after a short delay
        // This ensures localStorage is saved before other pages try to read it
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { source: "product-detail" } }));
        }, 50);
      }
      
      return newCart;
    });
    // Item added to cart - no auto-navigation
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography>Product not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Toolbar>
          <IconButton onClick={() => router.push("/shop")} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <StoreIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: "text.primary", fontWeight: 600 }}
          >
            OOP Shop
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {mounted && typeof window !== "undefined" && localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) && (
              <UserProfileMenu />
            )}
            <IconButton onClick={() => router.push("/cart")}>
              <Badge badgeContent={mounted ? cartCount : 0} color="primary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
          <Box sx={{ width: { xs: "100%", md: "50%" } }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "grey.50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 400,
              }}
            >
              {product.image_url ? (
                <Box sx={{ position: "relative", width: "100%", height: 400 }}>
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="eager"
                    priority
                    style={{ objectFit: "contain" }}
                  />
                </Box>
              ) : (
                <StoreIcon sx={{ fontSize: 120, color: "grey.400" }} />
              )}
            </Paper>
          </Box>
          <Box sx={{ width: { xs: "100%", md: "50%" } }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                {product.name}
              </Typography>
              {product.brand && (
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {product.brand}
                </Typography>
              )}
              {product.category && (
                <Chip
                  label={product.category}
                  sx={{ mb: 3, borderRadius: 999 }}
                />
              )}
              <Typography variant="h3" color="primary.main" sx={{ mb: 3, fontWeight: 600 }}>
                €{Number(product.price).toFixed(2)}
              </Typography>
              <Typography variant="body1" paragraph>
                {product.stock_quantity > 0
                  ? `In stock: ${product.stock_quantity} units`
                  : "Out of stock"}
              </Typography>
              {product.nutritional_info && (
                <Paper sx={{ p: 3, mt: 3, bgcolor: "grey.50", borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600} mb={2}>
                    Nutritional Information
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    {product.nutritional_info.nutriments && Object.entries(product.nutritional_info.nutriments)
                      .filter(([key]) =>
                        [
                          "energy-kcal_100g",
                          "proteins_100g",
                          "carbohydrates_100g",
                          "fat_100g",
                          "fiber_100g",
                          "sugars_100g",
                          "salt_100g",
                        ].includes(key)
                      )
                      .map(([key, value]) => (
                        <Box key={key} sx={{ minWidth: { xs: "calc(50% - 8px)", sm: "calc(33.333% - 11px)" } }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {key
                              .replace("_100g", "")
                              .replace("-", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {String(value)} {key.includes("energy") ? "kcal" : "g"}
                          </Typography>
                        </Box>
                      ))}
                    {product.nutritional_info.nutriscore_grade && (
                      <Box sx={{ width: "100%", mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                          Nutri-Score
                        </Typography>
                        <Chip
                          label={product.nutritional_info.nutriscore_grade.toUpperCase()}
                          size="medium"
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            height: 32,
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}
              <Box sx={{ mt: 4, display: "flex", gap: 2, alignItems: "center" }}>
                <Button
                  variant="outlined"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Typography variant="h6">{quantity}</Typography>
                <Button
                  variant="outlined"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => addToCart()}
                  disabled={product.stock_quantity === 0}
                  sx={{ flexGrow: 1, borderRadius: 999 }}
                >
                  Add to Cart
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Other Items Section */}
        {otherProducts.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Other Items
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 2,
                "&::-webkit-scrollbar": {
                  height: 8,
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "grey.100",
                  borderRadius: 1,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "grey.400",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "grey.500",
                  },
                },
              }}
            >
              {loadingOtherProducts ? (
                <Box sx={{ display: "flex", justifyContent: "center", width: "100%", py: 4 }}>
                  <Typography>Loading...</Typography>
                </Box>
              ) : (
                otherProducts.map((item) => (
                  <Card
                    key={item.id}
                    sx={{
                      minWidth: 200,
                      maxWidth: 200,
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => router.push(`/shop/${item.id}`)}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: 150,
                        bgcolor: "grey.50",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="200px"
                          style={{ objectFit: "contain" }}
                        />
                      ) : (
                        <StoreIcon sx={{ fontSize: 60, color: "grey.400" }} />
                      )}
                    </Box>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </Typography>
                      {item.brand && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            mb: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.brand}
                        </Typography>
                      )}
                      <Typography variant="h6" color="primary.main" sx={{ mb: 1.5, fontWeight: 600 }}>
                        €{Number(item.price).toFixed(2)}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        startIcon={<AddShoppingCartIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item, 1);
                        }}
                        disabled={item.stock_quantity === 0}
                        sx={{ borderRadius: 999 }}
                      >
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}


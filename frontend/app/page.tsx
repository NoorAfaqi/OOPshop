"use client";

import { Box, Button, Container, Typography, AppBar, Toolbar, Card, CardContent, CardMedia, alpha, Grid, Chip } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StoreIcon from "@mui/icons-material/Store";
import UserProfileMenu from "@/components/shared/UserProfileMenu";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ImageCarousel from "@/components/shared/ImageCarousel";
import AnimatedBox from "@/components/shared/AnimatedBox";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CategoryIcon from "@mui/icons-material/Category";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface Product {
  id: number;
  name: string;
  price: number;
  brand: string | null;
  image_url: string | null;
  category: string | null;
  stock_quantity: number;
}

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    setMounted(true);
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
  }, []);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetch(`${API_BASE}/products?available=true&limit=6`);
        if (res.ok) {
          const data = await res.json();
          const products = Array.isArray(data) ? data : data.data || [];
          setFeaturedProducts(products.slice(0, 6));
        }
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadFeaturedProducts();
  }, []);

  const features = [
    {
      icon: <LocalShippingOutlinedIcon sx={{ fontSize: 40 }} />,
      title: "Free Shipping",
      description: "On orders over €50"
    },
    {
      icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 40 }} />,
      title: "Secure Payment",
      description: "100% secure transactions"
    },
    {
      icon: <SupportAgentOutlinedIcon sx={{ fontSize: 40 }} />,
      title: "24/7 Support",
      description: "Dedicated customer service"
    }
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(79, 172, 254, 0.03) 0%, transparent 50%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      {/* Navigation */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha("#ffffff", 0.95),
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid",
          borderColor: alpha("#667eea", 0.1),
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              onClick={() => router.push("/shop")}
              sx={{
                color: "#1a1a1a",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,
                px: 2,
                "&:hover": { bgcolor: alpha("#000", 0.05) }
              }}
            >
              Shop
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
          </Box>
        </Toolbar>
      </AppBar>

      {/* Carousel Hero Section */}
      <AnimatedBox animation="fadeIn" delay={0.2}>
        <Box
          sx={{
            position: "relative",
            py: { xs: 4, md: 6 },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "radial-gradient(ellipse at top, rgba(102, 126, 234, 0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            },
          }}
        >
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <ImageCarousel
            slides={[
              {
                id: 1,
                title: "Discover Your Perfect Product",
                description: "Premium quality products curated just for you. Shop with confidence.",
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
                gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                buttonText: "Start Shopping",
                buttonLink: "/shop",
              },
              {
                id: 2,
                title: "New Arrivals",
                description: "Check out our latest collection of trending products. Fresh styles, great prices.",
                image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
                gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                buttonText: "Shop Now",
                buttonLink: "/shop",
              },
              {
                id: 3,
                title: "Special Offers",
                description: "Limited time deals on selected items. Don't miss out on amazing savings!",
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
                gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                buttonText: "View Deals",
                buttonLink: "/shop",
              },
              {
                id: 4,
                title: "Free Shipping",
                description: "Enjoy free shipping on orders over €50. Fast and reliable delivery to your door.",
                image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&q=80",
                gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                buttonText: "Shop Now",
                buttonLink: "/shop",
              },
            ]}
            autoPlay={true}
            interval={5000}
            height={500}
          />
          </Container>
        </Box>
      </AnimatedBox>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <Box
          sx={{
            py: { xs: 6, md: 10 },
            position: "relative",
            background: `
              linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.02) 100%),
              radial-gradient(circle at 10% 20%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 90% 80%, rgba(79, 172, 254, 0.04) 0%, transparent 50%)
            `,
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              opacity: 0.3,
              pointerEvents: "none",
            },
          }}
        >
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
            <AnimatedBox animation="fadeIn" delay={0.1}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 5 }}>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                      mb: 0.5,
                    }}
                  >
                    Featured Products
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Handpicked selections just for you
                  </Typography>
                </Box>
                <Button
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push("/shop")}
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    color: "#667eea",
                    borderColor: alpha("#667eea", 0.3),
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    px: 3,
                    borderRadius: "8px",
                    "&:hover": {
                      bgcolor: alpha("#667eea", 0.1),
                      borderColor: "#667eea",
                      transform: "translateX(4px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  View All
                </Button>
              </Box>
            </AnimatedBox>
            <Grid container spacing={3}>
              {featuredProducts.map((product, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                  <AnimatedBox animation="slideUp" delay={index * 0.1} duration={0.5}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        bgcolor: "white",
                        borderRadius: "20px",
                        border: "1px solid",
                        borderColor: alpha("#667eea", 0.1),
                        cursor: "pointer",
                        overflow: "hidden",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        "&:hover": {
                          transform: "translateY(-12px) scale(1.02)",
                          boxShadow: "0 24px 48px rgba(102, 126, 234, 0.15)",
                          borderColor: alpha("#667eea", 0.3),
                        },
                      }}
                      onClick={() => router.push(`/shop/${product.id}`)}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          overflow: "hidden",
                          height: 240,
                          bgcolor: alpha("#667eea", 0.03),
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="240"
                          image={product.image_url || "https://via.placeholder.com/300x200?text=No+Image"}
                          alt={product.name}
                          sx={{
                            objectFit: "cover",
                            transition: "transform 0.4s ease",
                            "&:hover": {
                              transform: "scale(1.1)",
                            },
                          }}
                        />
                        {product.category && (
                          <Chip
                            label={product.category}
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 12,
                              left: 12,
                              bgcolor: alpha("#fff", 0.95),
                              backdropFilter: "blur(10px)",
                              color: "#667eea",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            color: "#1a1a1a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            minHeight: "3em",
                          }}
                        >
                          {product.name}
                        </Typography>
                        {product.brand && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              mb: 2,
                              fontSize: "0.85rem",
                            }}
                          >
                            {product.brand}
                          </Typography>
                        )}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: "#667eea",
                              fontSize: "1.25rem",
                            }}
                          >
                            €{Number(product.price).toFixed(2)}
                          </Typography>
                          <Chip
                            label={product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                            size="small"
                            color={product.stock_quantity > 0 ? "success" : "default"}
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </AnimatedBox>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Categories Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          position: "relative",
          background: `
            linear-gradient(180deg, #ffffff 0%, #fafbff 50%, #ffffff 100%),
            radial-gradient(ellipse at center, rgba(102, 126, 234, 0.03) 0%, transparent 70%)
          `,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <AnimatedBox animation="fadeIn" delay={0.1}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  color: "#1a1a1a",
                }}
              >
                Shop by Category
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                Explore our wide range of products
              </Typography>
            </Box>
          </AnimatedBox>
          <Grid container spacing={3}>
            {[
              { name: "Electronics", icon: <CategoryIcon sx={{ fontSize: 40 }} />, color: "#667eea", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
              { name: "Food & Beverages", icon: <ShoppingBagIcon sx={{ fontSize: 40 }} />, color: "#f5576c", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
              { name: "Home & Living", icon: <StoreIcon sx={{ fontSize: 40 }} />, color: "#4facfe", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
              { name: "Trending Now", icon: <TrendingUpIcon sx={{ fontSize: 40 }} />, color: "#43e97b", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
            ].map((category, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={category.name}>
                <AnimatedBox animation="scale" delay={index * 0.1} duration={0.5}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      background: category.gradient,
                      borderRadius: "24px",
                      cursor: "pointer",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      textAlign: "center",
                      p: 4,
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-12px) scale(1.05)",
                        boxShadow: `0 24px 48px ${alpha(category.color, 0.3)}`,
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(255, 255, 255, 0.1)",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      },
                      "&:hover::before": {
                        opacity: 1,
                      },
                    }}
                    onClick={() => router.push(`/shop?category=${category.name}`)}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        p: 2.5,
                        borderRadius: "20px",
                        bgcolor: alpha("#fff", 0.2),
                        backdropFilter: "blur(10px)",
                        color: "white",
                        mb: 2,
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: "white",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {category.name}
                    </Typography>
                  </Card>
                </AnimatedBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          position: "relative",
          background: `
            linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(79, 172, 254, 0.02) 100%),
            radial-gradient(circle at 30% 50%, rgba(102, 126, 234, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 70% 50%, rgba(118, 75, 162, 0.03) 0%, transparent 50%)
          `,
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23667eea' fill-opacity='0.02'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5z'/%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.4,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <AnimatedBox animation="fadeIn" delay={0.1}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  color: "#1a1a1a",
                }}
              >
                Why Choose Us
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                Experience the difference
              </Typography>
            </Box>
          </AnimatedBox>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {features.map((feature, index) => (
              <AnimatedBox
                key={index}
                animation="slideUp"
                delay={index * 0.1}
                duration={0.5}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    bgcolor: "white",
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: alpha("#667eea", 0.1),
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(102, 126, 234, 0.12)",
                      borderColor: alpha("#667eea", 0.3),
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", p: 4 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        p: 3,
                        borderRadius: "20px",
                        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                        color: "#667eea",
                        mb: 3,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.1) rotate(5deg)",
                        },
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1.5,
                        color: "#1a1a1a",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.7,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </AnimatedBox>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <AnimatedBox animation="fadeIn" delay={0.1}>
            <Grid container spacing={4}>
              {[
                { number: "10K+", label: "Happy Customers", icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 40 }} /> },
                { number: "500+", label: "Products", icon: <ShoppingBagIcon sx={{ fontSize: 40 }} /> },
                { number: "50+", label: "Categories", icon: <CategoryIcon sx={{ fontSize: 40 }} /> },
                { number: "24/7", label: "Support", icon: <SupportAgentOutlinedIcon sx={{ fontSize: 40 }} /> },
              ].map((stat, index) => (
                <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                  <AnimatedBox animation="slideUp" delay={index * 0.1} duration={0.5}>
                    <Box sx={{ textAlign: "center" }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          p: 2.5,
                          borderRadius: "20px",
                          bgcolor: alpha("#fff", 0.2),
                          backdropFilter: "blur(10px)",
                          color: "white",
                          mb: 3,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.1) rotate(5deg)",
                            bgcolor: alpha("#fff", 0.3),
                          },
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          color: "white",
                          fontSize: { xs: "2rem", md: "2.5rem" },
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: alpha("#fff", 0.9),
                          fontWeight: 500,
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </AnimatedBox>
                </Grid>
              ))}
            </Grid>
          </AnimatedBox>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          position: "relative",
          background: `
            linear-gradient(180deg, #ffffff 0%, #f8f9ff 50%, #ffffff 100%),
            radial-gradient(ellipse at 50% 0%, rgba(102, 126, 234, 0.04) 0%, transparent 60%)
          `,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <AnimatedBox animation="fadeIn" delay={0.1}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  color: "#1a1a1a",
                }}
              >
                What Our Customers Say
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                Real feedback from real customers
              </Typography>
            </Box>
          </AnimatedBox>
          <Grid container spacing={3}>
            {[
              {
                name: "Sarah Johnson",
                role: "Regular Customer",
                text: "Amazing quality products and fast shipping! I've been shopping here for months and always satisfied.",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Premium Member",
                text: "Best online shopping experience I've had. Great prices and excellent customer service.",
                rating: 5,
              },
              {
                name: "Emma Williams",
                role: "New Customer",
                text: "Found exactly what I was looking for. The product quality exceeded my expectations!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <AnimatedBox animation="slideUp" delay={index * 0.1} duration={0.5}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      bgcolor: "white",
                      borderRadius: "20px",
                      border: "1px solid",
                      borderColor: alpha("#667eea", 0.1),
                      p: 4,
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 20px 40px rgba(102, 126, 234, 0.12)",
                        borderColor: alpha("#667eea", 0.3),
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", mb: 3, gap: 0.5 }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          sx={{
                            fontSize: 22,
                            color: i < testimonial.rating ? "#ffc107" : "#e0e0e0",
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        color: "text.secondary",
                        fontStyle: "italic",
                        lineHeight: 1.8,
                        fontSize: "0.95rem",
                      }}
                    >
                      "{testimonial.text}"
                    </Typography>
                    <Box sx={{ pt: 2, borderTop: `1px solid ${alpha("#667eea", 0.1)}` }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: "#1a1a1a",
                          mb: 0.5,
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.85rem",
                        }}
                      >
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Card>
                </AnimatedBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <AnimatedBox animation="fadeIn" delay={0.2}>
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-50%",
              right: "-20%",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-50%",
              left: "-20%",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)",
            },
          }}
        >
          <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                }}
              >
                Ready to Shop?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 5,
                  opacity: 0.9,
                  fontWeight: 400,
                  fontSize: "1.1rem",
                }}
              >
                Explore our curated collection of premium products
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/shop")}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  px: 6,
                  py: 2,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 40px rgba(102, 126, 234, 0.5)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Browse Products
              </Button>
            </Box>
          </Container>
        </Box>
      </AnimatedBox>

    </Box>
  );
}

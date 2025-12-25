"use client";

import { Box, Button, Container, Typography, AppBar, Toolbar, Card, CardContent, alpha } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StoreIcon from "@mui/icons-material/Store";
import UserProfileMenu from "@/components/shared/UserProfileMenu";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 8, md: 16 },
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "2.5rem", md: "4rem" },
                fontWeight: 700,
                mb: 2,
                letterSpacing: "-2px",
                lineHeight: 1.1,
              }}
            >
              Discover Your
              <br />
              Perfect Product
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1.1rem", md: "1.3rem" },
                mb: 4,
                opacity: 0.95,
                fontWeight: 400,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Premium quality products curated just for you.
              Shop with confidence.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/shop")}
                sx={{
                  bgcolor: "white",
                  color: "#667eea",
                  px: 4,
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                  "&:hover": {
                    bgcolor: "#f5f5f5",
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 50px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Start Shopping
              </Button>
            </Box>
          </Box>
        </Container>

        {/* Decorative elements */}
        <Box
          sx={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: alpha("#fff", 0.1),
            filter: "blur(100px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-20%",
            left: "-10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: alpha("#fff", 0.1),
            filter: "blur(120px)",
          }}
        />
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, 1fr)",
            },
            gap: 4,
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                height: "100%",
                bgcolor: "white",
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    p: 2,
                    borderRadius: "16px",
                    bgcolor: alpha("#667eea", 0.1),
                    color: "#667eea",
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    color: "#1a1a1a",
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          bgcolor: "#1a1a1a",
          color: "white",
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                letterSpacing: "-1px",
              }}
            >
              Ready to Shop?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.8,
                fontWeight: 400,
              }}
            >
              Explore our curated collection of premium products
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/shop")}
              sx={{
                bgcolor: "white",
                color: "#1a1a1a",
                px: 5,
                py: 1.5,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#f5f5f5",
                  transform: "scale(1.05)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Browse Products
            </Button>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}

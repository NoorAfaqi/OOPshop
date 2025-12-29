"use client";

import { useState, useEffect } from "react";
import { Box, Container, Typography, Link } from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import { useRouter, usePathname } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide footer on dashboard, account, and login pages
  // Use mounted check to ensure consistent SSR/client rendering
  const shouldHide = mounted && (pathname?.startsWith("/dashboard") || pathname?.startsWith("/account") || pathname === "/login");

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1a1a1a",
        color: "white",
        py: 6,
        mt: "auto",
        display: shouldHide ? "none" : "block",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 4 }}>
          {/* Brand Section */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 30%" }, minWidth: { xs: "100%", md: 0 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
                cursor: "pointer",
              }}
              onClick={() => router.push("/")}
            >
              <StoreIcon sx={{ fontSize: 28, color: "#667eea" }} />
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontWeight: 600,
                  letterSpacing: "-0.5px",
                }}
              >
                OOPshop
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
              Your trusted online marketplace for premium products. Shop with confidence and enjoy fast, secure delivery.
            </Typography>
          </Box>

          {/* Shop Section */}
          <Box sx={{ flex: { xs: "1 1 calc(50% - 16px)", md: "0 0 150px" }, minWidth: { xs: "calc(50% - 16px)", md: 0 } }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Shop
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                component="button"
                onClick={() => router.push("/shop")}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  "&:hover": { color: "#667eea" },
                  textAlign: "left",
                  fontSize: "0.875rem",
                }}
              >
                All Products
              </Link>
              <Link
                component="button"
                onClick={() => router.push("/")}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  "&:hover": { color: "#667eea" },
                  textAlign: "left",
                  fontSize: "0.875rem",
                }}
              >
                Home
              </Link>
            </Box>
          </Box>

          {/* Account Section */}
          <Box sx={{ flex: { xs: "1 1 calc(50% - 16px)", md: "0 0 150px" }, minWidth: { xs: "calc(50% - 16px)", md: 0 } }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Account
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                component="button"
                onClick={() => router.push("/signin")}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  "&:hover": { color: "#667eea" },
                  textAlign: "left",
                  fontSize: "0.875rem",
                }}
              >
                Sign In
              </Link>
              <Link
                component="button"
                onClick={() => router.push("/signup")}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  "&:hover": { color: "#667eea" },
                  textAlign: "left",
                  fontSize: "0.875rem",
                }}
              >
                Sign Up
              </Link>
              <Link
                component="button"
                onClick={() => router.push("/account")}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  "&:hover": { color: "#667eea" },
                  textAlign: "left",
                  fontSize: "0.875rem",
                }}
              >
                My Account
              </Link>
            </Box>
          </Box>

          {/* Support Section */}
          <Box sx={{ flex: { xs: "1 1 calc(50% - 16px)", md: "0 0 150px" }, minWidth: { xs: "calc(50% - 16px)", md: 0 } }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Support
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                href="#"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#667eea" },
                }}
              >
                Contact Us
              </Link>
              <Link
                href="#"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#667eea" },
                }}
              >
                FAQ
              </Link>
              <Link
                href="#"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#667eea" },
                }}
              >
                Shipping Info
              </Link>
            </Box>
          </Box>

          {/* Legal Section */}
          <Box sx={{ flex: { xs: "1 1 calc(50% - 16px)", md: "0 0 150px" }, minWidth: { xs: "calc(50% - 16px)", md: 0 } }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Legal
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                href="#"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#667eea" },
                }}
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#667eea" },
                }}
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#667eea" },
                }}
              >
                Returns
              </Link>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            mt: 4,
            pt: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            © {new Date().getFullYear()} OOPshop. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Link
              href="#"
              sx={{
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": { color: "#667eea" },
              }}
            >
              Privacy
            </Link>
            <Link
              href="#"
              sx={{
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": { color: "#667eea" },
              }}
            >
              Terms
            </Link>
            <Link
              href="#"
              sx={{
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": { color: "#667eea" },
              }}
            >
              Contact
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}


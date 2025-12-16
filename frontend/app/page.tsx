"use client";

import { Box, Button, Container, Typography, AppBar, Toolbar } from "@mui/material";
import { useRouter } from "next/navigation";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

export default function Home() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
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
          <StoreIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: "text.primary", fontWeight: 600 }}
          >
            OOP Shop
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push("/shop")}
            sx={{ mr: 2, borderRadius: 999 }}
          >
            Shop
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push("/login")}
            sx={{ borderRadius: 999 }}
          >
            Manager Login
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <ShoppingBagIcon sx={{ fontSize: 120, color: "primary.main", mb: 3 }} />
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            Welcome to OOP Shop
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
            Discover quality products with professional management
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/shop")}
              sx={{
                borderRadius: 999,
                px: 5,
                py: 1.5,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1.1rem",
              }}
            >
              Start Shopping
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push("/login")}
              sx={{
                borderRadius: 999,
                px: 5,
                py: 1.5,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1.1rem",
              }}
            >
              Manager Portal
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

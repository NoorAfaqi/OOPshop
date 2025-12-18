"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography,
  Alert,
  AppBar,
  Toolbar,
  alpha,
  Divider,
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await res.json();

      // Store token and user data
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.data.token);
        localStorage.setItem("user_data", JSON.stringify(data.data.user));
      }

      // Redirect based on role
      const user = data.data.user;
      if (user.role === "admin" || user.role === "manager") {
        router.push("/dashboard");
      } else {
        router.push("/account");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

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
        <Toolbar>
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
                letterSpacing: "-0.5px",
              }}
            >
              OOPshop
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "20px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "white",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "inline-flex",
                p: 2,
                borderRadius: "16px",
                bgcolor: alpha("#667eea", 0.1),
                mb: 2,
              }}
            >
              <PersonIcon sx={{ fontSize: 40, color: "#667eea" }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "#1a1a1a",
                letterSpacing: "-1px",
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Sign in to your account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
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

              <TextField
                fullWidth
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
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

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LockIcon />}
                sx={{
                  bgcolor: "#667eea",
                  color: "white",
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  "&:hover": {
                    bgcolor: "#5568d3",
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3 }} />

          {/* Sign Up Link */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Don't have an account?{" "}
              <Link
                href="/signup"
                style={{
                  color: "#667eea",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Card>

        {/* Back to Shop */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Link
            href="/shop"
            style={{
              color: "#666",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "#667eea"}
            onMouseOut={(e) => e.currentTarget.style.color = "#666"}
          >
            ← Back to Shop
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

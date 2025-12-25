"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  TextField,
  Typography,
  Alert,
  Button,
  Grid,
  CircularProgress,
  alpha,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    profile_picture_url: "",
    billing_street: "",
    billing_zip: "",
    billing_city: "",
    billing_country: "",
  });

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("auth_token")
      : null;

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!token) {
          router.push("/signin");
          return;
        }

        // Fetch user data from account/me endpoint
        const res = await fetch(`${API_BASE}/account/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const user = data.data || data;
          setForm({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            phone: user.phone || "",
            profile_picture_url: user.profile_picture_url || "",
            billing_street: user.billing_street || "",
            billing_zip: user.billing_zip || "",
            billing_city: user.billing_city || "",
            billing_country: user.billing_country || "",
          });
        } else {
          // Fallback to localStorage if API fails
          const userData =
            typeof window !== "undefined"
              ? window.localStorage.getItem("user_data")
              : null;

          if (userData) {
            const parsedUser = JSON.parse(userData);
            setForm({
              first_name: parsedUser.first_name || "",
              last_name: parsedUser.last_name || "",
              phone: parsedUser.phone || "",
              profile_picture_url: parsedUser.profile_picture_url || "",
              billing_street: parsedUser.billing_street || "",
              billing_zip: parsedUser.billing_zip || "",
              billing_city: parsedUser.billing_city || "",
              billing_country: parsedUser.billing_country || "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [router, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!token) {
        router.push("/signin");
        return;
      }

      const userData =
        typeof window !== "undefined"
          ? window.localStorage.getItem("user_data")
          : null;

      if (!userData) {
        router.push("/signin");
        return;
      }

      // Use account/me endpoint instead of users/:id
      const res = await fetch(`${API_BASE}/account/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await res.json();
      const updatedUser = data.data || data;

      // Update localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem("user_data", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("authChanged"));
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress sx={{ color: "#667eea" }} />
      </Box>
    );
  }

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <SettingsIcon sx={{ fontSize: 28, color: "#667eea" }} />
          <Typography variant="h5" fontWeight={600}>
            Profile Settings
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Update your personal information and billing address
        </Typography>
      </Card>

      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "white",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Profile updated successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Personal Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Profile Picture URL"
                type="url"
                value={form.profile_picture_url}
                onChange={(e) => setForm({ ...form, profile_picture_url: e.target.value })}
                placeholder="https://example.com/profile.jpg"
                helperText="Enter a URL to your profile picture"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            {form.profile_picture_url && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    component="img"
                    src={form.profile_picture_url}
                    alt="Profile preview"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      objectFit: "cover",
                      border: "2px solid",
                      borderColor: "divider",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Profile picture preview
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Billing Address
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Street Address"
                value={form.billing_street}
                onChange={(e) => setForm({ ...form, billing_street: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="City"
                value={form.billing_city}
                onChange={(e) => setForm({ ...form, billing_city: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={form.billing_zip}
                onChange={(e) => setForm({ ...form, billing_zip: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Country"
                value={form.billing_country}
                onChange={(e) => setForm({ ...form, billing_country: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => router.back()}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: "#667eea",
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                "&:hover": {
                  bgcolor: "#5568d3",
                },
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
}


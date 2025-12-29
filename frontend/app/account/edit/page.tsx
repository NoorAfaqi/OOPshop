"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  Alert,
  Grid,
  alpha,
} from "@mui/material";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
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
      setLoadingUser(true);
      try {
        if (!token) {
          router.push("/signin");
          return;
        }

        // Use account/me endpoint
        const res = await fetch(`${API_BASE}/account/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load user data");
        }

        const data = await res.json();
        const userData_actual = data.data || data;
        
        setForm({
          first_name: userData_actual.first_name || "",
          last_name: userData_actual.last_name || "",
          phone: userData_actual.phone || "",
          billing_street: userData_actual.billing_street || "",
          billing_zip: userData_actual.billing_zip || "",
          billing_city: userData_actual.billing_city || "",
          billing_country: userData_actual.billing_country || "",
        });
      } catch (err) {
        setError("Failed to load user data");
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

    if (!form.first_name || !form.last_name) {
      setError("First name and last name are required");
      setLoading(false);
      return;
    }

    try {
      const userData =
        typeof window !== "undefined"
          ? window.localStorage.getItem("user_data")
          : null;

      if (!userData) {
        throw new Error("User not found");
      }

      // Use account/me endpoint
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

      // Update localStorage
      const response = await res.json();
      const updatedUser = response.data || response;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("user_data", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("authChanged"));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/account");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography>Loading...</Typography>
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
        <Typography variant="h5" fontWeight={600} mb={1}>
          Edit Your Profile
        </Typography>
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
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Profile updated successfully! Redirecting...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="First Name"
                  required
                  fullWidth
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Last Name"
                  required
                  fullWidth
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Billing Address
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Street Address"
                  fullWidth
                  value={form.billing_street}
                  onChange={(e) =>
                    setForm({ ...form, billing_street: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="ZIP Code"
                  fullWidth
                  value={form.billing_zip}
                  onChange={(e) =>
                    setForm({ ...form, billing_zip: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="City"
                  fullWidth
                  value={form.billing_city}
                  onChange={(e) =>
                    setForm({ ...form, billing_city: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Country"
                  fullWidth
                  value={form.billing_country}
                  onChange={(e) =>
                    setForm({ ...form, billing_country: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={loading}
                    sx={{ borderRadius: "10px" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      bgcolor: "#667eea",
                      borderRadius: "10px",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#5568d3",
                      },
                    }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Card>
    </Box>
  );
}


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
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

  useEffect(() => {
    const loadUser = async () => {
      setLoadingUser(true);
      try {
        const res = await fetch(`${API_BASE}/users/${userId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load user");
        }
        const data = await res.json();
        const user = Array.isArray(data) ? data[0] : data.data || data;
        setForm({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          phone: user.phone || "",
          billing_street: user.billing_street || "",
          billing_zip: user.billing_zip || "",
          billing_city: user.billing_city || "",
          billing_country: user.billing_country || "",
        });
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setLoadingUser(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.first_name || !form.last_name) {
      setError("First name and last name are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update user");
      }

      router.push(`/dashboard/users/${userId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Typography variant="h5" fontWeight={600} mb={3}>
        Edit User
      </Typography>

      <Card sx={{ p: 3, maxWidth: 800 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
                label="Street"
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
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
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


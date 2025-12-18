"use client";

import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { STORAGE_KEYS } from "@/lib/config/api.config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface SalesTrendPoint {
  date: string;
  total: number;
}

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    total_sales: number;
    avg_purchase: number;
    median_payment: number;
    sales_trend: SalesTrendPoint[];
  } | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const token =
          typeof window !== "undefined"
            ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
            : null;
        const res = await fetch(`${API_BASE}/reports`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load KPIs");
        }
        const data = await res.json();
        setMetrics({
          total_sales: data.total_sales,
          avg_purchase: data.avg_purchase,
          median_payment: data.median_payment,
          sales_trend: data.sales_trend || [],
        });
      } catch (err: any) {
        setError(err.message || "Failed to load KPIs");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Typography variant="h5" fontWeight={600}>
        Overview
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Total sales
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {loading
                ? "—"
                : `€${(metrics?.total_sales ?? 0).toFixed(2).toString()}`}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Average purchase
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {loading
                ? "—"
                : `€${(metrics?.avg_purchase ?? 0).toFixed(2).toString()}`}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Median payment
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {loading
                ? "—"
                : `€${(metrics?.median_payment ?? 0).toFixed(2).toString()}`}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Sales trend (daily)
        </Typography>
        <Box
          sx={{
            height: 180,
            display: "flex",
            alignItems: "flex-end",
            gap: 0.75,
          }}
        >
          {!loading && metrics?.sales_trend?.length
            ? metrics.sales_trend.map((p) => (
                <Box
                  key={p.date}
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: "60%",
                      borderRadius: 999,
                      bgcolor: "primary.main",
                      height: `${Math.min(
                        100,
                        (Number(p.total) / (metrics.total_sales || 1)) * 100
                      )}%`,
                      transition: "height 0.3s ease-out",
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {new Date(p.date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))
            : !loading && (
                <Typography variant="body2" color="text.secondary">
                  No sales data yet.
                </Typography>
              )}
          {error && (
            <Typography variant="body2" color="error" sx={{ ml: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

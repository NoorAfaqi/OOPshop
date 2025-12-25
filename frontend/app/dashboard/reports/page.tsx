"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Skeleton,
  alpha,
  Chip,
} from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import { STORAGE_KEYS } from "@/lib/config/api.config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface SalesTrendPoint {
  date: string;
  total: number;
}

interface TopProduct {
  id: number;
  name: string;
  total_quantity: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [metrics, setMetrics] = useState<{
    total_sales: number;
    avg_purchase: number;
    median_payment: number;
    sales_trend: SalesTrendPoint[];
    most_purchased_products?: TopProduct[];
  } | null>(null);

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateFrom) {
        params.set("from", dateFrom.toISOString().split("T")[0]);
      }
      if (dateTo) {
        params.set("to", dateTo.toISOString().split("T")[0]);
      }

      const res = await fetch(`${API_BASE}/reports?${params.toString()}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to load reports");
      }
      const data = await res.json();
      setMetrics({
        total_sales: data.data?.total_sales || data.total_sales || 0,
        avg_purchase: data.data?.avg_purchase || data.avg_purchase || 0,
        median_payment: data.data?.median_payment || data.median_payment || 0,
        sales_trend: data.data?.sales_trend || data.sales_trend || [],
        most_purchased_products:
          data.data?.most_purchased_products || data.most_purchased_products || [],
      });
    } catch (err: any) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilter = () => {
    fetchReports();
  };

  const handleClearFilter = () => {
    setDateFrom(null);
    setDateTo(null);
    fetchReports();
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha("#30cfd0", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#30cfd0",
            }}
          >
            <InsightsIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Reports & Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sales performance and insights
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Filter by Date Range
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="From Date"
            type="date"
            fullWidth
            size="small"
            value={dateFrom ? dateFrom.toISOString().split("T")[0] : ""}
            onChange={(e) =>
              setDateFrom(e.target.value ? new Date(e.target.value) : null)
            }
            InputLabelProps={{ shrink: true }}
            sx={{ borderRadius: 2 }}
          />
          <TextField
            label="To Date"
            type="date"
            fullWidth
            size="small"
            value={dateTo ? dateTo.toISOString().split("T")[0] : ""}
            onChange={(e) =>
              setDateTo(e.target.value ? new Date(e.target.value) : null)
            }
            InputLabelProps={{ shrink: true }}
            sx={{ borderRadius: 2 }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleApplyFilter}
              sx={{ borderRadius: 2, flex: 1 }}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearFilter}
              sx={{ borderRadius: 2, flex: 1 }}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </Card>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* KPIs */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <Card>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Total Sales
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={100} height={40} />
            ) : (
              <Typography variant="h5" fontWeight={600}>
                €{Number(metrics?.total_sales ?? 0).toFixed(2)}
              </Typography>
            )}
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Average Purchase
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={100} height={40} />
            ) : (
              <Typography variant="h5" fontWeight={600}>
                €{Number(metrics?.avg_purchase ?? 0).toFixed(2)}
              </Typography>
            )}
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Median Payment
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={100} height={40} />
            ) : (
              <Typography variant="h5" fontWeight={600}>
                €{Number(metrics?.median_payment ?? 0).toFixed(2)}
              </Typography>
            )}
          </Box>
        </Card>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 2,
        }}
      >
        {/* Sales Trend */}
        <Box>
          <Card>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                Sales Trend
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Daily sales overview
              </Typography>
            <Box
              sx={{
                height: 300,
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
            </Box>
          </Box>
          </Card>
        </Box>

        {/* Top Products */}
        <Box>
          <Card sx={{ height: "100%" }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                Top Products
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Best sellers
              </Typography>
            {!loading && metrics?.most_purchased_products?.length ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Sold</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.most_purchased_products.map((product, idx) => (
                    <TableRow
                      key={product.id}
                      sx={{
                        "&:hover": {
                          bgcolor: alpha("#667eea", 0.04),
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              bgcolor: idx < 3 ? "primary.main" : "grey.300",
                              color: idx < 3 ? "white" : "text.secondary",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                            }}
                          >
                            {idx + 1}
                          </Box>
                          <Typography variant="body2" fontWeight={idx < 3 ? 600 : 400}>
                            {product.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={product.total_quantity}
                          size="small"
                          color={idx < 3 ? "primary" : "default"}
                          sx={{ borderRadius: 1, fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : !loading ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                No product sales yet.
              </Typography>
            ) : (
              <Box sx={{ py: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
                ))}
              </Box>
            )}
          </Box>
        </Card>
        </Box>
      </Box>
    </Box>
  );
}


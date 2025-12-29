"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Link,
  Alert,
  Card,
  CardContent,
  Skeleton,
  alpha,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import { useRouter } from "next/navigation";

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

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    total_sales: number;
    avg_purchase: number;
    median_payment: number;
    sales_trend: SalesTrendPoint[];
    most_purchased_products?: TopProduct[];
  } | null>(null);
  const [quickStats, setQuickStats] = useState<{
    total_users: number;
    total_products: number;
    low_stock_count: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token =
          typeof window !== "undefined"
            ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
            : null;
        
        // Fetch reports
        const reportsRes = await fetch(`${API_BASE}/reports`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!reportsRes.ok) {
          throw new Error("Failed to load KPIs");
        }
        const reportsData = await reportsRes.json();
        setMetrics({
          total_sales: reportsData.data?.total_sales || reportsData.total_sales || 0,
          avg_purchase: reportsData.data?.avg_purchase || reportsData.avg_purchase || 0,
          median_payment: reportsData.data?.median_payment || reportsData.median_payment || 0,
          sales_trend: reportsData.data?.sales_trend || reportsData.sales_trend || [],
          most_purchased_products: reportsData.data?.most_purchased_products || reportsData.most_purchased_products || [],
        });

        // Fetch users count
        const usersRes = await fetch(`${API_BASE}/users`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const usersData = usersRes.ok ? await usersRes.json() : { data: [] };

        // Fetch products count
        const productsRes = await fetch(`${API_BASE}/products`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const productsData = productsRes.ok ? await productsRes.json() : [];
        const products = Array.isArray(productsData) ? productsData : productsData.data || [];
        
        // Fetch low stock products using API
        const lowStockRes = await fetch(`${API_BASE}/products/low-stock`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const lowStockData = lowStockRes.ok ? await lowStockRes.json() : [];
        const lowStockProducts = Array.isArray(lowStockData) ? lowStockData : (lowStockData.data || []);
        const lowStockCount = lowStockProducts.length;

        setQuickStats({
          total_users: Array.isArray(usersData) ? usersData.length : (usersData.data?.length || 0),
          total_products: products.length,
          low_stock_count: lowStockCount,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here's what's happening with your store today.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha("#fff", 0.2),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PeopleIcon />
                </Box>
                {loading ? (
                  <Skeleton variant="text" width={60} height={32} />
                ) : (
                  <Typography variant="h5" fontWeight={600}>
                    {quickStats?.total_users ?? 0}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Total Users
              </Typography>
              <Link
                component="button"
                variant="caption"
                onClick={() => router.push("/dashboard/users")}
                sx={{
                  color: "white",
                  opacity: 0.9,
                  cursor: "pointer",
                  "&:hover": { opacity: 1 },
                  textDecoration: "none",
                }}
              >
                View all →
              </Link>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha("#fff", 0.2),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <InventoryIcon />
                </Box>
                {loading ? (
                  <Skeleton variant="text" width={60} height={32} />
                ) : (
                  <Typography variant="h5" fontWeight={600}>
                    {quickStats?.total_products ?? 0}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Total Products
              </Typography>
              <Link
                component="button"
                variant="caption"
                onClick={() => router.push("/dashboard/products")}
                sx={{
                  color: "white",
                  opacity: 0.9,
                  cursor: "pointer",
                  "&:hover": { opacity: 1 },
                  textDecoration: "none",
                }}
              >
                View all →
              </Link>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card
            sx={{
              height: "100%",
              background: quickStats?.low_stock_count
                ? "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                : "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
              color: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha("#fff", 0.2),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <WarningIcon />
                </Box>
                {loading ? (
                  <Skeleton variant="text" width={60} height={32} />
                ) : (
                  <Typography variant="h5" fontWeight={600}>
                    {quickStats?.low_stock_count ?? 0}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Low Stock Alerts
              </Typography>
              {quickStats?.low_stock_count ? (
                <Link
                  component="button"
                  variant="caption"
                  onClick={() => router.push("/dashboard/products")}
                  sx={{
                    color: "white",
                    opacity: 0.9,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                    textDecoration: "none",
                  }}
                >
                  Check products →
                </Link>
              ) : (
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  All good!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha("#fff", 0.2),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AttachMoneyIcon />
                </Box>
                {loading ? (
                  <Skeleton variant="text" width={80} height={32} />
                ) : (
                  <Typography variant="h5" fontWeight={600}>
                    €{Number(metrics?.total_sales ?? 0).toFixed(0)}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Total Sales
              </Typography>
              <Link
                component="button"
                variant="caption"
                onClick={() => router.push("/dashboard/reports")}
                sx={{
                  color: "white",
                  opacity: 0.9,
                  cursor: "pointer",
                  "&:hover": { opacity: 1 },
                  textDecoration: "none",
                }}
              >
                View reports →
              </Link>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Low Stock Alert */}
      {quickStats?.low_stock_count ? (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{
            mb: 3,
            borderRadius: 2,
            "& .MuiAlert-message": {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            },
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {quickStats.low_stock_count} product{quickStats.low_stock_count !== 1 ? "s" : ""} {quickStats.low_stock_count !== 1 ? "are" : "is"} running low on stock
            </Typography>
          </Box>
          <Link
            component="button"
            variant="body2"
            onClick={() => router.push("/dashboard/products")}
            sx={{ cursor: "pointer", fontWeight: 600, ml: 2 }}
          >
            Review now →
          </Link>
        </Alert>
      ) : null}

      {/* KPIs */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: alpha("#667eea", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                  }}
                >
                  <ShoppingCartIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Average Purchase
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={100} height={32} />
                  ) : (
                    <Typography variant="h5" fontWeight={600}>
                      €{Number(metrics?.avg_purchase ?? 0).toFixed(2)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: alpha("#f5576c", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f5576c",
                  }}
                >
                  <TrendingUpIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Median Payment
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={100} height={32} />
                  ) : (
                    <Typography variant="h5" fontWeight={600}>
                      €{Number(metrics?.median_payment ?? 0).toFixed(2)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: alpha("#4facfe", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4facfe",
                  }}
                >
                  <InventoryIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Top Products
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={32} />
                  ) : (
                    <Typography variant="h5" fontWeight={600}>
                      {metrics?.most_purchased_products?.length ?? 0}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Link
                component="button"
                variant="caption"
                onClick={() => router.push("/dashboard/reports")}
                sx={{ cursor: "pointer", fontWeight: 600 }}
              >
                View details →
              </Link>
            </CardContent>
          </Card>
        </Box>
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
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                    Sales Trend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily sales overview
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ color: "primary.main", fontSize: 28 }} />
              </Box>
              {loading ? (
                <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Skeleton variant="rectangular" width="100%" height={180} />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 1,
                    px: 1,
                  }}
                >
                  {metrics?.sales_trend?.length ? (
                    metrics.sales_trend.map((p, idx) => {
                      const maxValue = Math.max(...metrics.sales_trend.map((pt) => Number(pt.total)));
                      const height = maxValue > 0 ? (Number(p.total) / maxValue) * 100 : 0;
                      return (
                        <Box
                          key={p.date}
                          sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 1,
                            position: "relative",
                            "&:hover .bar": {
                              opacity: 0.8,
                            },
                          }}
                        >
                          <Box
                            className="bar"
                            sx={{
                              width: "100%",
                              borderRadius: "4px 4px 0 0",
                              background: `linear-gradient(180deg, ${alpha("#667eea", 0.8)} 0%, ${alpha("#764ba2", 0.8)} 100%)`,
                              height: `${height}%`,
                              minHeight: height > 0 ? 4 : 0,
                              transition: "all 0.3s ease-out",
                              cursor: "pointer",
                              position: "relative",
                              "&:hover": {
                                "&::after": {
                                  content: `"€${Number(p.total).toFixed(2)}"`,
                                  position: "absolute",
                                  top: -30,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  bgcolor: "rgba(0,0,0,0.8)",
                                  color: "white",
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: "0.75rem",
                                  whiteSpace: "nowrap",
                                },
                              },
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: "0.7rem",
                              textAlign: "center",
                              transform: "rotate(-45deg)",
                              transformOrigin: "center",
                              whiteSpace: "nowrap",
                              position: "absolute",
                              bottom: -20,
                            }}
                          >
                            {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </Typography>
                        </Box>
                      );
                    })
                  ) : (
                    <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No sales data available yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Top Selling Products */}
        <Box>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                    Top Products
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Best sellers
                  </Typography>
                </Box>
                <InventoryIcon sx={{ color: "primary.main", fontSize: 28 }} />
              </Box>
              {loading ? (
                <Box>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1, borderRadius: 1 }} />
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {metrics?.most_purchased_products?.length ? (
                    metrics.most_purchased_products.slice(0, 5).map((product, idx) => (
                      <Box
                        key={product.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: idx < 3 ? alpha("#667eea", 0.08) : "transparent",
                          border: idx < 3 ? `1px solid ${alpha("#667eea", 0.2)}` : "1px solid transparent",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: alpha("#667eea", 0.12),
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
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
                              fontWeight: 600,
                              fontSize: "0.875rem",
                            }}
                          >
                            {idx + 1}
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              flex: 1,
                              fontWeight: idx < 3 ? 600 : 400,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {product.name}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${product.total_quantity}`}
                          size="small"
                          color={idx < 3 ? "primary" : "default"}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                      No product sales yet
                    </Typography>
                  )}
                </Box>
              )}
              {metrics?.most_purchased_products?.length ? (
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => router.push("/dashboard/reports")}
                  sx={{
                    mt: 2,
                    cursor: "pointer",
                    display: "block",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "primary.main",
                  }}
                >
                  View all products →
                </Link>
              ) : null}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

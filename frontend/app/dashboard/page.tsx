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
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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

// Animated Line Chart Component
function LineChart({ data }: { data: SalesTrendPoint[] }) {
  const theme = useTheme();
  const [animated, setAnimated] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => Number(d.total) || 0);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);

  // Calculate points
  const points = data.map((d, idx) => {
    const x = padding.left + (idx / (data.length - 1 || 1)) * chartWidth;
    const value = Number(d.total) || 0;
    const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue || 1)) * chartHeight;
    return { x, y, value, date: d.date };
  });

  // Create path for line
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Create path for area under line
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative", overflow: "visible" }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible" }}
      >
        {/* Grid lines */}
        {Array.from({ length: 5 }, (_, i) => {
          const y = padding.top + (i / 4) * chartHeight;
          const value = maxValue - (i / 4) * (maxValue - minValue);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={alpha(theme.palette.divider, 0.3)}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill={theme.palette.text.secondary}
              >
                €{value.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Area gradient */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={alpha("#667eea", 0.3)} />
            <stop offset="100%" stopColor={alpha("#667eea", 0.05)} />
          </linearGradient>
        </defs>

        {/* Area under line */}
        <path
          d={areaPath}
          fill="url(#areaGradient)"
          opacity={animated ? 1 : 0}
          style={{
            transition: "opacity 0.8s ease-out",
          }}
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#667eea"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={animated ? 1 : 0}
          style={{
            transition: "opacity 0.8s ease-out",
            filter: "drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))",
          }}
        >
          <animate
            attributeName="stroke-dasharray"
            from="0 1000"
            to="1000 0"
            dur="1.5s"
            fill="freeze"
          />
        </path>

        {/* Data points */}
        {points.map((point, idx) => (
          <g key={idx}>
            {/* Hover circle */}
            {hoveredIndex === idx && (
              <circle
                cx={point.x}
                cy={point.y}
                r={8}
                fill="#667eea"
                opacity={0.2}
              >
                <animate
                  attributeName="r"
                  values="8;12;8"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.2;0.4;0.2"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            {/* Point */}
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === idx ? 6 : 4}
              fill="#667eea"
              stroke="white"
              strokeWidth={2}
              style={{
                transition: "all 0.3s ease",
                cursor: "pointer",
                transform: hoveredIndex === idx ? "scale(1.5)" : "scale(1)",
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <animate
                attributeName="opacity"
                from="0"
                to="1"
                dur="0.5s"
                begin={`${idx * 0.1}s`}
                fill="freeze"
              />
            </circle>
            {/* Date labels */}
            <text
              x={point.x}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              fill={theme.palette.text.secondary}
            >
              {new Date(point.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </text>
            {/* Value tooltip on hover */}
            {hoveredIndex === idx && (
              <g>
                <rect
                  x={point.x - 35}
                  y={point.y - 35}
                  width={70}
                  height={25}
                  rx={4}
                  fill="rgba(0, 0, 0, 0.85)"
                  opacity={0.95}
                />
                <text
                  x={point.x}
                  y={point.y - 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="white"
                  fontWeight={600}
                >
                  €{point.value.toFixed(2)}
                </text>
                <polygon
                  points={`${point.x - 6},${point.y - 10} ${point.x + 6},${point.y - 10} ${point.x},${point.y - 4}`}
                  fill="rgba(0, 0, 0, 0.85)"
                />
              </g>
            )}
          </g>
        ))}
      </svg>
    </Box>
  );
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
        
        // Calculate last 7 days date range
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const fromDate = sevenDaysAgo.toISOString().split('T')[0];
        const toDate = today.toISOString().split('T')[0];
        
        // Fetch reports for last 7 days
        const reportsRes = await fetch(`${API_BASE}/reports?from=${fromDate}&to=${toDate}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!reportsRes.ok) {
          throw new Error("Failed to load KPIs");
        }
        const reportsData = await reportsRes.json();
        const salesTrend = reportsData.data?.sales_trend || reportsData.sales_trend || [];
        
        // Generate all 7 days with data (fill missing days with 0)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - (6 - i));
          const dateStr = date.toISOString().split('T')[0];
          const existingData = salesTrend.find((item: any) => {
            const itemDate = item.date || item.created_at;
            return itemDate && itemDate.split('T')[0] === dateStr;
          });
          return {
            date: dateStr,
            total: existingData ? Number(existingData.total) || 0 : 0,
          };
        });
        
        // Ensure sales_trend data is properly formatted
        const formattedSalesTrend = last7Days;
        
        setMetrics({
          total_sales: reportsData.data?.total_sales || reportsData.total_sales || 0,
          avg_purchase: reportsData.data?.avg_purchase || reportsData.avg_purchase || 0,
          median_payment: reportsData.data?.median_payment || reportsData.median_payment || 0,
          sales_trend: formattedSalesTrend,
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
                    Last 7 days sales overview
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ color: "primary.main", fontSize: 28 }} />
              </Box>
              {loading ? (
                <Box sx={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Skeleton variant="rectangular" width="100%" height={300} />
                </Box>
              ) : (
                <Box sx={{ position: "relative", height: 320, width: "100%" }}>
                  {metrics?.sales_trend?.length ? (
                    <LineChart data={metrics.sales_trend} />
                  ) : (
                    <Box sx={{ width: "100%", textAlign: "center", py: 4, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
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

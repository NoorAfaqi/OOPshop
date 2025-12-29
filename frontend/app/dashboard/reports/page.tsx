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
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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

// Animated Line Chart Component
function LineChart({ data }: { data: SalesTrendPoint[] }) {
  const theme = useTheme();
  const [animated, setAnimated] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setAnimated(true), 100);
  }, [data]);

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
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || padding.left} ${padding.top + chartHeight} L ${points[0]?.x || padding.left} ${padding.top + chartHeight} Z`;

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
          <linearGradient id="areaGradientReports" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={alpha("#667eea", 0.3)} />
            <stop offset="100%" stopColor={alpha("#667eea", 0.05)} />
          </linearGradient>
        </defs>

        {/* Area under line */}
        {points.length > 0 && (
          <path
            d={areaPath}
            fill="url(#areaGradientReports)"
            opacity={animated ? 1 : 0}
            style={{
              transition: "opacity 0.8s ease-out",
            }}
          />
        )}

        {/* Line */}
        {points.length > 0 && (
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
        )}

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
      const salesTrend = data.data?.sales_trend || data.sales_trend || [];
      
      // Fill in missing dates if date range is provided
      let formattedSalesTrend = salesTrend;
      if (dateFrom && dateTo) {
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Create a map of existing data
        const dataMap = new Map(salesTrend.map((item: SalesTrendPoint) => [
          item.date?.split('T')[0] || item.date,
          Number(item.total) || 0
        ]));
        
        // Generate all dates in range
        formattedSalesTrend = Array.from({ length: daysDiff + 1 }, (_, i) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          return {
            date: dateStr,
            total: dataMap.get(dateStr) || 0,
          };
        });
      }
      
      setMetrics({
        total_sales: data.data?.total_sales || data.total_sales || 0,
        avg_purchase: data.data?.avg_purchase || data.avg_purchase || 0,
        median_payment: data.data?.median_payment || data.median_payment || 0,
        sales_trend: formattedSalesTrend,
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
    setTimeout(() => fetchReports(), 0);
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
                {dateFrom && dateTo 
                  ? `Sales from ${dateFrom.toLocaleDateString()} to ${dateTo.toLocaleDateString()}`
                  : "Daily sales overview"}
              </Typography>
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
                        No sales data available for the selected period
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
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


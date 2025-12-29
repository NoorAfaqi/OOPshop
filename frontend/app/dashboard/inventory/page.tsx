'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  alpha,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningIcon from '@mui/icons-material/Warning';
import { useRouter } from 'next/navigation';
import { productService } from '@/lib/services/product.service';

interface Product {
  id: number;
  name: string;
  stock_quantity: number;
  reorder_point?: number;
  price: number;
  brand?: string;
  category?: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const [lowStockRes, outOfStockRes] = await Promise.all([
        productService.getLowStockProducts(),
        productService.getOutOfStockProducts(),
      ]);

      if (lowStockRes.status === 'success' && lowStockRes.data) {
        setLowStockProducts(lowStockRes.data);
      }

      if (outOfStockRes.status === 'success' && outOfStockRes.data) {
        setOutOfStockProducts(outOfStockRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) return { label: 'Out of Stock', color: 'error' as const };
    const threshold = product.reorder_point || 10;
    if (product.stock_quantity <= threshold) {
      return { label: 'Low Stock', color: 'warning' as const };
    }
    return { label: 'In Stock', color: 'success' as const };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha('#667eea', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
          }}
        >
          <Inventory2Icon />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Inventory Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage product stock levels
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={loadInventory} title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab
            label={`Low Stock (${lowStockProducts.length})`}
            icon={<WarningIcon />}
            iconPosition="start"
          />
          <Tab
            label={`Out of Stock (${outOfStockProducts.length})`}
            icon={<Inventory2Icon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Card>
          {lowStockProducts.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Low Stock Products
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All products are above their reorder points
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="right">Reorder Point</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStockProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {product.brand || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={product.category || '—'} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={product.stock_quantity === 0 ? 'error.main' : 'warning.main'}
                        >
                          {product.stock_quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {product.reorder_point || 10}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={status.label} size="small" color={status.color} />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          onClick={() => router.push(`/dashboard/products/${product.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {tab === 1 && (
        <Card>
          {outOfStockProducts.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Out of Stock Products
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All products have stock available
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outOfStockProducts.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {product.brand || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={product.category || '—'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        €{Number(product.price).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label="Out of Stock" size="small" color="error" />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        onClick={() => router.push(`/dashboard/products/${product.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}
    </Box>
  );
}


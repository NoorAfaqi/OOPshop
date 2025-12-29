'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { productService } from '@/lib/services/product.service';

interface StockHistoryProps {
  productId: number;
}

interface StockHistoryEntry {
  id: number;
  change_type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'damage' | 'other';
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  reference_type: string | null;
  reference_id: number | null;
  created_at: string;
  first_name?: string;
  last_name?: string;
  product_name?: string;
}

export default function StockHistory({ productId }: StockHistoryProps) {
  const [history, setHistory] = useState<StockHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await productService.getStockHistory(productId, 50);
      if (response.status === 'success' && response.data) {
        setHistory(response.data);
      } else {
        setHistory([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load stock history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadHistory();
    }
  }, [productId]);

  const getChangeTypeColor = (type: string) => {
    const colors: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
      purchase: 'success',
      sale: 'error',
      adjustment: 'info',
      return: 'success',
      damage: 'error',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const formatChangeType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Stock History</Typography>
        <IconButton size="small" onClick={loadHistory} title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      {history.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No stock history available
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Change</TableCell>
              <TableCell align="right">Previous</TableCell>
              <TableCell align="right">New</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  {new Date(entry.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={formatChangeType(entry.change_type)}
                    size="small"
                    color={getChangeTypeColor(entry.change_type)}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    color={entry.quantity_change > 0 ? 'success.main' : 'error.main'}
                    fontWeight={600}
                  >
                    {entry.quantity_change > 0 ? '+' : ''}{entry.quantity_change}
                  </Typography>
                </TableCell>
                <TableCell align="right">{entry.previous_quantity}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {entry.new_quantity}
                </TableCell>
                <TableCell>
                  {entry.reason || (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {entry.first_name && entry.last_name ? (
                    `${entry.first_name} ${entry.last_name}`
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      System
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}


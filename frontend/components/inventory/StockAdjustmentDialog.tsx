'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  Alert,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { productService } from '@/lib/services/product.service';

interface StockAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    stock_quantity: number;
  };
  onSuccess: () => void;
}

export default function StockAdjustmentDialog({
  open,
  onClose,
  product,
  onSuccess,
}: StockAdjustmentDialogProps) {
  const [quantity, setQuantity] = useState('');
  const [changeType, setChangeType] = useState<'purchase' | 'adjustment' | 'return' | 'damage' | 'other'>('adjustment');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!quantity || Number(quantity) === 0) {
      setError('Please enter a valid quantity');
      return;
    }

    const quantityChange = Number(quantity);
    const newQuantity = product.stock_quantity + quantityChange;

    if (newQuantity < 0) {
      setError(`Cannot reduce stock below 0. Current stock: ${product.stock_quantity}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await productService.adjustStock(product.id, {
        quantity_change: quantityChange,
        change_type: changeType,
        reason: reason || undefined,
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity('');
    setChangeType('adjustment');
    setReason('');
    setError('');
    onClose();
  };

  const changeTypes = [
    { value: 'purchase', label: 'Purchase/Receipt' },
    { value: 'adjustment', label: 'Adjustment' },
    { value: 'return', label: 'Return' },
    { value: 'damage', label: 'Damage/Loss' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Adjust Stock: {product.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Stock
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {product.stock_quantity} units
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Quantity Change"
            type="number"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setError('');
            }}
            helperText="Enter positive number to add, negative to remove"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {Number(quantity) > 0 ? (
                    <AddIcon color="success" />
                  ) : Number(quantity) < 0 ? (
                    <RemoveIcon color="error" />
                  ) : null}
                </InputAdornment>
              ),
            }}
          />

          {quantity && Number(quantity) !== 0 && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                New Stock Quantity
              </Typography>
              <Typography
                variant="h6"
                color={product.stock_quantity + Number(quantity) < 0 ? 'error' : 'text.primary'}
                fontWeight={600}
              >
                {product.stock_quantity + Number(quantity)} units
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            select
            label="Change Type"
            value={changeType}
            onChange={(e) => setChangeType(e.target.value as any)}
          >
            {changeTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason (Optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Received new shipment, Found damaged items, etc."
          />

          {error && (
            <Alert severity="error">{error}</Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !quantity || Number(quantity) === 0}
        >
          {loading ? 'Adjusting...' : 'Adjust Stock'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}



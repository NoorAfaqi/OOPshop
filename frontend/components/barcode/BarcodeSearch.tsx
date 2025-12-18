'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { productService } from '@/lib/services/product.service';

interface BarcodeSearchProps {
  onProductFound: (product: any) => void;
  onError?: (error: string) => void;
}

export default function BarcodeSearch({ onProductFound, onError }: BarcodeSearchProps) {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSearch = async () => {
    if (!barcode.trim()) {
      setError('Please enter a barcode');
      return;
    }

    // Basic barcode validation (typically 8-13 digits)
    if (!/^\d{8,13}$/.test(barcode.trim())) {
      setError('Invalid barcode format. Please enter 8-13 digits.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await productService.fetchFromBarcode(barcode.trim());
      
      if (response.status === 'success' && response.data?.suggested) {
        setSuccess(true);
        setError('');
        onProductFound(response.data.suggested);
        
        // Reset after 2 seconds
        setTimeout(() => {
          setSuccess(false);
          setBarcode('');
        }, 2000);
      } else {
        const errorMsg = 'Product not found in OpenFoodFacts database';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch product';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearError = () => {
    setError('');
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Product Barcode"
        value={barcode}
        onChange={(e) => {
          setBarcode(e.target.value);
          handleClearError();
        }}
        onKeyPress={handleKeyPress}
        disabled={loading}
        placeholder="e.g., 3017620422003 (Nutella)"
        helperText="Enter an 8-13 digit barcode from OpenFoodFacts"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <QrCodeScannerIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: loading && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
      />

      <Button
        variant="contained"
        onClick={handleSearch}
        disabled={loading || !barcode.trim()}
        startIcon={<SearchIcon />}
        sx={{ mt: 2 }}
        fullWidth
      >
        {loading ? 'Searching OpenFoodFacts...' : 'Search Product'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={handleClearError}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Product found! Loading details...
        </Alert>
      )}

      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          <strong>Popular test barcodes:</strong>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>
              <Tooltip title="Search Nutella">
                <Button
                  size="small"
                  onClick={() => setBarcode('3017620422003')}
                  sx={{ textTransform: 'none' }}
                >
                  3017620422003 (Nutella)
                </Button>
              </Tooltip>
            </li>
            <li>
              <Tooltip title="Search Coca-Cola">
                <Button
                  size="small"
                  onClick={() => setBarcode('5449000000996')}
                  sx={{ textTransform: 'none' }}
                >
                  5449000000996 (Coca-Cola)
                </Button>
              </Tooltip>
            </li>
            <li>
              <Tooltip title="Search Kinder Bueno">
                <Button
                  size="small"
                  onClick={() => setBarcode('3017620425035')}
                  sx={{ textTransform: 'none' }}
                >
                  3017620425035 (Kinder Bueno)
                </Button>
              </Tooltip>
            </li>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}


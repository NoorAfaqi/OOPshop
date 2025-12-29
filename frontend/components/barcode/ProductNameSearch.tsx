'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { productService } from '@/lib/services/product.service';

interface ProductNameSearchProps {
  onProductSelected: (product: any) => void;
  onError?: (error: string) => void;
}

export default function ProductNameSearch({ onProductSelected, onError }: ProductNameSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const response = await productService.searchProductsByName(searchTerm.trim(), 20);
      
      if (response.status === 'success' && response.data?.products) {
        setProducts(response.data.products);
        if (response.data.products.length === 0) {
          setError('No products found. Try a different search term.');
        }
      } else {
        const errorMsg = 'No products found';
        setError(errorMsg);
        setProducts([]);
        onError?.(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to search products';
      setError(errorMsg);
      setProducts([]);
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

  const handleProductClick = async (product: any) => {
    // Fetch full product details using barcode
    try {
      const response = await productService.fetchFromBarcode(product.open_food_facts_barcode);
      if (response.status === 'success' && response.data?.suggested) {
        onProductSelected(response.data.suggested);
        setSearchTerm('');
        setProducts([]);
        setHasSearched(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product details');
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Search Product by Name"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setError('');
        }}
        onKeyPress={handleKeyPress}
        disabled={loading}
        placeholder="e.g., Nutella, Coca-Cola, Pasta"
        helperText="Enter product name to search OpenFoodFacts database"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
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
        disabled={loading || !searchTerm.trim() || searchTerm.trim().length < 2}
        startIcon={<SearchIcon />}
        sx={{ mt: 2 }}
        fullWidth
      >
        {loading ? 'Searching OpenFoodFacts...' : 'Search Products'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {products.length > 0 && (
        <Paper elevation={2} sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ p: 2, pb: 1, fontWeight: 600 }}>
            Found {products.length} products
          </Typography>
          <List>
            {products.map((product, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => handleProductClick(product)}>
                  <ListItemAvatar>
                    <Avatar
                      src={product.image_url || undefined}
                      variant="rounded"
                      sx={{ width: 56, height: 56 }}
                    >
                      {product.name?.charAt(0) || '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={product.name}
                    secondary={
                      <Box>
                        {product.brand && (
                          <Typography variant="caption" display="block">
                            Brand: {product.brand}
                          </Typography>
                        )}
                        {product.category && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {product.category}
                          </Typography>
                        )}
                        {product.nutriscore_grade && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Nutri-Score: {product.nutriscore_grade.toUpperCase()}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {hasSearched && products.length === 0 && !error && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No products found. Try a different search term or use barcode search instead.
        </Alert>
      )}
    </Box>
  );
}


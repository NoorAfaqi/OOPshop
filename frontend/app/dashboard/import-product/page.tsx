'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import BarcodeSearch from '@/components/barcode/BarcodeSearch';
import ProductNameSearch from '@/components/barcode/ProductNameSearch';
import ProductPreview from '@/components/barcode/ProductPreview';
import { productService } from '@/lib/services/product.service';
import { useRouter } from 'next/navigation';

export default function ImportProductPage() {
  const router = useRouter();
  const [productData, setProductData] = useState<any>(null);
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchTab, setSearchTab] = useState(0);

  const handleProductFound = (data: any) => {
    setProductData(data);
    setError('');
    setPrice('');
    setStockQuantity('');
    setSuccess(false);
  };

  const handleSave = async () => {
    // Validation
    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (!stockQuantity || parseInt(stockQuantity) < 0) {
      setError('Please enter a valid stock quantity');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await productService.createProduct({
        name: productData.name,
        price: parseFloat(price),
        brand: productData.brand,
        image_url: productData.image_url,
        category: productData.category,
        nutritional_info: productData.nutritional_info,
        stock_quantity: parseInt(stockQuantity),
        open_food_facts_barcode: productData.open_food_facts_barcode,
      });

      if (response.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/products');
        }, 2000);
      } else {
        setError(response.message || 'Failed to create product');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProductData(null);
    setPrice('');
    setStockQuantity('');
    setError('');
    setSuccess(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Import Product from OpenFoodFacts
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Search for products by barcode or name to automatically import product details,
        nutritional information, and images from the OpenFoodFacts database.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Left Column: Search */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Step 1: Search Product
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={searchTab} onChange={(e, v) => setSearchTab(v)}>
                <Tab icon={<QrCodeScannerIcon />} label="Barcode" />
                <Tab icon={<SearchIcon />} label="Name" />
              </Tabs>
            </Box>
            {searchTab === 0 ? (
              <BarcodeSearch
                onProductFound={handleProductFound}
                onError={setError}
              />
            ) : (
              <ProductNameSearch
                onProductSelected={handleProductFound}
                onError={setError}
              />
            )}
          </Paper>

          {/* Price and Stock Form */}
          {productData && (
            <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Step 2: Set Price & Stock
              </Typography>

              <TextField
                fullWidth
                label="Price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Product price in your currency"
                sx={{ mt: 2 }}
              />

              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
                inputProps={{ min: 0, step: 1 }}
                helperText="Initial stock quantity"
                sx={{ mt: 2 }}
              />

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving || !price || !stockQuantity}
                  fullWidth
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleReset}
                  disabled={saving}
                >
                  Reset
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Product saved successfully! Redirecting...
                </Alert>
              )}
            </Paper>
          )}
        </Grid>

        {/* Right Column: Preview */}
        <Grid size={{ xs: 12, md: 7 }}>
          {productData ? (
            <>
              <Typography variant="h6" gutterBottom>
                Product Preview
              </Typography>
              <ProductPreview product={productData} />
            </>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                bgcolor: 'grey.50',
                border: '2px dashed',
                borderColor: 'grey.300',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Product preview will appear here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Search for a product using its barcode to see the details
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Help Section */}
      <Paper elevation={0} sx={{ p: 3, mt: 4, bgcolor: 'info.lighter' }}>
        <Typography variant="h6" gutterBottom>
          💡 Tips
        </Typography>
        <ul>
          <li>
            <strong>Barcode Search:</strong> Enter the barcode number found on the product packaging (typically 8-13 digits)
          </li>
          <li>
            <strong>Name Search:</strong> Search by product name to find multiple matching products, then select the correct one
          </li>
          <li>
            If a product isn't found, you can add it manually to OpenFoodFacts first
          </li>
          <li>Review all imported data before saving</li>
          <li>
            Nutritional information is automatically imported and displayed to customers
          </li>
          <li>
            Product images are linked from OpenFoodFacts and updated automatically
          </li>
        </ul>
      </Paper>
    </Container>
  );
}


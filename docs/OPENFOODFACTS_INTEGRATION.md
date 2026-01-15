# 🍎 OpenFoodFacts API Integration Guide

Complete guide for using the OpenFoodFacts API integration in OOPshop.

## 📖 Overview

[OpenFoodFacts](https://world.openfoodfacts.org/) is a free, open, collaborative database of food products from around the world. This integration allows you to:

- 🔍 Search products by barcode
- 📊 Retrieve nutritional information
- 🏷️ Get product names, brands, and categories
- 🖼️ Fetch product images
- ⭐ Access Nutri-Score ratings

## 🎯 Features

### ✅ Already Implemented

- **Backend API Endpoint**: `POST /products/from-barcode`
- **Service Layer**: `productService.fetchFromBarcode()`
- **Frontend Service**: `productService.fetchFromBarcode()`
- **Swagger Documentation**: Available at `/api-docs`
- **Database Support**: `open_food_facts_barcode` field in products table

### 📊 Data Retrieved

The integration fetches:
- Product name
- Brand name
- Product image URL
- Category
- Nutritional information (calories, proteins, carbs, fats, etc.)
- Nutri-Score grade (A to E)
- Original barcode

## 🚀 Usage

### Backend API

#### Endpoint

```
POST /products/from-barcode
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

#### Request Body

```json
{
  "barcode": "3017620422003"
}
```

#### Response

```json
{
  "status": "success",
  "message": "Product fetched from Open Food Facts",
  "data": {
    "suggested": {
      "name": "Nutella",
      "brand": "Ferrero",
      "image_url": "https://images.openfoodfacts.org/images/products/...",
      "category": "en:spreads",
      "nutritional_info": {
        "nutriments": {
          "energy": 2255,
          "energy-kcal": 539,
          "fat": 30.9,
          "saturated-fat": 10.6,
          "carbohydrates": 57.5,
          "sugars": 56.3,
          "proteins": 6.3,
          "salt": 0.107
        },
        "nutriscore_grade": "e"
      },
      "open_food_facts_barcode": "3017620422003"
    }
  }
}
```

#### Error Response

```json
{
  "status": "error",
  "message": "Product not found in Open Food Facts"
}
```

### Using cURL

```bash
# Get your JWT token first
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oopshop.com","password":"your_password"}' \
  | jq -r '.data.token')

# Fetch product from barcode
curl -X POST http://localhost:3001/products/from-barcode \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"barcode":"3017620422003"}'
```

### Backend Service Layer

```javascript
const productService = require('./services/product.service');

// Fetch product from OpenFoodFacts
const result = await productService.fetchFromBarcode('3017620422003');
console.log(result.suggested);
```

### Frontend (TypeScript)

```typescript
import { productService } from '@/lib/services/product.service';

// Fetch product from barcode
const response = await productService.fetchFromBarcode('3017620422003');

if (response.status === 'success') {
  const productData = response.data?.suggested;
  console.log(productData);
}
```

## 🔍 Popular Barcodes for Testing

Here are some popular product barcodes you can use for testing:

| Barcode | Product | Brand |
|---------|---------|-------|
| 3017620422003 | Nutella | Ferrero |
| 5449000000996 | Coca-Cola | Coca-Cola |
| 7622210449283 | Milka Chocolate | Milka |
| 3017620425035 | Kinder Bueno | Ferrero |
| 8076809513838 | Barilla Pasta | Barilla |
| 5000159461128 | M&M's | Mars |
| 4006040240136 | Ritter Sport | Ritter Sport |
| 3228857000906 | Président Brie | Président |
| 3270160515523 | Petit Écolier | Lu |
| 3168930010265 | Danette | Danone |

## 🎨 Frontend Components

### Barcode Search Component

```typescript
// components/BarcodeSearch.tsx
'use client';

import { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import { productService } from '@/lib/services/product.service';

export default function BarcodeSearch({ onProductFound }) {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!barcode.trim()) {
      setError('Please enter a barcode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await productService.fetchFromBarcode(barcode);
      
      if (response.status === 'success' && response.data?.suggested) {
        onProductFound(response.data.suggested);
      }
    } catch (err: any) {
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Enter Barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        disabled={loading}
        placeholder="e.g., 3017620422003"
      />
      
      <Button
        variant="contained"
        onClick={handleSearch}
        disabled={loading}
        sx={{ mt: 2 }}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Search OpenFoodFacts'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
```

### Product Import Form

```typescript
// components/ProductImportForm.tsx
'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import BarcodeSearch from './BarcodeSearch';
import type { CreateProductDto } from '@/lib/types';

export default function ProductImportForm() {
  const [productData, setProductData] = useState<Partial<CreateProductDto>>({});
  const [imported, setImported] = useState(false);

  const handleProductFound = (data: any) => {
    setProductData({
      name: data.name,
      brand: data.brand,
      image_url: data.image_url,
      category: data.category,
      nutritional_info: data.nutritional_info,
      open_food_facts_barcode: data.open_food_facts_barcode,
      price: 0, // User must set price
      stock_quantity: 0, // User must set stock
    });
    setImported(true);
  };

  const handleSubmit = async () => {
    // Implement product creation
    console.log('Creating product:', productData);
  };

  return (
    <Box>
      {!imported ? (
        <BarcodeSearch onProductFound={handleProductFound} />
      ) : (
        <Card>
          {productData.image_url && (
            <CardMedia
              component="img"
              height="200"
              image={productData.image_url}
              alt={productData.name}
            />
          )}
          
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {productData.name}
            </Typography>
            
            <Typography color="text.secondary" gutterBottom>
              Brand: {productData.brand}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={productData.price || ''}
                  onChange={(e) =>
                    setProductData({ ...productData, price: parseFloat(e.target.value) })
                  }
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  type="number"
                  value={productData.stock_quantity || ''}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      stock_quantity: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => setImported(false)}>
                Search Again
              </Button>
              <Button variant="contained" onClick={handleSubmit}>
                Add Product
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
```

## 📱 Mobile Barcode Scanning

For mobile barcode scanning, you can integrate libraries like:

### Option 1: ZXing (Recommended)

```bash
npm install @zxing/browser @zxing/library
```

```typescript
import { BrowserMultiFormatReader } from '@zxing/browser';

const codeReader = new BrowserMultiFormatReader();

// Start scanning
const videoElement = document.getElementById('video');
codeReader.decodeFromVideoDevice(null, videoElement, (result, error) => {
  if (result) {
    const barcode = result.getText();
    // Use the barcode
  }
});
```

### Option 2: React-QR-Scanner

```bash
npm install react-qr-scanner
```

```typescript
import QrScanner from 'react-qr-scanner';

<QrScanner
  onScan={(data) => {
    if (data) {
      setBarcode(data.text);
    }
  }}
  onError={(error) => console.error(error)}
/>
```

## 🔧 Advanced Features

### Bulk Import

```typescript
// Import multiple products from barcodes
async function bulkImportProducts(barcodes: string[]) {
  const results = [];
  
  for (const barcode of barcodes) {
    try {
      const response = await productService.fetchFromBarcode(barcode);
      if (response.status === 'success') {
        results.push(response.data?.suggested);
      }
    } catch (error) {
      console.error(`Failed to fetch barcode ${barcode}:`, error);
    }
  }
  
  return results;
}
```

### Auto-Update Nutritional Info

```typescript
// Update existing products with latest OpenFoodFacts data
async function updateProductFromOpenFoodFacts(productId: number) {
  // Get existing product
  const product = await productService.getProductById(productId);
  
  if (product.open_food_facts_barcode) {
    // Fetch latest data
    const response = await productService.fetchFromBarcode(
      product.open_food_facts_barcode
    );
    
    if (response.status === 'success') {
      // Update product
      await productService.updateProduct(productId, {
        nutritional_info: response.data?.suggested.nutritional_info,
        image_url: response.data?.suggested.image_url,
      });
    }
  }
}
```

### Search by Product Name

```typescript
// OpenFoodFacts also supports search by name
async function searchProductsByName(searchTerm: string) {
  const response = await fetch(
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchTerm)}&json=1`
  );
  
  const data = await response.json();
  return data.products;
}
```

## 🎯 Use Cases

### 1. Quick Product Addition

Allow managers to quickly add products by scanning barcodes:
1. Open dashboard
2. Click "Add Product"
3. Scan barcode or enter manually
4. Review auto-filled data
5. Set price and stock
6. Save

### 2. Inventory Management

- Scan barcodes to check if products exist
- Update stock levels
- Track product lifecycle

### 3. Nutritional Information

- Display detailed nutrition facts
- Show Nutri-Score
- Help customers make informed choices

### 4. Product Verification

- Verify product authenticity
- Check if product matches description
- Update product information

## 📊 Nutritional Information Display

```typescript
// Display nutritional information
function NutritionalInfo({ nutriments, nutriscore }) {
  return (
    <Box>
      <Typography variant="h6">Nutritional Information (per 100g)</Typography>
      
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Energy</TableCell>
            <TableCell>{nutriments['energy-kcal']} kcal</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Fat</TableCell>
            <TableCell>{nutriments.fat}g</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Carbohydrates</TableCell>
            <TableCell>{nutriments.carbohydrates}g</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Proteins</TableCell>
            <TableCell>{nutriments.proteins}g</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Salt</TableCell>
            <TableCell>{nutriments.salt}g</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {nutriscore && (
        <Box sx={{ mt: 2 }}>
          <Typography>Nutri-Score: {nutriscore.toUpperCase()}</Typography>
          <NutriScoreBadge grade={nutriscore} />
        </Box>
      )}
    </Box>
  );
}
```

## 🔒 Security Considerations

1. **Rate Limiting**: OpenFoodFacts has rate limits. Respect them.
2. **Authentication**: Only authenticated users can access the endpoint
3. **Validation**: Barcode format is validated before API call
4. **Error Handling**: Graceful handling of API failures

## 🌍 OpenFoodFacts API Endpoints

### Available Endpoints

```
# Get product by barcode
GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json

# Search products
GET https://world.openfoodfacts.org/cgi/search.pl?search_terms={term}&json=1

# Get product by category
GET https://world.openfoodfacts.org/category/{category}.json

# Get products by brand
GET https://world.openfoodfacts.org/brand/{brand}.json
```

## 📈 Best Practices

1. **Cache Results**: Store OpenFoodFacts data locally to reduce API calls
2. **Fallback**: Have manual entry option if product not found
3. **Validation**: Always validate and review imported data
4. **Updates**: Periodically refresh product data
5. **Attribution**: Credit OpenFoodFacts in your UI

## 🎨 UI/UX Recommendations

1. **Barcode Scanner**: Integrate camera scanning for mobile
2. **Preview**: Show product preview before importing
3. **Edit**: Allow editing imported data
4. **Status**: Show import status (found/not found)
5. **History**: Keep import history

## 🐛 Troubleshooting

### Product Not Found

```
Error: "Product not found in Open Food Facts"
```

**Solutions:**
- Verify barcode is correct
- Try alternative barcodes
- Product may not be in database
- Enter product manually

### API Timeout

```
Error: "Failed to fetch from Open Food Facts"
```

**Solutions:**
- Check internet connection
- OpenFoodFacts might be down
- Implement retry logic
- Use cached data

### Invalid Barcode Format

```
Error: "Barcode required"
```

**Solutions:**
- Ensure barcode is not empty
- Remove whitespace
- Validate barcode format (usually 8-13 digits)

## 📚 Resources

- **OpenFoodFacts Website**: https://world.openfoodfacts.org/
- **API Documentation**: https://world.openfoodfacts.org/data
- **GitHub**: https://github.com/openfoodfacts
- **Slack Community**: https://slack.openfoodfacts.org/

## 🤝 Contributing to OpenFoodFacts

OOPshop users can contribute back:
1. Add missing products
2. Complete product information
3. Upload better images
4. Correct errors

## 💡 Future Enhancements

- [ ] Bulk barcode import from CSV
- [ ] Automatic nutritional label generation
- [ ] Product comparison feature
- [ ] Allergen detection
- [ ] Recipe suggestions
- [ ] Price comparison
- [ ] Multi-language support
- [ ] Offline mode with cached data

---

**Made possible by [OpenFoodFacts](https://world.openfoodfacts.org/) 🍎 - A free, open database of food products**


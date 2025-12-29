"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import { productService } from "@/lib/services/product.service";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import Image from "next/image";
import StockAdjustmentDialog from "@/components/inventory/StockAdjustmentDialog";
import StockHistory from "@/components/inventory/StockHistory";

interface Product {
  id: number;
  name: string;
  price: number;
  brand?: string;
  image_url?: string;
  category?: string;
  stock_quantity: number;
  nutritional_info?: any;
  open_food_facts_barcode?: string;
  created_at: string;
}

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockAdjustDialogOpen, setStockAdjustDialogOpen] = useState(false);

  const loadProduct = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const response = await productService.getProductById(Number(productId));
      if (response.status === 'success' && response.data) {
        setProduct(response.data);
      }
    } catch (err) {
      console.error("Error loading product:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!product) {
    return <Typography>Product not found</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            startIcon={<Inventory2Icon />}
            variant="outlined"
            onClick={() => setStockAdjustDialogOpen(true)}
          >
            Adjust Stock
          </Button>
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            onClick={() => router.push(`/dashboard/products/${productId}/edit`)}
          >
            Edit Product
          </Button>
        </Box>
      </Box>

      <Typography variant="h5" fontWeight={600} mb={3}>
        Product Details
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            {product.image_url ? (
              <Box
                sx={{
                  width: "100%",
                  height: 300,
                  position: "relative",
                  mb: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 300,
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No image available
                </Typography>
              </Box>
            )}

            <Typography variant="h6" mb={1}>
              {product.name}
            </Typography>
            <Typography variant="h5" color="primary" fontWeight={600} mb={2}>
              €{Number(product.price).toFixed(2)}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Brand
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {product.brand || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {product.category || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Stock Quantity
                </Typography>
                <Chip
                  label={product.stock_quantity}
                  size="small"
                  color={
                    product.stock_quantity === 0
                      ? "error"
                      : product.stock_quantity < 10
                      ? "warning"
                      : "success"
                  }
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                  size="small"
                  color={product.stock_quantity > 0 ? "success" : "error"}
                />
              </Grid>
              {product.open_food_facts_barcode && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Barcode
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {product.open_food_facts_barcode}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Nutritional Information
            </Typography>
            {product.nutritional_info ? (
              <Box>
                {product.nutritional_info.nutriments && (
                  <Box>
                    {Object.entries(product.nutritional_info.nutriments)
                      .filter(([key]) =>
                        [
                          "energy-kcal_100g",
                          "proteins_100g",
                          "carbohydrates_100g",
                          "fat_100g",
                          "fiber_100g",
                          "sugars_100g",
                        ].includes(key)
                      )
                      .map(([key, value]) => (
                        <Box key={key} sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {key.replace("_100g", "").replace("-", " ")}
                          </Typography>
                          <Typography variant="body1">{String(value)}</Typography>
                        </Box>
                      ))}
                  </Box>
                )}
                {product.nutritional_info.nutriscore_grade && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nutri-Score
                    </Typography>
                    <Chip
                      label={product.nutritional_info.nutriscore_grade.toUpperCase()}
                      size="small"
                    />
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No nutritional information available
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Stock History */}
      <Box sx={{ mt: 3 }}>
        <StockHistory productId={Number(productId)} />
      </Box>

      {/* Stock Adjustment Dialog */}
      {product && (
        <StockAdjustmentDialog
          open={stockAdjustDialogOpen}
          onClose={() => setStockAdjustDialogOpen(false)}
          product={product}
          onSuccess={() => {
            loadProduct();
          }}
        />
      )}
    </Box>
  );
}


'use client';

import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ProductPreviewProps {
  product: any;
}

export default function ProductPreview({ product }: ProductPreviewProps) {
  const nutriScore = product.nutritional_info?.nutriscore_grade?.toUpperCase();
  const nutriments = product.nutritional_info?.nutriments || {};

  // Nutri-Score color mapping
  const getNutriScoreColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: '#038141',
      B: '#85BB2F',
      C: '#FECB02',
      D: '#EE8100',
      E: '#E63E11',
    };
    return colors[grade] || '#999';
  };

  return (
    <Card elevation={3}>
      <Alert severity="success" icon={<CheckCircleIcon />}>
        Product found in OpenFoodFacts database!
      </Alert>

      {product.image_url && (
        <CardMedia
          component="img"
          height="300"
          image={product.image_url}
          alt={product.name}
          sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
        />
      )}

      <CardContent>
        {/* Product Name */}
        <Typography variant="h5" component="h2" gutterBottom>
          {product.name || 'Unknown Product'}
        </Typography>

        {/* Brand */}
        {product.brand && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Brand: <strong>{product.brand}</strong>
          </Typography>
        )}

        {/* Category */}
        {product.category && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label={product.category.replace('en:', '').replace(/-/g, ' ')}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>
        )}

        {/* Nutri-Score */}
        {nutriScore && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Nutri-Score
            </Typography>
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: getNutriScoreColor(nutriScore),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                padding: '8px 16px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              {nutriScore}
            </Box>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              From A (best) to E (worst)
            </Typography>
          </Box>
        )}

        {/* Nutritional Information */}
        {Object.keys(nutriments).length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Nutritional Information (per 100g)
            </Typography>
            <Table size="small">
              <TableBody>
                {nutriments['energy-kcal'] && (
                  <TableRow>
                    <TableCell>
                      <strong>Energy</strong>
                    </TableCell>
                    <TableCell align="right">
                      {nutriments['energy-kcal']} kcal
                    </TableCell>
                  </TableRow>
                )}
                {nutriments.fat !== undefined && (
                  <TableRow>
                    <TableCell>Fat</TableCell>
                    <TableCell align="right">{nutriments.fat}g</TableCell>
                  </TableRow>
                )}
                {nutriments['saturated-fat'] !== undefined && (
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>- Saturated</TableCell>
                    <TableCell align="right">
                      {nutriments['saturated-fat']}g
                    </TableCell>
                  </TableRow>
                )}
                {nutriments.carbohydrates !== undefined && (
                  <TableRow>
                    <TableCell>Carbohydrates</TableCell>
                    <TableCell align="right">
                      {nutriments.carbohydrates}g
                    </TableCell>
                  </TableRow>
                )}
                {nutriments.sugars !== undefined && (
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>- Sugars</TableCell>
                    <TableCell align="right">{nutriments.sugars}g</TableCell>
                  </TableRow>
                )}
                {nutriments.proteins !== undefined && (
                  <TableRow>
                    <TableCell>Proteins</TableCell>
                    <TableCell align="right">{nutriments.proteins}g</TableCell>
                  </TableRow>
                )}
                {nutriments.salt !== undefined && (
                  <TableRow>
                    <TableCell>Salt</TableCell>
                    <TableCell align="right">{nutriments.salt}g</TableCell>
                  </TableRow>
                )}
                {nutriments.fiber !== undefined && (
                  <TableRow>
                    <TableCell>Fiber</TableCell>
                    <TableCell align="right">{nutriments.fiber}g</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Barcode */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Barcode: {product.open_food_facts_barcode}
          </Typography>
        </Box>

        {/* Attribution */}
        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Data provided by{' '}
            <a
              href="https://world.openfoodfacts.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenFoodFacts
            </a>
            , a free and open database of food products.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}


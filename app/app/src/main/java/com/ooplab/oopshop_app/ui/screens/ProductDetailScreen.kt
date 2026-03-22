package com.ooplab.oopshop_app.ui.screens

import android.annotation.SuppressLint
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.SubcomposeAsyncImage
import coil.compose.SubcomposeAsyncImageContent
import coil.request.ImageRequest
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.dto.ProductRecommendationItemDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.ErrorView
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.ProductCard
import com.ooplab.oopshop_app.ui.components.ProductImagePlaceholder
import com.ooplab.oopshop_app.ui.components.showToast
import com.ooplab.oopshop_app.viewmodel.ProductsViewModel

private val NUTRITION_LABELS = mapOf(
    "energy_kcal" to "Kilocalories",
    "energy_kcal_100g" to "Kilocalories (per 100g)",
    "energy-kcal" to "Kilocalories",
    "energy-kcal_100g" to "Kilocalories (per 100g)",
    "energy" to "Energy",
    "energy_100g" to "Energy (per 100g)",
    "fat" to "Fat",
    "fat_100g" to "Fat (per 100g)",
    "saturated-fat" to "Saturated fat",
    "saturated-fat_100g" to "Saturated fat (per 100g)",
    "carbohydrates" to "Carbohydrates",
    "carbohydrates_100g" to "Carbohydrates (per 100g)",
    "sugars" to "Sugars",
    "sugars_100g" to "Sugars (per 100g)",
    "proteins" to "Protein",
    "proteins_100g" to "Protein (per 100g)",
    "salt" to "Salt",
    "salt_100g" to "Salt (per 100g)",
    "fiber" to "Fiber",
    "fiber_100g" to "Fiber (per 100g)",
    "sodium" to "Sodium",
    "sodium_100g" to "Sodium (per 100g)",
)

private fun humanReadableNutritionKey(key: String): String {
    val known = NUTRITION_LABELS[key]
    if (known != null) return known
    return key
        .replace("_100g", " (per 100g)")
        .replace("_", " ")
        .replaceFirstChar { it.uppercase() }
}

@Composable
private fun nutritionSection(nutritionalInfo: Map<String, Any>?) {
    if (nutritionalInfo.isNullOrEmpty()) return
    @Suppress("UNCHECKED_CAST")
    val flatMap: Map<String, Any> = when (val nutriments = nutritionalInfo["nutriments"]) {
        is Map<*, *> -> nutriments as Map<String, Any>
        else -> nutritionalInfo
    }
    val entries = flatMap.entries
        .filter { (_, value) -> value is Number || value is String }
        .filter { (key, _) -> key in NUTRITION_LABELS || !key.startsWith("_") }
        .take(12)
    if (entries.isEmpty()) return

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text(
            text = "Nutrition",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.primary
        )
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceContainerHighest
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 4.dp)
            ) {
                entries.forEachIndexed { index, (key, value) ->
                    if (index > 0) {
                        HorizontalDivider(
                            color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)
                        )
                    }
                    val label = humanReadableNutritionKey(key)
                    val valueStr = formatNutritionValue(value)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = label,
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.weight(1f)
                        )
                        Text(
                            text = valueStr,
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.End,
                            modifier = Modifier.padding(start = 12.dp)
                        )
                    }
                }
            }
        }
    }
}

@SuppressLint("DefaultLocale")
private fun formatNutritionValue(value: Any): String {
    return when (value) {
        is Double -> {
            if (kotlin.math.abs(value - value.toLong()) < 1e-9) value.toLong().toString() else String.format("%.2f", value)
        }
        is Float -> {
            if (kotlin.math.abs(value - value.toInt()) < 1e-5f) value.toInt().toString() else String.format("%.2f", value)
        }
        is Number -> value.toString()
        else -> value.toString()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    productId: Int,
    viewModel: ProductsViewModel,
    cartViewModel: com.ooplab.oopshop_app.viewmodel.CartViewModel,
    onBack: () -> Unit,
    onRecommendedProductClick: (Int) -> Unit = {},
    @SuppressLint("ModifierParameter") modifier: Modifier = Modifier
) {
    val resource by viewModel.productDetail.observeAsState(initial = Resource.Loading)
    val recommendationsRes by viewModel.productRecommendations.observeAsState(initial = Resource.Loading)
    val context = LocalContext.current
    val successProduct = (resource as? Resource.Success<ProductDto>)?.data
    var quantity by rememberSaveable(successProduct?.id ?: 0) { mutableIntStateOf(1) }
    LaunchedEffect(successProduct?.id) {
        quantity = 1
    }
    val maxQuantity = successProduct?.stockQuantity?.coerceAtLeast(1) ?: 1

    LaunchedEffect(productId) {
        viewModel.loadProductById(productId)
        viewModel.loadProductRecommendations(productId)
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Product",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        },
        bottomBar = {
            if (successProduct != null && resource is Resource.Success) {
                ProductDetailBottomBar(
                    stockQuantity = successProduct.stockQuantity,
                    maxQuantity = maxQuantity,
                    quantity = quantity,
                    onQuantityChange = { quantity = it },
                    onAddToCart = {
                        cartViewModel.addToCart(successProduct, quantity.coerceIn(1, maxQuantity))
                        showToast(context, "Added to cart")
                    }
                )
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (resource) {
                is Resource.Loading -> LoadingView()
                is Resource.Success -> {
                    val product = (resource as Resource.Success<ProductDto>).data
                    ProductDetailContent(
                        product = product,
                        recommendations = recommendationsRes,
                        onRecommendedProductClick = onRecommendedProductClick
                    )
                }
                is Resource.Error -> ErrorView(
                    message = (resource as Resource.Error).message,
                    onRetry = { viewModel.loadProductById(productId) }
                )
            }
        }
    }
}

@Composable
private fun ProductDetailBottomBar(
    stockQuantity: Int,
    maxQuantity: Int,
    quantity: Int,
    onQuantityChange: (Int) -> Unit,
    onAddToCart: () -> Unit
) {
    val q = quantity.coerceIn(1, maxQuantity)
    Surface(
        tonalElevation = 2.dp,
        shadowElevation = 8.dp,
        color = MaterialTheme.colorScheme.surfaceContainer
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = when {
                        stockQuantity <= 0 -> "Out of stock"
                        stockQuantity == 1 -> "1 in stock"
                        else -> "$stockQuantity in stock"
                    },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = if (stockQuantity <= 0) {
                        MaterialTheme.colorScheme.error
                    } else {
                        MaterialTheme.colorScheme.onSurface
                    },
                    modifier = Modifier
                        .weight(1f)
                        .padding(end = 12.dp),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "Qty",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    IconButton(
                        onClick = { onQuantityChange((q - 1).coerceAtLeast(1)) },
                        enabled = stockQuantity > 0 && q > 1
                    ) {
                        Icon(
                            imageVector = Icons.Default.Remove,
                            contentDescription = "Decrease"
                        )
                    }
                    Text(
                        text = "$q",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 4.dp)
                    )
                    IconButton(
                        onClick = { onQuantityChange((q + 1).coerceAtMost(maxQuantity)) },
                        enabled = stockQuantity > 0 && q < maxQuantity
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Increase"
                        )
                    }
                }
            }
            Button(
                onClick = onAddToCart,
                enabled = stockQuantity > 0,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Add to cart")
            }
        }
    }
}

@SuppressLint("DefaultLocale")
@Composable
private fun ProductDetailContent(
    product: ProductDto,
    recommendations: Resource<List<ProductRecommendationItemDto>>,
    onRecommendedProductClick: (Int) -> Unit = {}
) {
    val scrollState = rememberScrollState()
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .verticalScroll(scrollState),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
                val imageUrl = product.imageUrl
                val detailImageModifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp)
                    .clip(RoundedCornerShape(12.dp))
                if (!imageUrl.isNullOrBlank()) {
                    SubcomposeAsyncImage(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data(imageUrl)
                            .crossfade(true)
                            .build(),
                        contentDescription = product.name,
                        modifier = detailImageModifier,
                        contentScale = ContentScale.Crop,
                        loading = {
                            ProductImagePlaceholder(modifier = detailImageModifier, iconSizeDp = 64, showLabel = true)
                        },
                        success = { SubcomposeAsyncImageContent() },
                        error = {
                            ProductImagePlaceholder(modifier = detailImageModifier, iconSizeDp = 64, showLabel = true)
                        }
                    )
                } else {
                    ProductImagePlaceholder(
                        modifier = detailImageModifier,
                        iconSizeDp = 64,
                        showLabel = true
                    )
                }
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "$${String.format("%.2f", product.price)}",
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.SemiBold
                )
                product.brand?.let {
                    Text(
                        "Brand: $it",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                product.category?.let {
                    Text(
                        "Category: $it",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = "Description",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = product.description?.takeIf { it.isNotBlank() } ?: "No description",
                    style = MaterialTheme.typography.bodyLarge
                )
                RecommendedProductsSection(
                    recommendations = recommendations,
                    onProductClick = onRecommendedProductClick
                )
                nutritionSection(product.nutritionalInfo)

        }
    }
}

@Composable
private fun RecommendedProductsSection(
    recommendations: Resource<List<ProductRecommendationItemDto>>,
    onProductClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    when (recommendations) {
        is Resource.Loading -> {
            Row(
                modifier = modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Similar products",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                )
                CircularProgressIndicator(
                    modifier = Modifier
                        .width(20.dp)
                        .height(20.dp),
                    strokeWidth = 2.dp
                )
            }
        }
        is Resource.Error -> { /* omit section on failure */ }
        is Resource.Success -> {
            val list = recommendations.data
            if (list.isEmpty()) return
            Column(
                modifier = modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Similar products",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                )
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(vertical = 4.dp)
                ) {
                    items(list, key = { it.product!!.id }) { item ->
                        val p = item.product ?: return@items
                        ProductCard(
                            product = p,
                            onClick = { onProductClick(p.id) },
                            modifier = Modifier.width(160.dp)
                        )
                    }
                }
            }
        }
    }
}
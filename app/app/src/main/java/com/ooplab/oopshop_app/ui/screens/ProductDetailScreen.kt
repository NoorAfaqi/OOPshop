package com.ooplab.oopshop_app.ui.screens

import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
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
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.ErrorView
import com.ooplab.oopshop_app.ui.components.LoadingView
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
    Text(
        text = "Nutrition",
        style = MaterialTheme.typography.titleSmall,
        color = MaterialTheme.colorScheme.primary
    )
    entries.forEach { (key, value) ->
        val label = humanReadableNutritionKey(key)
        val valueStr = when (value) {
            is Number -> value.toString()
            else -> value.toString()
        }
        Text(
            text = "$label: $valueStr",
            style = MaterialTheme.typography.bodySmall
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    productId: Int,
    viewModel: ProductsViewModel,
    cartViewModel: com.ooplab.oopshop_app.viewmodel.CartViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val resource by viewModel.productDetail.observeAsState(initial = Resource.Loading)
    LaunchedEffect(productId) { viewModel.loadProductById(productId) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = { Text("Product") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (resource) {
                is Resource.Loading -> LoadingView()
                is Resource.Success -> {
                    val product = (resource as Resource.Success<ProductDto>).data
                    val context = LocalContext.current
                    ProductDetailContent(
                        product = product,
                        maxQuantity = product.stockQuantity.coerceAtLeast(1),
                        onAddToCart = { qty ->
                            cartViewModel.addToCart(product, qty)
                            showToast(context, "Added to cart")
                        }
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

@SuppressLint("DefaultLocale")
@Composable
private fun ProductDetailContent(
    product: ProductDto,
    maxQuantity: Int = 99,
    onAddToCart: (Int) -> Unit = {}
) {
    var quantity by rememberSaveable(product.id) { mutableIntStateOf(1) }
    quantity = quantity.coerceIn(1, maxQuantity)
    val scrollState = rememberScrollState()
    BoxWithConstraints(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        val scrollableHeight = maxHeight - 120.dp
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(scrollableHeight)
                    .verticalScroll(scrollState),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                val imageUrl = product.imageUrl
                if (!imageUrl.isNullOrBlank()) {
                    AsyncImage(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data(imageUrl)
                            .crossfade(true)
                            .build(),
                        contentDescription = product.name,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(240.dp)
                            .clip(RoundedCornerShape(12.dp)),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Spacer(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(240.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                    )
                }
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.headlineMedium
                )
                Text(
                    text = "$${String.format("%.2f", product.price)}",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.primary
                )
                product.brand?.let {
                    Text(
                        "Brand: $it",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
                product.category?.let {
                    Text(
                        "Category: $it",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                Text(
                    text = "Description",
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = product.description?.takeIf { it.isNotBlank() } ?: "No description",
                    style = MaterialTheme.typography.bodyMedium
                )
                Text("Stock: ${product.stockQuantity}", style = MaterialTheme.typography.bodyMedium)
                nutritionSection(product.nutritionalInfo)
            }
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text("Quantity", style = MaterialTheme.typography.titleSmall)
                IconButton(
                    onClick = { quantity = (quantity - 1).coerceAtLeast(1) }
                ) {
                    Icon(
                        imageVector = Icons.Default.Remove,
                        contentDescription = "Decrease"
                    )
                }
                Text("$quantity", style = MaterialTheme.typography.titleMedium)
                IconButton(
                    onClick = { quantity = (quantity + 1).coerceAtMost(maxQuantity) }
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Increase"
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = { onAddToCart(quantity) },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Add to cart")
            }
        }
    }
}
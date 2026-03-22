package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.api.BarcodeSuggestedProduct
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.AdminProductCard
import com.ooplab.oopshop_app.ui.components.BarcodeScannerDialog
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.showToast
import com.ooplab.oopshop_app.viewmodel.AdminViewModel

private val searchFieldShape = RoundedCornerShape(16.dp)
private val cardShape = RoundedCornerShape(16.dp)
/** Builds description text from Open Food Facts fields returned by the backend. */
private fun buildDescriptionFromOff(s: BarcodeSuggestedProduct): String {
    val parts = mutableListOf<String>()
    s.ingredients_text?.trim()?.takeIf { it.isNotEmpty() }?.let { parts.add(it) }
    formatOffQuantity(s.quantity)?.let { parts.add("Pack quantity: $it") }
    s.packaging?.trim()?.takeIf { it.isNotEmpty() }?.let { parts.add("Packaging: $it") }
    s.labels?.filter { it.isNotBlank() }?.takeIf { it.isNotEmpty() }?.let { labels ->
        parts.add("Labels: ${labels.joinToString(", ")}")
    }
    s.allergens?.filter { it.isNotBlank() }?.takeIf { it.isNotEmpty() }?.let { allergens ->
        parts.add("Allergens: ${allergens.joinToString(", ")}")
    }
    return parts.joinToString("\n\n")
}

private fun formatOffQuantity(q: Any?): String? {
    if (q == null) return null
    val str = when (q) {
        is String -> q.trim()
        else -> q.toString().trim()
    }
    return str.takeIf { it.isNotEmpty() }
}

@Composable
fun AdminProductsScreen(
    adminViewModel: AdminViewModel,
    onBack: () -> Unit,
    onProductClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val productsResource by adminViewModel.products.observeAsState(initial = Resource.Loading)
    val barcodeSuggestionResource by adminViewModel.barcodeSuggestion.observeAsState(initial = null)
    val createProductResource by adminViewModel.createProductResult.observeAsState(initial = null)

    var searchQuery by remember { mutableStateOf("") }
    var showBarcodeScanner by remember { mutableStateOf(false) }
    var showCreateDialog by remember { mutableStateOf(false) }
    var scanTarget by remember { mutableStateOf(ScanTarget.Search) }
    var createFormScannedBarcode by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(searchQuery) {
        adminViewModel.loadProducts(
            query = searchQuery.takeIf { it.isNotBlank() },
            forceRefresh = searchQuery.isNotBlank()
        )
    }

    LaunchedEffect(createProductResource) {
        when (val result = createProductResource) {
            is Resource.Success -> {
                showToast(context, "Product added successfully")
                showCreateDialog = false
                adminViewModel.clearCreateProductResult()
            }
            is Resource.Error -> showToast(context, result.message)
            else -> {}
        }
    }

    when (productsResource) {
        is Resource.Loading -> Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.surface),
            contentAlignment = Alignment.Center
        ) {
            LoadingView(Modifier)
        }
        is Resource.Success -> {
            val list = (productsResource as Resource.Success<List<ProductDto>>).data
            Column(
                modifier = modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                Column(
                    modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "Products",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Search, scan, or add catalog items",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    placeholder = { Text("Search by name or barcode") },
                    leadingIcon = {
                        Icon(
                            Icons.Default.Search,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    },
                    trailingIcon = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = {
                                scanTarget = ScanTarget.Search
                                showBarcodeScanner = true
                            }) {
                                Icon(
                                    Icons.Default.QrCodeScanner,
                                    contentDescription = "Scan barcode"
                                )
                            }
                            if (searchQuery.isNotBlank()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Clear, contentDescription = "Clear")
                                }
                            }
                        }
                    },
                    singleLine = true,
                    shape = searchFieldShape
                )
                FilledTonalButton(
                    onClick = { showCreateDialog = true },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 20.dp, end = 20.dp, top = 12.dp, bottom = 8.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Icon(
                        Icons.Default.Add,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.size(8.dp))
                    Text("Add product")
                }
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (list.isEmpty()) {
                        item {
                            EmptyProductsPlaceholder(
                                isSearch = searchQuery.isNotBlank()
                            )
                        }
                    } else {
                        items(list) { product ->
                            AdminProductCard(
                                product = product,
                                onClick = { onProductClick(product.id) }
                            )
                        }
                    }
                }
            }
        }
        is Resource.Error -> Column(
            modifier = modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
            ProductsErrorBanner((productsResource as Resource.Error).message)
        }
    }

    if (showBarcodeScanner) {
        BarcodeScannerDialog(
            title = "Scan product barcode",
            onDismiss = { showBarcodeScanner = false },
            onBarcodeScanned = { scannedCode ->
                when (scanTarget) {
                    ScanTarget.Search -> searchQuery = scannedCode
                    ScanTarget.CreateForm -> createFormScannedBarcode = scannedCode
                }
            }
        )
    }

    if (showCreateDialog) {
        AddProductDialog(
            barcodeSuggestionResource = barcodeSuggestionResource,
            createProductResource = createProductResource,
            onDismiss = {
                showCreateDialog = false
                createFormScannedBarcode = null
                adminViewModel.clearCreateProductResult()
                adminViewModel.clearBarcodeSuggestion()
            },
            onFetchByBarcode = { barcode -> adminViewModel.fetchProductFromBarcode(barcode) },
            onCreateProduct = { name, price, brand, category, imageUrl, description, stock, barcode, nutritionalInfo ->
                adminViewModel.createProduct(
                    name = name,
                    price = price,
                    brand = brand,
                    category = category,
                    imageUrl = imageUrl,
                    description = description,
                    nutritionalInfo = nutritionalInfo,
                    stockQuantity = stock,
                    barcode = barcode
                )
            },
            onRequestScanDialog = {
                scanTarget = ScanTarget.CreateForm
                showBarcodeScanner = true
            },
            scannedBarcodeFromGlobalDialog = createFormScannedBarcode
        )
    }
}

@Composable
private fun EmptyProductsPlaceholder(isSearch: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = cardShape,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Inventory2,
                contentDescription = null,
                modifier = Modifier.size(44.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.65f)
            )
            Text(
                text = if (isSearch) "No matching products" else "No products yet",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = if (isSearch) {
                    "Try another search or scan a barcode"
                } else {
                    "Add your first product to get started"
                },
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ProductsErrorBanner(message: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = cardShape,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.45f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Inventory2,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onErrorContainer
            )
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
        }
    }
}

private enum class ScanTarget { Search, CreateForm }

@Composable
private fun AddProductDialog(
    barcodeSuggestionResource: Resource<com.ooplab.oopshop_app.data.api.FromBarcodeResponse>?,
    createProductResource: Resource<ProductDto>?,
    onDismiss: () -> Unit,
    onRequestScanDialog: () -> Unit,
    onFetchByBarcode: (String) -> Unit,
    onCreateProduct: (
        name: String,
        price: Double,
        brand: String?,
        category: String?,
        imageUrl: String?,
        description: String?,
        stockQuantity: Int,
        barcode: String?,
        nutritionalInfo: Map<String, Any>?
    ) -> Unit,
    scannedBarcodeFromGlobalDialog: String?
) {
    var barcode by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var brand by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var imageUrl by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var stockQuantity by remember { mutableStateOf("0") }
    var nutritionalInfoForCreate by remember { mutableStateOf<Map<String, Any>?>(null) }

    LaunchedEffect(scannedBarcodeFromGlobalDialog) {
        val code = scannedBarcodeFromGlobalDialog
        if (!code.isNullOrBlank()) {
            barcode = code
            onFetchByBarcode(code)
        }
    }

    LaunchedEffect(barcodeSuggestionResource) {
        val suggestion = (barcodeSuggestionResource as? Resource.Success)?.data?.suggested ?: return@LaunchedEffect
        name = suggestion.name ?: name
        brand = suggestion.brand ?: brand
        category = suggestion.category ?: category
        imageUrl = suggestion.image_url ?: imageUrl
        barcode = suggestion.open_food_facts_barcode ?: barcode
        description = buildDescriptionFromOff(suggestion)
        nutritionalInfoForCreate = suggestion.nutritional_info
    }

    val isCreating = createProductResource is Resource.Loading
    val canCreate = name.isNotBlank() && (price.toDoubleOrNull() != null)

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add product") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = barcode,
                    onValueChange = { barcode = it },
                    label = { Text("Barcode (optional)") },
                    singleLine = true,
                    trailingIcon = {
                        Row {
                            IconButton(onClick = onRequestScanDialog) {
                                Icon(Icons.Default.QrCodeScanner, contentDescription = "Scan barcode")
                            }
                            IconButton(onClick = { onFetchByBarcode(barcode) }) {
                                Icon(Icons.Default.Search, contentDescription = "Fetch by barcode")
                            }
                        }
                    }
                )
                when (barcodeSuggestionResource) {
                    is Resource.Loading -> Text(
                        "Fetching product details from Open Food Facts…",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    is Resource.Error -> Text(
                        barcodeSuggestionResource.message,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                    is Resource.Success -> {
                        if (barcodeSuggestionResource.data.suggested != null) {
                            Text(
                                "Product details loaded — review and set price",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                    null -> {}
                }
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name *") }, singleLine = true)
                OutlinedTextField(value = price, onValueChange = { price = it }, label = { Text("Price *") }, singleLine = true)
                OutlinedTextField(value = stockQuantity, onValueChange = { stockQuantity = it }, label = { Text("Stock") }, singleLine = true)
                OutlinedTextField(value = brand, onValueChange = { brand = it }, label = { Text("Brand") }, singleLine = true)
                OutlinedTextField(value = category, onValueChange = { category = it }, label = { Text("Category") }, singleLine = true)
                OutlinedTextField(value = imageUrl, onValueChange = { imageUrl = it }, label = { Text("Image URL") }, singleLine = true)
                OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Description") })
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    onCreateProduct(
                        name.trim(),
                        price.toDoubleOrNull() ?: 0.0,
                        brand.trim().ifBlank { null },
                        category.trim().ifBlank { null },
                        imageUrl.trim().ifBlank { null },
                        description.trim().ifBlank { null },
                        stockQuantity.toIntOrNull() ?: 0,
                        barcode.trim().ifBlank { null },
                        nutritionalInfoForCreate
                    )
                },
                enabled = canCreate && !isCreating
            ) {
                Text(if (isCreating) "Saving..." else "Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

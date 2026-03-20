package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.TextButton
import androidx.compose.material3.Text
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
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.AdminProductCard
import com.ooplab.oopshop_app.ui.components.BarcodeScannerDialog
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.showToast
import com.ooplab.oopshop_app.viewmodel.AdminViewModel

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
        is Resource.Loading -> LoadingView(Modifier.fillMaxSize())
        is Resource.Success -> {
            val list = (productsResource as Resource.Success<List<ProductDto>>).data
            Column(
                modifier = modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    placeholder = { Text("Search products") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    trailingIcon = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = {
                                scanTarget = ScanTarget.Search
                                showBarcodeScanner = true
                            }) {
                                Icon(Icons.Default.QrCodeScanner, contentDescription = "Scan barcode")
                            }
                            if (searchQuery.isNotBlank()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Clear, contentDescription = "Clear")
                                }
                            }
                        }
                    },
                    singleLine = true
                )
                Button(
                    onClick = { showCreateDialog = true },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Text(" Add product")
                }
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (list.isEmpty()) {
                        item {
                            Text(
                                if (searchQuery.isBlank()) "No products" else "No matching products",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(16.dp)
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
        is Resource.Error -> {
            Column(Modifier.padding(16.dp)) {
                Text(
                    (productsResource as Resource.Error).message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error
                )
            }
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
            },
            onFetchByBarcode = { barcode -> adminViewModel.fetchProductFromBarcode(barcode) },
            onCreateProduct = { name, price, brand, category, imageUrl, description, stock, barcode ->
                adminViewModel.createProduct(
                    name = name,
                    price = price,
                    brand = brand,
                    category = category,
                    imageUrl = imageUrl,
                    description = description,
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
        barcode: String?
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

    LaunchedEffect(scannedBarcodeFromGlobalDialog) {
        if (!scannedBarcodeFromGlobalDialog.isNullOrBlank()) {
            barcode = scannedBarcodeFromGlobalDialog
        }
    }

    LaunchedEffect(barcodeSuggestionResource) {
        val suggestion = (barcodeSuggestionResource as? Resource.Success)?.data?.suggested ?: return@LaunchedEffect
        name = suggestion.name ?: name
        brand = suggestion.brand ?: brand
        category = suggestion.category ?: category
        imageUrl = suggestion.image_url ?: imageUrl
        barcode = suggestion.open_food_facts_barcode ?: barcode
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
                    is Resource.Loading -> Text("Fetching product details...", style = MaterialTheme.typography.bodySmall)
                    is Resource.Error -> Text(barcodeSuggestionResource.message, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                    else -> {}
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
                        barcode.trim().ifBlank { null }
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

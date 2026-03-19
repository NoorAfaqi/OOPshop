package com.ooplab.oopshop_app.ui.screens

import android.annotation.SuppressLint
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.calculateEndPadding
import androidx.compose.foundation.layout.calculateStartPadding
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.ErrorView
import com.ooplab.oopshop_app.ui.components.BarcodeScannerDialog
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.ProductCard
import com.ooplab.oopshop_app.viewmodel.ProductsViewModel
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShopScreen(
    viewModel: ProductsViewModel,
    onProductClick: (Int) -> Unit,
    onLoginClick: () -> Unit = {},
    showTopBar: Boolean = true,
    @SuppressLint("ModifierParameter") modifier: Modifier = Modifier
) {
    val resource by viewModel.products.observeAsState(initial = Resource.Loading)

    var searchQuery by remember { mutableStateOf("") }
    var debouncedQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf<String?>(null) }
    var sortBy by remember { mutableStateOf("created_at") }
    var sortOrder by remember { mutableStateOf("desc") }
    var allCategories by remember { mutableStateOf<List<String>>(emptyList()) }
    var sortExpanded by remember { mutableStateOf(false) }
    var showBarcodeScanner by remember { mutableStateOf(false) }

    LaunchedEffect(searchQuery) {
        delay(400)
        debouncedQuery = searchQuery
    }

    LaunchedEffect(debouncedQuery, selectedCategory, sortBy, sortOrder) {
        viewModel.loadProducts(
            query = debouncedQuery.takeIf { it.isNotBlank() },
            category = selectedCategory,
            sortBy = sortBy,
            sortOrder = sortOrder
        )
    }

    when (resource) {
        is Resource.Success -> {
            val list = (resource as Resource.Success<List<ProductDto>>).data
            if (selectedCategory == null) {
                val categories = list.mapNotNull { it.category }.distinct().sorted()
                if (categories.isNotEmpty()) allCategories = categories
            }
        }
        else -> { }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            if (showTopBar) {
                TopAppBar(
                    title = { Text("OOPshop", style = MaterialTheme.typography.titleLarge) },
                    actions = {
                        TextButton(onClick = onLoginClick) {
                            Text("Login")
                        }
                    }
                )
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(
                    top = 4.dp,
                    start = padding.calculateStartPadding(LayoutDirection.Ltr),
                    end = padding.calculateEndPadding(LayoutDirection.Rtl),
                    bottom = padding.calculateBottomPadding()
                )
                .fillMaxSize()
        ) {
            // Single compact bar: search + sort dropdown (one row, minimal height)
            CompactFilterBar(
                searchQuery = searchQuery,
                onSearchChange = { searchQuery = it },
                onSearchClear = { searchQuery = "" },
                onScanClick = { showBarcodeScanner = true },
                sortBy = sortBy,
                sortOrder = sortOrder,
                sortExpanded = sortExpanded,
                onSortExpandedChange = { sortExpanded = it },
                onSortSelect = { by, order ->
                    sortBy = by
                    sortOrder = order
                    sortExpanded = false
                }
            )
            // One slim row of category chips
            if (allCategories.isNotEmpty()) {
                CategoryChips(
                    categories = allCategories,
                    selectedCategory = selectedCategory,
                    onCategorySelect = { selectedCategory = it }
                )
            }
            // Rest of screen = product grid
            Box(modifier = Modifier.weight(1f).fillMaxSize()) {
                when (resource) {
                    is Resource.Loading -> LoadingView()
                    is Resource.Success -> {
                        val list = (resource as Resource.Success<List<ProductDto>>).data
                        if (list.isEmpty()) {
                            Box(Modifier.fillMaxSize()) {
                                Text(
                                    "No products found",
                                    style = MaterialTheme.typography.bodyLarge,
                                    modifier = Modifier.padding(24.dp)
                                )
                            }
                        } else {
                            LazyVerticalGrid(
                                columns = GridCells.Adaptive(minSize = 160.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp),
                                modifier = Modifier.fillMaxSize()
                            ) {
                                items(list, key = { it.id }) { product ->
                                    ProductCard(
                                        product = product,
                                        onClick = { onProductClick(product.id) }
                                    )
                                }
                            }
                        }
                    }
                    is Resource.Error -> ErrorView(
                        message = (resource as Resource.Error).message,
                        onRetry = { viewModel.refreshProducts() }
                    )
                }
            }
        }
    }

    if (showBarcodeScanner) {
        BarcodeScannerDialog(
            title = "Scan product barcode",
            onDismiss = { showBarcodeScanner = false },
            onBarcodeScanned = { scannedCode ->
                searchQuery = scannedCode
            }
        )
    }
}

@Composable
private fun CompactFilterBar(
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    onSearchClear: () -> Unit,
    onScanClick: () -> Unit,
    sortBy: String,
    sortOrder: String,
    sortExpanded: Boolean,
    onSortExpandedChange: (Boolean) -> Unit,
    onSortSelect: (sortBy: String, sortOrder: String) -> Unit,
    modifier: Modifier = Modifier
) {
    val sortOptions = listOf(
        "created_at" to Pair("Newest", "desc"),
        "created_at" to Pair("Oldest", "asc"),
        "price" to Pair("Price ↑", "asc"),
        "price" to Pair("Price ↓", "desc"),
        "name" to Pair("A–Z", "asc"),
        "name" to Pair("Z–A", "desc"),
        "stock_quantity" to Pair("In stock", "desc")
    )
    val sortLabel = sortOptions.find { it.first == sortBy && it.second.second == sortOrder }?.second?.first ?: "Sort"

    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(start = 12.dp, end = 12.dp, top = 2.dp, bottom = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchChange,
            modifier = Modifier.weight(1f),
            placeholder = { Text("Search", style = MaterialTheme.typography.bodyMedium) },
            leadingIcon = {
                Icon(
                    Icons.Default.Search,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
            },
            trailingIcon = {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onScanClick, modifier = Modifier.size(32.dp)) {
                        Icon(
                            Icons.Default.QrCodeScanner,
                            contentDescription = "Scan barcode",
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = onSearchClear, modifier = Modifier.size(32.dp)) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear", modifier = Modifier.size(18.dp))
                        }
                    }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(20.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.outline,
                unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
                focusedContainerColor = MaterialTheme.colorScheme.surface,
                unfocusedContainerColor = MaterialTheme.colorScheme.surface
            ),
            textStyle = MaterialTheme.typography.bodyMedium
        )
        Box {
            FilterChip(
                selected = false,
                onClick = { onSortExpandedChange(!sortExpanded) },
                label = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        Text(sortLabel, style = MaterialTheme.typography.labelMedium)
                        Icon(Icons.Default.ArrowDropDown, contentDescription = null, modifier = Modifier.size(20.dp))
                    }
                },
            )
            androidx.compose.material3.DropdownMenu(
                expanded = sortExpanded,
                onDismissRequest = { onSortExpandedChange(false) }
            ) {
                sortOptions.forEach { (by, pair) ->
                    DropdownMenuItem(
                        text = { Text(pair.first, style = MaterialTheme.typography.bodyMedium) },
                        onClick = { onSortSelect(by, pair.second) }
                    )
                }
            }
        }
    }
}

@Composable
private fun CategoryChips(
    categories: List<String>,
    selectedCategory: String?,
    onCategorySelect: (String?) -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    Row(
        modifier = modifier
            .fillMaxWidth()
            .horizontalScroll(scrollState)
            .padding(horizontal = 12.dp, vertical = 2.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        FilterChip(
            selected = selectedCategory == null,
            onClick = { onCategorySelect(null) },
            label = { Text("All", style = MaterialTheme.typography.labelSmall) }
        )
        categories.forEach { category ->
            FilterChip(
                selected = selectedCategory == category,
                onClick = { onCategorySelect(category) },
                label = { Text(category, style = MaterialTheme.typography.labelSmall) }
            )
        }
    }
}

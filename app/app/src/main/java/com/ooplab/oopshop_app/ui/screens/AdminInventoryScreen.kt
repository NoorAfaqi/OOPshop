package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.AdminProductCard
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.showToast
import com.ooplab.oopshop_app.viewmodel.AdminViewModel

@Composable
fun AdminInventoryScreen(
    adminViewModel: AdminViewModel,
    onBack: () -> Unit,
    onProductClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val lowStockResource by adminViewModel.lowStockProducts.observeAsState(initial = Resource.Loading)
    val adjustStockResult by adminViewModel.adjustStockResult.observeAsState(initial = null)
    var selectedProductForStock by remember { mutableStateOf<ProductDto?>(null) }
    var qtyInput by remember { mutableStateOf("") }
    var reasonInput by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        adminViewModel.loadLowStockProducts(forceRefresh = false)
    }

    LaunchedEffect(adjustStockResult) {
        when (val result = adjustStockResult) {
            is Resource.Success -> {
                showToast(context, "Stock updated successfully")
                selectedProductForStock = null
                qtyInput = ""
                reasonInput = ""
                adminViewModel.clearAdjustStockResult()
            }
            is Resource.Error -> showToast(context, result.message)
            else -> {}
        }
    }

    when (lowStockResource) {
        is Resource.Loading -> LoadingView(Modifier.fillMaxSize())
        is Resource.Success -> {
            val list = (lowStockResource as Resource.Success<List<ProductDto>>).data
            LazyColumn(
                modifier = modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (list.isEmpty()) {
                    item {
                        Text(
                            "No low stock products",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                } else {
                    items(list) { product ->
                        Column {
                            AdminProductCard(
                                product = product,
                                onClick = { onProductClick(product.id) }
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End
                            ) {
                                TextButton(
                                    onClick = {
                                        selectedProductForStock = product
                                        qtyInput = ""
                                        reasonInput = ""
                                    }
                                ) {
                                    Text("Add stock")
                                }
                            }
                        }
                    }
                }
            }
        }
        is Resource.Error -> {
            Column(Modifier.padding(16.dp)) {
                Text(
                    (lowStockResource as Resource.Error).message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }

    selectedProductForStock?.let { product ->
        val isSubmitting = adjustStockResult is Resource.Loading
        val qty = qtyInput.toIntOrNull()
        val canSubmit = qty != null && qty > 0 && !isSubmitting
        AlertDialog(
            onDismissRequest = {
                selectedProductForStock = null
                adminViewModel.clearAdjustStockResult()
            },
            title = { Text("Add stock: ${product.name}") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Current stock: ${product.stockQuantity}")
                    OutlinedTextField(
                        value = qtyInput,
                        onValueChange = { qtyInput = it.filter(Char::isDigit) },
                        label = { Text("Quantity to add") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = reasonInput,
                        onValueChange = { reasonInput = it },
                        label = { Text("Reason (optional)") },
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                TextButton(
                    enabled = canSubmit,
                    onClick = {
                        adminViewModel.addStock(
                            productId = product.id,
                            quantityToAdd = qty ?: 0,
                            reason = reasonInput
                        )
                    }
                ) {
                    Text(if (isSubmitting) "Saving..." else "Save")
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    selectedProductForStock = null
                    adminViewModel.clearAdjustStockResult()
                }) {
                    Text("Cancel")
                }
            }
        )
    }
}

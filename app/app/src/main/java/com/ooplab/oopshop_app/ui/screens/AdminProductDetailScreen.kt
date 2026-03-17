package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.viewmodel.ProductsViewModel

@Composable
fun AdminProductDetailScreen(
    productId: Int,
    productsViewModel: ProductsViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val productResource by productsViewModel.productDetail.observeAsState(initial = Resource.Loading)

    LaunchedEffect(productId) {
        productsViewModel.loadProductById(productId)
    }

    when (productResource) {
        is Resource.Loading -> LoadingView(Modifier.fillMaxSize())
        is Resource.Success -> {
            val product = (productResource as Resource.Success<ProductDto>).data
            Column(
                modifier = modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(product.name, style = MaterialTheme.typography.titleMedium)
                            Text("$${String.format("%.2f", product.price)}", style = MaterialTheme.typography.bodyLarge)
                            Text("Stock: ${product.stockQuantity}", style = MaterialTheme.typography.bodyMedium)
                            product.brand?.let { Text("Brand: $it", style = MaterialTheme.typography.bodySmall) }
                            product.category?.let { Text("Category: $it", style = MaterialTheme.typography.bodySmall) }
                            product.description?.let { Text("Description: $it", style = MaterialTheme.typography.bodySmall) }
                        }
                    }
                }
        }
        is Resource.Error -> {
            Column(Modifier.padding(16.dp)) {
                Text(
                    (productResource as Resource.Error).message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

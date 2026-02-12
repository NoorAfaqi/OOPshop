package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.OrderDetailDto
import com.ooplab.oopshop_app.data.dto.OrderItemDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.viewmodel.AccountViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderDetailScreen(
    orderId: Int,
    accountViewModel: AccountViewModel,
    onBack: () -> Unit,
    modifier: androidx.compose.ui.Modifier = androidx.compose.ui.Modifier
) {
    val resource by accountViewModel.orderDetail.observeAsState(initial = Resource.Loading)

    LaunchedEffect(orderId) { accountViewModel.loadOrderDetail(orderId) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = { Text("Order #$orderId") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        when (resource) {
            is Resource.Loading -> LoadingView(Modifier.padding(padding))
            is Resource.Success -> {
                val order = (resource as Resource.Success<OrderDetailDto>).data
                Column(
                    modifier = Modifier
                        .padding(padding)
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        "$${String.format("%.2f", order.totalAmount)}",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        "Status: ${order.status.replaceFirstChar { it.uppercase() }}",
                        style = MaterialTheme.typography.bodyLarge
                    )
                    order.createdAt?.let {
                        Text("Date: ${it.take(10)}", style = MaterialTheme.typography.bodyMedium)
                    }
                    order.items?.let { items ->
                        if (items.isNotEmpty()) {
                            Text(
                                "Items",
                                style = MaterialTheme.typography.titleMedium
                            )
                            items.forEach { item ->
                                OrderItemRow(item = item)
                            }
                        }
                    }
                    Spacer(modifier = Modifier.padding(8.dp))
                }
            }
            is Resource.Error -> {
                Column(
                    modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp)
                ) {
                    Text(
                        (resource as Resource.Error).message,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

@Composable
private fun OrderItemRow(
    item: OrderItemDto,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            "${item.name ?: "Item"} x ${item.quantity}",
            style = MaterialTheme.typography.bodyMedium
        )
        Text(
            "$${String.format("%.2f", item.unitPrice * item.quantity)}",
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

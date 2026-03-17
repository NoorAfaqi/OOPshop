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
import com.ooplab.oopshop_app.data.dto.InvoiceDetailDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.viewmodel.AdminViewModel

@Composable
fun AdminInvoiceDetailScreen(
    invoiceId: Int,
    adminViewModel: AdminViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val invoiceResource by adminViewModel.invoiceDetail.observeAsState(initial = Resource.Loading)

    LaunchedEffect(invoiceId) {
        adminViewModel.loadInvoiceById(invoiceId)
    }

    when (invoiceResource) {
        is Resource.Loading -> LoadingView(Modifier.fillMaxSize())
        is Resource.Success -> {
            val invoice = (invoiceResource as Resource.Success<InvoiceDetailDto>).data
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
                            Text("Total: $${String.format("%.2f", invoice.totalAmount ?: 0.0)}", style = MaterialTheme.typography.titleMedium)
                            Text("Status: ${invoice.status ?: "-"}", style = MaterialTheme.typography.bodyMedium)
                            invoice.createdAt?.let { Text("Date: $it", style = MaterialTheme.typography.bodySmall) }
                            invoice.firstName?.let { Text("Customer: $it ${invoice.lastName ?: ""}", style = MaterialTheme.typography.bodySmall) }
                            invoice.email?.let { Text("Email: $it", style = MaterialTheme.typography.bodySmall) }
                        }
                    }
                    Text("Items", style = MaterialTheme.typography.titleSmall)
                    invoice.items?.forEach { item ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(item.name ?: "Product #${item.productId}", style = MaterialTheme.typography.bodyMedium)
                                Text("Qty: ${item.quantity} × $${String.format("%.2f", item.unitPrice ?: 0.0)}", style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
        }
        is Resource.Error -> {
            Column(Modifier.padding(16.dp)) {
                Text(
                    (invoiceResource as Resource.Error).message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

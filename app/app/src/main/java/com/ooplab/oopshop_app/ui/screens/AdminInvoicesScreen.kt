package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.ooplab.oopshop_app.data.dto.InvoiceListItemDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.viewmodel.AdminViewModel

@Composable
fun AdminInvoicesScreen(
    adminViewModel: AdminViewModel,
    onBack: () -> Unit,
    onInvoiceClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val invoicesResource by adminViewModel.allInvoices.observeAsState(initial = Resource.Loading)

    LaunchedEffect(Unit) {
        adminViewModel.loadAllInvoices(forceRefresh = false)
    }

    when (invoicesResource) {
        is Resource.Loading -> LoadingView(Modifier.fillMaxSize())
        is Resource.Success -> {
            val list = (invoicesResource as Resource.Success<List<InvoiceListItemDto>>).data
            LazyColumn(
                modifier = modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (list.isEmpty()) {
                        item {
                            Text(
                                "No invoices",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(16.dp)
                            )
                        }
                    } else {
                        items(list) { invoice ->
                            Card(
                                modifier = Modifier.fillMaxWidth().clickable { onInvoiceClick(invoice.id) },
                                shape = androidx.compose.foundation.shape.RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
                                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text("Order #${invoice.id}", style = MaterialTheme.typography.titleSmall)
                                    Text("$${String.format("%.2f", invoice.totalAmount)}", style = MaterialTheme.typography.bodyMedium)
                                    Text(invoice.status, style = MaterialTheme.typography.labelSmall)
                                    invoice.email?.let { Text(it, style = MaterialTheme.typography.labelSmall) }
                                    invoice.createdAt?.let { Text(it.take(10), style = MaterialTheme.typography.labelSmall) }
                                }
                            }
                        }
                    }
                }
        }
        is Resource.Error -> {
            Column(Modifier.padding(16.dp)) {
                Text(
                    (invoicesResource as Resource.Error).message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}
